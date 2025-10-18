import "../../pages/courses/study-materials.css"

const AlgorithmicTradingDeployment = () => {
  return (
    <div className="study-material-container">
      <div className="study-material-header">
        <div className="material-icon">☁️</div>
        <h3 className="material-title">Deployment y Monitoreo</h3>
        <div className="study-badge">
          <span>Material de Estudio</span>
        </div>
      </div>

      <div className="study-content">
        <div className="content-section">
          <h4 className="section-subtitle">Puesta en producción y seguimiento de algoritmos</h4>
        </div>

        <div className="content-section">
          <h4 className="section-subtitle">☁️ Cloud Deployment</h4>
          <div className="concept-box">
            <h5>¿Por qué la Nube?</h5>
            <p className="section-text">
              El despliegue en la nube ofrece escalabilidad automática y disponibilidad 24/7, características esenciales
              para algoritmos de trading.
            </p>

            <div className="cloud-advantages">
              <div className="advantage-item">
                <span className="adv-icon">⏰</span>
                <div>
                  <h6>Disponibilidad 24/7</h6>
                  <p>Los mercados nunca duermen, tu algoritmo tampoco</p>
                </div>
              </div>
              <div className="advantage-item">
                <span className="adv-icon">📈</span>
                <div>
                  <h6>Escalabilidad</h6>
                  <p>Ajusta recursos según la demanda automáticamente</p>
                </div>
              </div>
              <div className="advantage-item">
                <span className="adv-icon">🔒</span>
                <div>
                  <h6>Seguridad</h6>
                  <p>Infraestructura segura y respaldos automáticos</p>
                </div>
              </div>
              <div className="advantage-item">
                <span className="adv-icon">💰</span>
                <div>
                  <h6>Costo-Efectivo</h6>
                  <p>Paga solo por lo que usas</p>
                </div>
              </div>
            </div>

            <div className="cloud-providers">
              <h6>Principales Proveedores:</h6>
              <div className="provider-grid">
                <div className="provider-item">
                  <h6>🟦 AWS</h6>
                  <p>EC2, Lambda, ECS</p>
                  <span className="provider-strength">Más completo</span>
                </div>
                <div className="provider-item">
                  <h6>🟦 Google Cloud</h6>
                  <p>Compute Engine, Cloud Functions</p>
                  <span className="provider-strength">ML/AI integrado</span>
                </div>
                <div className="provider-item">
                  <h6>🟦 Azure</h6>
                  <p>Virtual Machines, Functions</p>
                  <span className="provider-strength">Integración Microsoft</span>
                </div>
                <div className="provider-item">
                  <h6>🟦 DigitalOcean</h6>
                  <p>Droplets, App Platform</p>
                  <span className="provider-strength">Simplicidad</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="content-section">
          <h4 className="section-subtitle">🐳 Containerización</h4>
          <div className="concept-box">
            <h5>Docker para Trading Algorithms</h5>
            <p className="section-text">Los contenedores garantizan que tu algoritmo funcione igual en desarrollo y producción.</p>

            <div className="docker-benefits">
              <div className="benefit-item">
                <span className="benefit-icon">📦</span>
                <div>
                  <h6>Portabilidad</h6>
                  <p>Funciona igual en cualquier entorno</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🔄</span>
                <div>
                  <h6>Reproducibilidad</h6>
                  <p>Mismo comportamiento siempre</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">⚡</span>
                <div>
                  <h6>Despliegue Rápido</h6>
                  <p>Actualizaciones instantáneas</p>
                </div>
              </div>
            </div>

            <div className="code-example">
              <h6>Dockerfile Ejemplo:</h6>
              <pre>
                <code>{`FROM python:3.9-slim

WORKDIR /app

# Instalar dependencias
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copiar código
COPY . .

# Variables de entorno
ENV PYTHONPATH=/app
ENV TRADING_ENV=production

# Comando por defecto
CMD ["python", "main.py"]`}</code>
              </pre>
            </div>

            <div className="code-example">
              <h6>Docker Compose:</h6>
              <pre>
                <code>{`version: '3.8'
services:
  trading-bot:
    build: .
    environment:
      - API_KEY=\${API_KEY}
      - DATABASE_URL=\${DATABASE_URL}
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
      
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: trading
      POSTGRES_USER: trader
      POSTGRES_PASSWORD: \${DB_PASSWORD}`}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="content-section">
          <h4 className="section-subtitle">📊 Sistemas de Monitoreo</h4>
          <div className="concept-box">
            <h5>Supervisión Continua</h5>
            <p className="section-text">El monitoreo es crucial para detectar problemas y optimizar el rendimiento en tiempo real.</p>

            <div className="monitoring-layers">
              <div className="layer-item">
                <h6>🖥️ Infraestructura</h6>
                <p>CPU, memoria, disco, red</p>
                <div className="layer-tools">
                  <span>Prometheus</span>
                  <span>Grafana</span>
                  <span>CloudWatch</span>
                </div>
              </div>
              <div className="layer-item">
                <h6>📱 Aplicación</h6>
                <p>Logs, errores, performance</p>
                <div className="layer-tools">
                  <span>ELK Stack</span>
                  <span>Sentry</span>
                  <span>New Relic</span>
                </div>
              </div>
              <div className="layer-item">
                <h6>💼 Trading</h6>
                <p>P&L, drawdown, señales</p>
                <div className="layer-tools">
                  <span>Custom Dashboards</span>
                  <span>Slack Alerts</span>
                  <span>Email Reports</span>
                </div>
              </div>
            </div>

            <div className="monitoring-metrics">
              <h6>Métricas Clave a Monitorear:</h6>
              <div className="metrics-grid">
                <div className="metric-group">
                  <h6>📈 Trading Metrics</h6>
                  <ul className="section-points">
                    <li className="point-item"><span className="point-bullet">•</span>P&L en tiempo real</li>
                    <li className="point-item"><span className="point-bullet">•</span>Drawdown actual</li>
                    <li className="point-item"><span className="point-bullet">•</span>Número de operaciones</li>
                    <li className="point-item"><span className="point-bullet">•</span>Win rate</li>
                    <li className="point-item"><span className="point-bullet">•</span>Sharpe ratio</li>
                  </ul>
                </div>
                <div className="metric-group">
                  <h6>⚙️ System Metrics</h6>
                  <ul className="section-points">
                    <li className="point-item"><span className="point-bullet">•</span>Latencia de ejecución</li>
                    <li className="point-item"><span className="point-bullet">•</span>Uso de CPU/memoria</li>
                    <li className="point-item"><span className="point-bullet">•</span>Errores de conexión</li>
                    <li className="point-item"><span className="point-bullet">•</span>Uptime del sistema</li>
                    <li className="point-item"><span className="point-bullet">•</span>Velocidad de procesamiento</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="content-section">
          <h4 className="section-subtitle">🚨 Manejo de Errores</h4>
          <div className="concept-box">
            <h5>Error Handling Robusto</h5>
            <p className="section-text">Un sistema de trading debe manejar errores graciosamente para evitar pérdidas catastróficas.</p>

            <div className="error-types">
              <div className="error-category">
                <h6>🌐 Errores de Conexión</h6>
                <ul className="section-points">
                  <li className="point-item"><span className="point-bullet">•</span>Pérdida de conexión a internet</li>
                  <li className="point-item"><span className="point-bullet">•</span>API del broker caída</li>
                  <li className="point-item"><span className="point-bullet">•</span>Timeout de requests</li>
                  <li className="point-item"><span className="point-bullet">•</span>Rate limiting</li>
                </ul>
                <div className="error-solution">
                  <strong>Solución:</strong> Retry logic, conexiones redundantes, circuit breakers
                </div>
              </div>
              <div className="error-category">
                <h6>💰 Errores de Trading</h6>
                <ul className="section-points">
                  <li className="point-item"><span className="point-bullet">•</span>Órdenes rechazadas</li>
                  <li className="point-item"><span className="point-bullet">•</span>Fondos insuficientes</li>
                  <li className="point-item"><span className="point-bullet">•</span>Mercado cerrado</li>
                  <li className="point-item"><span className="point-bullet">•</span>Slippage excesivo</li>
                </ul>
                <div className="error-solution">
                  <strong>Solución:</strong> Validación previa, límites de riesgo, alertas inmediatas
                </div>
              </div>
            </div>

            <div className="code-example">
              <h6>Ejemplo de Error Handling:</h6>
              <pre>
                <code>{`import logging
from functools import wraps
import time

def retry_on_failure(max_retries=3, delay=1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    logging.error(f"Attempt {attempt + 1} failed: {e}")
                    if attempt == max_retries - 1:
                        # Último intento, enviar alerta crítica
                        send_critical_alert(f"Function {func.__name__} failed after {max_retries} attempts")
                        raise
                    time.sleep(delay * (2 ** attempt))  # Exponential backoff
            return None
        return wrapper
    return decorator

@retry_on_failure(max_retries=3)
def place_order(symbol, quantity, price):
    # Lógica para colocar orden
    pass`}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="content-section">
          <h4 className="section-subtitle">📈 Análisis de Performance</h4>
          <div className="concept-box">
            <h5>Evaluación Continua</h5>
            <p className="section-text">Analizar el rendimiento en tiempo real permite optimizaciones y ajustes oportunos.</p>

            <div className="performance-analysis">
              <div className="analysis-type">
                <h6>📊 Análisis en Tiempo Real</h6>
                <ul className="section-points">
                  <li className="point-item"><span className="point-bullet">•</span>P&L instantáneo</li>
                  <li className="point-item"><span className="point-bullet">•</span>Drawdown actual</li>
                  <li className="point-item"><span className="point-bullet">•</span>Exposición por activo</li>
                  <li className="point-item"><span className="point-bullet">•</span>Velocidad de ejecución</li>
                </ul>
              </div>
              <div className="analysis-type">
                <h6>📅 Análisis Periódico</h6>
                <ul className="section-points">
                  <li className="point-item"><span className="point-bullet">•</span>Reportes diarios/semanales</li>
                  <li className="point-item"><span className="point-bullet">•</span>Comparación con benchmark</li>
                  <li className="point-item"><span className="point-bullet">•</span>Análisis de atribución</li>
                  <li className="point-item"><span className="point-bullet">•</span>Drift de parámetros</li>
                </ul>
              </div>
            </div>

            <div className="dashboard-features">
              <h6>Features del Dashboard:</h6>
              <div className="feature-grid">
                <div className="feature-item">
                  <span className="feature-icon">📈</span>
                  <p>Gráficos de equity curve en tiempo real</p>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🎯</span>
                  <p>Alertas automáticas por límites</p>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📊</span>
                  <p>Métricas de riesgo actualizadas</p>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🔄</span>
                  <p>Comparación con backtesting</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="content-section">
          <h4 className="section-subtitle">🔧 CI/CD para Trading</h4>
          <div className="concept-box">
            <h5>Integración y Despliegue Continuo</h5>
            <p className="section-text">Automatizar el proceso de testing y despliegue reduce errores y acelera las actualizaciones.</p>

            <div className="cicd-pipeline">
              <div className="pipeline-stage">
                <span className="stage-number">1</span>
                <div>
                  <h6>Code Commit</h6>
                  <p>Push a repositorio Git</p>
                </div>
              </div>
              <div className="pipeline-stage">
                <span className="stage-number">2</span>
                <div>
                  <h6>Automated Tests</h6>
                  <p>Unit tests, backtests</p>
                </div>
              </div>
              <div className="pipeline-stage">
                <span className="stage-number">3</span>
                <div>
                  <h6>Build Container</h6>
                  <p>Docker image creation</p>
                </div>
              </div>
              <div className="pipeline-stage">
                <span className="stage-number">4</span>
                <div>
                  <h6>Deploy</h6>
                  <p>Rolling deployment</p>
                </div>
              </div>
            </div>

            <div className="code-example">
              <h6>GitHub Actions Example:</h6>
              <pre>
                <code>{`name: Trading Bot CI/CD

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.9
    - name: Install dependencies
      run: pip install -r requirements.txt
    - name: Run tests
      run: pytest tests/
    - name: Run backtest
      run: python backtest.py --validate
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - name: Deploy to production
      run: |
        docker build -t trading-bot .
        docker push $REGISTRY/trading-bot:latest
        kubectl set image deployment/trading-bot trading-bot=$REGISTRY/trading-bot:latest`}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="content-section">
          <h4 className="section-subtitle">💡 Best Practices de Deployment</h4>
          <div className="tips-grid">
            <div className="tip-item">
              <span className="tip-icon">🧪</span>
              <p>Siempre prueba en un entorno de staging antes de producción</p>
            </div>
            <div className="tip-item">
              <span className="tip-icon">🔄</span>
              <p>Implementa rollback automático si las métricas se degradan</p>
            </div>
            <div className="tip-item">
              <span className="tip-icon">📊</span>
              <p>Monitorea tanto métricas técnicas como de trading</p>
            </div>
            <div className="tip-item">
              <span className="tip-icon">🚨</span>
              <p>Configura alertas para situaciones críticas y límites de pérdida</p>
            </div>
          </div>
        </div>
      </div>

      <div className="study-footer">
        <div className="study-tip">
          <span className="tip-icon">💡</span>
          <span className="tip-text">Este material cubre los conceptos esenciales para deployment y monitoreo de algoritmos de trading</span>
        </div>
      </div>
    </div>
  )
}

export default AlgorithmicTradingDeployment