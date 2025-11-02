from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from typing import Dict, List, Any
from datetime import datetime
import numpy as np
import pandas as pd
import logging
import base64
import plotly.graph_objects as go
import plotly.io as pio
from plotly.subplots import make_subplots

from database.models import User
from api.auth import get_current_user
from mt5.data_provider import MT5DataProvider

router = APIRouter()
logger = logging.getLogger(__name__)
mt5_provider = MT5DataProvider()

# ---------------------------------------------------------
# Función auxiliar: generar datos mock
# ---------------------------------------------------------
def generate_mock_data(symbol: str, timeframe: str, periods: int = 100) -> pd.DataFrame:
    base_prices = {
        'EURUSD': 1.0850, 'GBPUSD': 1.2650, 'USDJPY': 148.50, 'AUDUSD': 0.6750,
        'USDCHF': 0.8950, 'USDCAD': 1.3450, 'EURJPY': 161.20, 'GBPJPY': 187.80
    }
    base_price = base_prices.get(symbol, 1.0850)
    freq_map = {'M1':'1min','M5':'5min','M15':'15min','M30':'30min','H1':'1H','H4':'4H','D1':'1D'}
    freq = freq_map.get(timeframe,'1H')
    timestamps = pd.date_range(end=datetime.now(), periods=periods, freq=freq)

    prices = []
    price = base_price
    for i in range(periods):
        vol = 0.3 if 'JPY' in symbol else 0.0003
        trend = np.sin(i * 0.05) * 0.0001
        noise = np.random.normal(0, vol * 0.5)
        if np.random.random() < 0.02:
            price += np.random.normal(0, vol)
        price += trend + noise
        price = max(price, 0.0001)
        prices.append(price)

    return pd.DataFrame({
        'Open': prices,
        'High': [p*(1+np.random.uniform(0,0.001)) for p in prices],
        'Low': [p*(1-np.random.uniform(0,0.001)) for p in prices],
        'Close': prices,
        'Volume': np.random.randint(100,1000, periods)
    }, index=timestamps)

# ---------------------------------------------------------
# Endpoint principal
# ---------------------------------------------------------
@router.post("/generate")
async def generate_chart_image(
    request_data: Dict[str, Any],  # ✅ Cambio 1: nombre más genérico
    current_user: User = Depends(get_current_user)
):
    try:
        # ✅ Cambio 2: Extraer datos de manera más flexible
        symbol = request_data.get("symbol")
        timeframe = request_data.get("timeframe", "H1")
        technical_analyses = request_data.get("technical_analyses", [])
        
        # ✅ Cambio 3: Buscar los precios en múltiples ubicaciones
        signal_data = request_data.get("signal_data", {})
        
        # Intentar obtener precios desde signal_data primero, luego desde el nivel superior
        entry_price = signal_data.get("entry_price") or request_data.get("entry_price")
        stop_loss = signal_data.get("stop_loss") or request_data.get("stop_loss")
        take_profit = signal_data.get("take_profit") or request_data.get("take_profit")
        signal_type = signal_data.get("signal_type") or request_data.get("signal_type", "buy")

        if not symbol:
            return JSONResponse(status_code=400, content={"error": "Symbol is required"})

        # ✅ Cambio 4: Validar y convertir precios a float
        try:
            entry_price = float(entry_price) if entry_price is not None else None
            stop_loss = float(stop_loss) if stop_loss is not None else None
            take_profit = float(take_profit) if take_profit is not None else None
        except (ValueError, TypeError) as e:
            logger.warning(f"Error converting prices to float: {e}")
            entry_price = None
            stop_loss = None
            take_profit = None

        # ✅ Cambio 5: Log detallado para debug
        logger.info(f"📊 Generating chart for {symbol} {timeframe}")
        logger.info(f"   Entry: {entry_price}, SL: {stop_loss}, TP: {take_profit}")
        logger.info(f"   Signal Type: {signal_type}")
        logger.info(f"   Technical Analyses: {len(technical_analyses)}")

        if not mt5_provider.connected:
            mt5_provider.connect()

        data = mt5_provider.get_realtime_data(symbol, timeframe, 200)
        if data is None or data.empty:
            logger.warning(f"No MT5 data for {symbol}, using mock data")
            data = generate_mock_data(symbol, timeframe, 200)

        chart_image_url = await create_enhanced_plotly_chart(
            data, symbol, timeframe, technical_analyses, 
            entry_price, stop_loss, take_profit, signal_type  # ✅ Pasar signal_type
        )

        return JSONResponse(content={
            "chart_image_url": chart_image_url,
            "symbol": symbol,
            "timeframe": timeframe,
            "generated_at": datetime.utcnow().isoformat(),
            "data_source": "mt5" if mt5_provider.connected else "mock",
            # ✅ Incluir en la respuesta para verificación
            "trading_levels": {
                "entry_price": entry_price,
                "stop_loss": stop_loss,
                "take_profit": take_profit
            }
        })

    except Exception as e:
        logger.error(f"❌ Error generating chart: {e}", exc_info=True)
        return JSONResponse(status_code=500, content={"error": str(e)})
# ---------------------------------------------------------
# Crear gráfico Plotly MEJORADO con todos los detalles
# ---------------------------------------------------------
async def create_enhanced_plotly_chart(
    data: pd.DataFrame,
    symbol: str,
    timeframe: str,
    technical_analyses: List[Dict[str, Any]],
    entry_price: float = None,
    stop_loss: float = None,
    take_profit: float = None,
    signal_type: str = "buy"  
) -> str:
    try:
        fig = go.Figure()

        # 1. CANDLESTICK con mejor styling
        fig.add_trace(go.Candlestick(
            x=data.index,
            open=data['Open'],
            high=data['High'],
            low=data['Low'],
            close=data['Close'],
            name=f'{symbol}',
            increasing_line_color='#00FFAA',
            increasing_fillcolor='#00FFAA',
            decreasing_line_color='#FF3366',
            decreasing_fillcolor='#FF3366',
            opacity=0.9,
            whiskerwidth=0.5,
            line=dict(width=1)
        ))

        shapes = []
        annotations = []
        legend_items = []

        # 2. NIVELES DE TRADING (Entry, SL, TP)
        trading_levels = [
            (entry_price, "#00FF88", "Entry", "dot", 2.5),
            (stop_loss, "#FF4444", "Stop Loss", "dash", 2),
            (take_profit, "#00FFFF", "Take Profit", "dash", 2)
        ]
        
        for price, color, label, dash, width in trading_levels:
            if price:
                shapes.append(dict(
                    type="line", xref="paper", yref="y",
                    x0=0, x1=1, y0=price, y1=price,
                    line=dict(color=color, width=width, dash=dash),
                    layer="below"
                ))
                annotations.append(dict(
                    x=0.98, y=price, xref='paper', yref='y',
                    text=f"<b>{label}</b>: {price:.5f}",
                    showarrow=False,
                    font=dict(color=color, size=10),
                    bgcolor="rgba(0,0,0,0.6)",
                    bordercolor=color,
                    borderwidth=1,
                    borderpad=4,
                    xanchor='right'
                ))
                legend_items.append(f"{label}: {price:.5f}")

        # 3. ANÁLISIS TÉCNICOS DETALLADOS
        for analysis in technical_analyses:
            atype = analysis.get("type")
            adata = analysis.get("data", {})
            confidence = analysis.get("confidence", 0)
            
            try:
                if atype == "support_resistance":
                    await draw_support_resistance_plotly(fig, adata, shapes, annotations, legend_items)
                    
                elif atype == "fibonacci":
                    await draw_fibonacci_plotly(fig, adata, data.index, shapes, annotations, legend_items)
                    
                elif atype == "elliott_wave":
                    await draw_elliott_waves_plotly(fig, adata, legend_items)
                    
                elif atype == "chart_patterns":
                    await draw_chart_patterns_plotly(fig, adata, legend_items)
                    
            except Exception as e:
                logger.warning(f"Error drawing {atype}: {e}")

        # 4. CUADRO DE LEYENDA VISUAL con ejemplos de líneas y colores
        if legend_items:
            # Crear HTML con ejemplos visuales
            legend_html = "<b style='color:#00FFFF; font-size:14px'>REFERENCIAS TÉCNICAS</b><br><br>"
            
            # Agrupar items por tipo
            trading_items = []
            support_resistance_items = []
            fibonacci_items = []
            elliott_items = []
            pattern_items = []
            
            for item in legend_items[:20]:
                if "Entry:" in item or "Stop Loss:" in item or "Take Profit:" in item:
                    trading_items.append(item)
                elif "Support:" in item or "Resistance:" in item:
                    support_resistance_items.append(item)
                elif "Fib" in item or "Fibonacci" in item:
                    fibonacci_items.append(item)
                elif "Elliott" in item:
                    elliott_items.append(item)
                else:
                    pattern_items.append(item)
            
            # Niveles de Trading
            if trading_items:
                legend_html += "<span style='color:#FFFFFF; font-weight:bold'>Niveles de Trading:</span><br>"
                for item in trading_items:
                    if "Entry:" in item:
                        legend_html += "━━━ <span style='color:#00FF88'>●</span> " + item + "<br>"
                    elif "Stop Loss:" in item:
                        legend_html += "━ ━ <span style='color:#FF4444'>●</span> " + item + "<br>"
                    elif "Take Profit:" in item:
                        legend_html += "━ ━ <span style='color:#00FFFF'>●</span> " + item + "<br>"
                legend_html += "<br>"
            
            # Soporte y Resistencia
            if support_resistance_items:
                legend_html += "<span style='color:#FFFFFF; font-weight:bold'>Soporte y Resistencia:</span><br>"
                for item in support_resistance_items[:5]:
                    if "Support:" in item:
                        legend_html += "··· <span style='color:#4ECDC4'>▬</span> " + item + "<br>"
                    else:
                        legend_html += "··· <span style='color:#FF6B6B'>▬</span> " + item + "<br>"
                legend_html += "<br>"
            
            # Fibonacci
            if fibonacci_items:
                legend_html += "<span style='color:#FFFFFF; font-weight:bold'>Retrocesos de Fibonacci:</span><br>"
                for item in fibonacci_items[:6]:
                    legend_html += "━ ━ <span style='color:#FFD700'>▬</span> " + item + "<br>"
                legend_html += "<br>"
            
            # Elliott Wave
            if elliott_items:
                legend_html += "<span style='color:#FFFFFF; font-weight:bold'>Ondas de Elliott:</span><br>"
                for item in elliott_items:
                    if "Impulse" in item:
                        legend_html += "━━━ <span style='color:#2C3E50'>▲</span> " + item + "<br>"
                    else:
                        legend_html += "━━━ <span style='color:#FF4444'>▲</span> " + item + "<br>"
                legend_html += "<br>"
            
            # Patrones
            if pattern_items:
                legend_html += "<span style='color:#FFFFFF; font-weight:bold'>Patrones Chartistas:</span><br>"
                for item in pattern_items[:3]:
                    legend_html += "━·━ <span style='color:#9370DB'>◆</span> " + item + "<br>"
            
            annotations.append(dict(
                x=0.02, y=0.98,
                xref='paper', yref='paper',
                text=legend_html,
                showarrow=False,
                font=dict(color="#FFFFFF", size=10, family="Arial"),
                align="left",
                bgcolor="rgba(15, 15, 30, 0.95)",
                bordercolor="#00FFFF",
                borderwidth=2,
                borderpad=12,
                xanchor='left',
                yanchor='top'
            ))

        # 5. LAYOUT PROFESIONAL
        fig.update_layout(
            title=dict(
                text=f"<b>{symbol} - {timeframe}</b> | Technical Analysis",
                font=dict(size=18, color="#00FFFF"),
                x=0.5,
                xanchor='center'
            ),
            template="plotly_dark",
            plot_bgcolor="#0a0a0a",
            paper_bgcolor="#0a0a0a",
            xaxis=dict(
                showgrid=True,
                gridcolor="#222222",
                gridwidth=0.5,
                rangeslider_visible=False,
                showline=True,
                linecolor="#00FFFF",
                linewidth=1
            ),
            yaxis=dict(
                showgrid=True,
                gridcolor="#222222",
                gridwidth=0.5,
                showline=True,
                linecolor="#00FFFF",
                linewidth=1,
                side='right'
            ),
            shapes=shapes,
            annotations=annotations,
            font=dict(color="white", family="Arial"),
            margin=dict(l=10, r=80, t=80, b=40),
            showlegend=False,  # Usamos anotaciones personalizadas
            hovermode='x unified',
            height=600
        )

        # 6. Renderizar OPTIMIZADO (más rápido)
        img_bytes = pio.to_image(fig, format="png", width=1200, height=600, scale=1.5)
        img_base64 = base64.b64encode(img_bytes).decode()
        return f"data:image/png;base64,{img_base64}"

    except Exception as e:
        logger.error(f"Error creating enhanced chart: {e}", exc_info=True)
        raise

# ---------------------------------------------------------
# FUNCIONES DE DIBUJO DETALLADAS
# ---------------------------------------------------------

async def draw_support_resistance_plotly(fig, data, shapes, annotations, legend_items):
    """Dibuja niveles de soporte y resistencia con detalles"""
    levels = data.get('levels', [])
    
    for lvl in levels[:10]:
        price = lvl.get("price")
        level_type = lvl.get("type")
        touches = lvl.get("touches", 0)
        strength = lvl.get("strength", 0)
        
        if price and touches > 30:
            color = "#FF6B6B" if level_type == "resistance" else "#4ECDC4"
            alpha = min(0.3 + (strength * 0.5), 0.8)
            width = 1 + (strength * 1.5)
            
            shapes.append(dict(
                type="line", xref="paper", yref="y",
                x0=0, x1=1, y0=price, y1=price,
                line=dict(color=color, width=width, dash="dot"),
                opacity=alpha,
                layer="below"
            ))
            
            # Etiqueta con información
            annotations.append(dict(
                x=0.01, y=price, xref='paper', yref='y',
                text=f"{level_type[0].upper()}: {price:.5f} ({touches} touches)",
                showarrow=False,
                font=dict(color=color, size=8),
                bgcolor="rgba(0,0,0,0.5)",
                bordercolor=color,
                borderwidth=1,
                xanchor='left'
            ))
            
            legend_items.append(f"{level_type.title()}: {price:.5f} (Str: {strength:.2f})")

async def draw_fibonacci_plotly(fig, data, dates, shapes, annotations, legend_items):
    """Dibuja retrocesos de Fibonacci con zonas"""
    swing_high = data.get("swing_high")
    swing_low = data.get("swing_low")
    levels = data.get("levels", [])
    
    if not (swing_high and swing_low):
        return
    
    # Líneas de swing principales
    for price, label, color in [(swing_high, "Swing High", "#FFAA00"), 
                                  (swing_low, "Swing Low", "#FFAA00")]:
        shapes.append(dict(
            type="line", xref="paper", yref="y",
            x0=0, x1=1, y0=price, y1=price,
            line=dict(color=color, width=2, dash="solid"),
            layer="below"
        ))
    
    legend_items.append(f"Fibonacci: {swing_high:.5f} → {swing_low:.5f}")
    
    # Niveles de Fibonacci con zonas
    fib_ratios = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0]
    fib_colors = ["#FFD700", "#FFA500", "#FF8C00", "#FF6347", "#FF4500", "#DC143C", "#8B0000"]
    
    for lvl in levels[:8]:
        price = lvl.get("price")
        ratio = lvl.get("ratio")
        strength = lvl.get("strength", 0)
        
        if price and strength > 0.2:
            idx = min(int(ratio * 6), 6)
            color = fib_colors[idx]
            alpha = 0.3 + (strength * 0.5)
            
            shapes.append(dict(
                type="line", xref="paper", yref="y",
                x0=0, x1=1, y0=price, y1=price,
                line=dict(color=color, width=1.5, dash="dash"),
                opacity=alpha,
                layer="below"
            ))
            
            # Zona de Fibonacci (rectángulo translúcido)
            zone_height = abs(swing_high - swing_low) * 0.01
            shapes.append(dict(
                type="rect", xref="paper", yref="y",
                x0=0, x1=1, y0=price - zone_height, y1=price + zone_height,
                fillcolor=color,
                opacity=0.15,
                line=dict(width=0),
                layer="below"
            ))
            
            annotations.append(dict(
                x=0.98, y=price, xref='paper', yref='y',
                text=f"<b>Fib {ratio*100:.1f}%</b>",
                showarrow=False,
                font=dict(color=color, size=9),
                xanchor='right'
            ))
            
            legend_items.append(f"Fib {ratio*100:.1f}%: {price:.5f}")

async def draw_elliott_waves_plotly(fig, data, legend_items):
    """Dibuja ondas de Elliott con líneas y marcadores - VERSIÓN COMPATIBLE CON KALEIDO"""
    pattern = data.get("pattern", {})
    waves = pattern.get("waves", [])
    
    if len(waves) < 3:
        logger.warning("Not enough Elliott waves to draw")
        return
    
    wave_points = []
    logger.info(f"Processing {len(waves)} Elliott waves")
    
    # Procesar puntos de onda
    for i, w in enumerate(waves[:8]):
        try:
            ts = pd.to_datetime(w.get("timestamp"))
            price = float(w.get("price", 0))
            wave_label = w.get("label", str(i+1))
            wave_type = w.get("type", "high")
            if price > 0:
                wave_points.append({
                    'time': ts,
                    'price': price,
                    'label': wave_label,
                    'type': wave_type
                })
                logger.debug(f"Wave {wave_label}: {ts} @ {price}")
        except Exception as e:
            logger.warning(f"Error processing wave {i}: {e}")
            continue
    
    if len(wave_points) < 3:
        logger.warning(f"Only {len(wave_points)} valid wave points found")
        return
    
    logger.info(f"Drawing {len(wave_points)} Elliott wave points")
    
    # Colores para diferentes tipos de ondas
    impulse_color = "#00BFFF"  # Azul cyan para impulsos
    correction_color = "#FF6B6B"  # Rojo para correcciones
    internal_correction_color = "#FFA500"  # Naranja para ondas 2 y 4
    
    # Determinar si es impulso o corrección
    labels = [wp['label'] for wp in wave_points]
    is_corrective = any(label in ['A', 'B', 'C', 'a', 'b', 'c'] for label in labels)
    
    main_color = correction_color if is_corrective else impulse_color
    
    # 1. DIBUJAR LÍNEAS PRINCIPALES ENTRE PUNTOS DE ONDA
    x_coords = [wp['time'] for wp in wave_points]
    y_coords = [wp['price'] for wp in wave_points]
    
    # Línea principal del patrón (más gruesa)
    fig.add_trace(go.Scatter(
        x=x_coords,
        y=y_coords,
        mode="lines",
        line=dict(
            color=main_color,
            width=4,
            shape='linear'
        ),
        showlegend=False,
        hoverinfo='skip',
        name="Elliott Wave Pattern"
    ))
    
    # 2. DIBUJAR SEGMENTOS INDIVIDUALES CON COLORES ESPECÍFICOS
    for idx in range(len(wave_points) - 1):
        start_point = wave_points[idx]
        end_point = wave_points[idx + 1]
        
        # Determinar color del segmento según el tipo de onda
        start_label = start_point['label']
        if start_label in ['A', 'B', 'C', 'a', 'b', 'c']:
            segment_color = correction_color
            segment_width = 3
        elif start_label in ['2', '4']:
            segment_color = internal_correction_color
            segment_width = 3
        else:
            segment_color = impulse_color
            segment_width = 3
        
        # Dibujar segmento individual
        fig.add_trace(go.Scatter(
            x=[start_point['time'], end_point['time']],
            y=[start_point['price'], end_point['price']],
            mode="lines",
            line=dict(
                color=segment_color,
                width=segment_width,
                shape='linear'
            ),
            showlegend=False,
            hoverinfo='skip'
        ))
    
    # 3. DIBUJAR PUNTOS DE ONDA CON ETIQUETAS (TODO EN UN SOLO TRACE)
    wave_x = []
    wave_y = []
    wave_text = []
    wave_marker_color = []
    
    for wp in wave_points:
        wave_x.append(wp['time'])
        wave_y.append(wp['price'])
        wave_text.append(f"<b>{wp['label']}</b>")
        
        # Determinar color del punto según tipo de onda
        label = wp['label']
        if label in ['A', 'B', 'C', 'a', 'b', 'c']:
            point_color = correction_color
        elif label in ['2', '4']:
            point_color = internal_correction_color
        else:
            point_color = impulse_color
        
        wave_marker_color.append(point_color)
    
    # Agregar todos los puntos en un solo trace (más eficiente)
    fig.add_trace(go.Scatter(
        x=wave_x,
        y=wave_y,
        mode="markers+text",
        marker=dict(
            size=18,
            color=wave_marker_color,
            line=dict(color="#FFFFFF", width=3),
            symbol="circle"
        ),
        text=wave_text,
        textposition="top center",
        textfont=dict(
            color=wave_marker_color,
            size=14,
            family="Arial Black"
        ),
        showlegend=False,
        hovertemplate="<b>Wave %{text}</b><br>Price: %{y:.5f}<br>Time: %{x}<extra></extra>"
    ))
    
    # 4. AGREGAR A LA LEYENDA
    wave_type = "Corrective (A-B-C)" if is_corrective else "Impulse (1-2-3-4-5)"
    wave_count = len(wave_points)
    legend_items.append(f"Elliott Wave: {wave_type} ({wave_count} waves)")
    
    logger.info(f"✅ Successfully drew {wave_count} Elliott wave points (Kaleido compatible)")

async def draw_chart_patterns_plotly(fig, data, legend_items):
    """Dibuja patrones chartistas (triángulos, cabeza y hombros, etc.)"""
    patterns = data.get("patterns", [])
    
    pattern_colors = {
        "head_shoulders": "#9370DB",
        "triangle": "#FFD700",
        "wedge": "#FF6347",
        "channel": "#4169E1",
        "double_top": "#FF1493",
        "double_bottom": "#00CED1"
    }
    
    for p in patterns[:5]:
        ptype = p.get("type", "unknown")
        points = p.get("points", [])
        confidence = p.get("confidence", 0)
        
        if len(points) < 2 or confidence < 0.4:
            continue
        
        pattern_points = []
        for pt in points:
            try:
                ts = pd.to_datetime(pt["time"])
                price = pt["price"]
                pattern_points.append((ts, price))
            except:
                continue
        
        if len(pattern_points) < 2:
            continue
        
        x_vals, y_vals = zip(*pattern_points)
        color = pattern_colors.get(ptype, "#9370DB")
        
        # Línea del patrón
        fig.add_trace(go.Scatter(
            x=x_vals, y=y_vals,
            mode="lines+markers",
            line=dict(color=color, width=2, dash="dot"),
            marker=dict(size=8, color=color, symbol="diamond"),
            name=f"Pattern: {ptype}",
            showlegend=False
        ))
        
        # Área sombreada del patrón
        if len(pattern_points) >= 3:
            fig.add_trace(go.Scatter(
                x=list(x_vals) + [x_vals[0]],
                y=list(y_vals) + [y_vals[0]],
                fill="toself",
                fillcolor=color,
                opacity=0.15,
                line=dict(width=0),
                showlegend=False,
                hoverinfo='skip'
            ))
        
        # Etiqueta del patrón
        mid_x = x_vals[len(x_vals)//2]
        mid_y = sum(y_vals) / len(y_vals)
        
        fig.add_annotation(
            x=mid_x, y=mid_y,
            text=f"<b>{ptype.replace('_', ' ').title()}</b><br>{confidence*100:.0f}%",
            showarrow=True,
            arrowhead=3,
            arrowcolor=color,
            font=dict(color=color, size=10),
            bgcolor="rgba(0,0,0,0.8)",
            bordercolor=color,
            borderwidth=2
        )
        
        legend_items.append(f"{ptype.replace('_', ' ').title()}: {confidence*100:.0f}% conf")
