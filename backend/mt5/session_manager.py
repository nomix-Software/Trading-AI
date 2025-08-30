from __future__ import annotations
import MetaTrader5 as mt5
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any, Set
import threading
import logging
import time
import asyncio
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class SessionRequest:
    user_id: str
    login: Optional[str] = None
    password: Optional[str] = None
    server: Optional[str] = None
    priority: int = 0 
    timestamp: datetime = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.utcnow()

class MT5SessionManager:
    """
    Maneja UNA sesión MT5 global con cola de usuarios.
    Solo un usuario conectado a la vez, con sistema de turnos inteligente.
    """
    
    def __init__(self):
        self._lock = threading.RLock()
        self._current_session: Optional[Dict[str, Any]] = None
        self._session_queue: List[SessionRequest] = []
        self._user_timeouts: Dict[str, datetime] = {}
        self._connection_history: Dict[str, datetime] = {}
        
        # Configuración
        self.MAX_SESSION_TIME = timedelta(minutes=15)  
        self.IDLE_TIMEOUT = timedelta(minutes=5)   
        self.QUEUE_TIMEOUT = timedelta(minutes=2)   
        

        self._shutdown_in_progress = False
        self._last_activity: Optional[datetime] = None
        
    def request_session(self, user_id: str, login: str = None, password: str = None, 
                       server: str = None, priority: int = 0) -> Dict[str, Any]:
        """
        Solicita una sesión MT5. Retorna inmediatamente el estado.
        """
        with self._lock:
            request = SessionRequest(
                user_id=user_id,
                login=login,
                password=password, 
                server=server,
                priority=priority
            )
            

            if self._is_current_user(user_id):
                self._last_activity = datetime.utcnow()
                return self._get_session_info(user_id)

            existing_idx = self._find_in_queue(user_id)
            if existing_idx >= 0:
                self._session_queue[existing_idx] = request
            else:
                self._insert_in_queue(request)
            

            self._process_queue()
            
            return self._get_session_info(user_id)
    
    def release_session(self, user_id: str) -> bool:
        """
        Libera explícitamente la sesión del usuario.
        """
        with self._lock:
            if not self._is_current_user(user_id):

                self._remove_from_queue(user_id)
                return True
            
            logger.info(f"[SessionManager] Usuario {user_id} liberando sesión explícitamente")
            self._cleanup_current_session()
            self._process_queue()
            return True
    
    def get_session_status(self, user_id: str) -> Dict[str, Any]:
        """
        Obtiene el estado de la sesión para un usuario.
        """
        with self._lock:
            return self._get_session_info(user_id)
    
    def heartbeat(self, user_id: str) -> Dict[str, Any]:
        """
        Mantiene viva la sesión del usuario actual.
        """
        with self._lock:
            if self._is_current_user(user_id):
                self._last_activity = datetime.utcnow()
                return {"status": "active", "message": "Session extended"}
            return {"status": "not_current", "message": "Not your session"}
    
    def force_cleanup(self) -> Dict[str, Any]:
        """
        Fuerza la limpieza de todas las sesiones.
        """
        with self._lock:
            logger.warning("[SessionManager] Forzando limpieza de todas las sesiones")
            self._cleanup_current_session()
            self._session_queue.clear()
            self._user_timeouts.clear()
            return {"status": "cleaned", "message": "All sessions cleaned"}
    
    #  MÉTODOS PRIVADOS 
    
    def _is_current_user(self, user_id: str) -> bool:
        """Verifica si el user_id tiene la sesión actual."""
        return (self._current_session is not None and 
                self._current_session.get("user_id") == user_id)
    
    def _find_in_queue(self, user_id: str) -> int:
        """Encuentra la posición del usuario en la cola. -1 si no está."""
        for i, req in enumerate(self._session_queue):
            if req.user_id == user_id:
                return i
        return -1
    
    def _insert_in_queue(self, request: SessionRequest):
        """Inserta en la cola ordenada por prioridad y timestamp."""
        self._session_queue.append(request)
        self._session_queue.sort(key=lambda x: (-x.priority, x.timestamp))
    
    def _remove_from_queue(self, user_id: str) -> bool:
        """Remueve usuario de la cola."""
        original_len = len(self._session_queue)
        self._session_queue = [req for req in self._session_queue if req.user_id != user_id]
        return len(self._session_queue) < original_len
    
    def _process_queue(self):
        """
        Procesa la cola de sesiones. Cambia sesión si es necesario.
        """
        if self._shutdown_in_progress:
            return
            

        now = datetime.utcnow()
        self._session_queue = [
            req for req in self._session_queue 
            if now - req.timestamp < self.QUEUE_TIMEOUT
        ]
        

        should_switch = False
        
        if self._current_session:
            current_user = self._current_session["user_id"]
            session_start = self._current_session["connected_at"]
            

            if now - session_start > self.MAX_SESSION_TIME:
                logger.info(f"[SessionManager] Sesión de {current_user} expirada por tiempo máximo")
                should_switch = True
            

            elif (self._last_activity and 
                  now - self._last_activity > self.IDLE_TIMEOUT):
                logger.info(f"[SessionManager] Sesión de {current_user} expirada por inactividad")
                should_switch = True
            

            elif (self._session_queue and 
                  self._session_queue[0].priority > self._current_session.get("priority", 0)):
                logger.info(f"[SessionManager] Cambiando sesión por prioridad mayor")
                should_switch = True
        

        elif self._session_queue:
            should_switch = True
        
        if should_switch:
            self._switch_session()
    
    def _switch_session(self):
        """
        Cambia a la siguiente sesión en la cola.
        """
        if self._shutdown_in_progress:
            return
            
        # Cleanup sesión actual
        if self._current_session:
            self._cleanup_current_session()
        

        if not self._session_queue:
            return
            
        next_request = self._session_queue.pop(0)
        
        # Intentar conectar
        success = self._establish_connection(next_request)
        
        if success:
            logger.info(f"[SessionManager] Sesión establecida para {next_request.user_id}")
        else:
            logger.warning(f"[SessionManager] Falló conexión para {next_request.user_id}")

            if self._session_queue:
                self._switch_session()
    
    def _establish_connection(self, request: SessionRequest) -> bool:
        """
        Establece la conexión MT5 para la request.
        """
        try:
            self._shutdown_in_progress = True
            

            try:
                mt5.shutdown()
                time.sleep(0.1)  
            except Exception:
                pass

            init_kwargs = {"timeout": 10000}
            
            if request.login and request.password and request.server:
                init_kwargs.update({
                    "login": int(request.login),
                    "password": request.password,
                    "server": request.server
                })
            
            if not mt5.initialize(**init_kwargs):
                logger.error(f"[SessionManager] Initialize falló: {mt5.last_error()}")
                return False
            

            info = mt5.account_info()
            if not info:
                logger.error(f"[SessionManager] account_info() retornó None")
                mt5.shutdown()
                return False
            
            # Crear sesión exitosa
            now = datetime.utcnow()
            self._current_session = {
                "user_id": request.user_id,
                "login": str(info.login),
                "server": getattr(info, "server", request.server),
                "connected_at": now,
                "priority": request.priority,
                "account_info": {
                    "login": str(info.login),
                    "name": getattr(info, "name", None),
                    "currency": getattr(info, "currency", None),
                    "balance": float(getattr(info, "balance", 0.0)),
                    "equity": float(getattr(info, "equity", 0.0)),
                    "margin": float(getattr(info, "margin", 0.0)),
                    "margin_free": float(getattr(info, "margin_free", 0.0)),
                    "leverage": int(getattr(info, "leverage", 0)),
                }
            }
            
            self._last_activity = now
            self._connection_history[request.user_id] = now
            
            return True
            
        except Exception as e:
            logger.exception(f"[SessionManager] Error estableciendo conexión: {e}")
            try:
                mt5.shutdown()
            except Exception:
                pass
            return False
        finally:
            self._shutdown_in_progress = False
    
    def _cleanup_current_session(self):
        """
        Limpia la sesión actual.
        """
        if self._current_session:
            user_id = self._current_session["user_id"]
            logger.info(f"[SessionManager] Limpiando sesión de {user_id}")
        
        try:
            mt5.shutdown()
        except Exception as e:
            logger.warning(f"[SessionManager] Warning en shutdown: {e}")
        
        self._current_session = None
        self._last_activity = None
    
    def _get_session_info(self, user_id: str) -> Dict[str, Any]:
        """
        Retorna información completa del estado de sesión para el usuario.
        """
        now = datetime.utcnow()
        
        # Si es el usuario actual
        if self._is_current_user(user_id):
            session = self._current_session
            time_left = self.MAX_SESSION_TIME - (now - session["connected_at"])
            
            return {
                "status": "connected",
                "connected": True,
                "user_id": user_id,
                "login": session.get("login"),
                "server": session.get("server"),
                "connected_at": session["connected_at"].isoformat(),
                "time_left_seconds": max(0, int(time_left.total_seconds())),
                "account_info": session.get("account_info", {}),
                "queue_position": 0,
                "queue_length": len(self._session_queue),
            }
        
        # Si está en fila
        queue_pos = self._find_in_queue(user_id)
        if queue_pos >= 0:
            request = self._session_queue[queue_pos]
            wait_time = self.QUEUE_TIMEOUT - (now - request.timestamp)
            
            return {
                "status": "queued",
                "connected": False,
                "user_id": user_id,
                "queue_position": queue_pos + 1,
                "queue_length": len(self._session_queue),
                "estimated_wait_seconds": max(0, int(wait_time.total_seconds())),
                "priority": request.priority,
                "current_user": self._current_session["user_id"] if self._current_session else None,
            }
        
        # Usuario sin sesión
        return {
            "status": "disconnected", 
            "connected": False,
            "user_id": user_id,
            "queue_position": 0,
            "queue_length": len(self._session_queue),
            "current_user": self._current_session["user_id"] if self._current_session else None,
            "last_connection": (
                self._connection_history[user_id].isoformat() 
                if user_id in self._connection_history 
                else None
            ),
        }

#  WRAPPER COMPATIBLE 

class MT5DataProvider:
    """
    Wrapper compatible con tu API existente.
    Internamente usa el SessionManager.
    """
    
    def __init__(self, user_id: str, terminal_path: Optional[str] = None, portable: bool = True):
        if not user_id:
            raise ValueError("user_id is required")
        self.user_id = user_id
        self.terminal_path = terminal_path
        self.portable = portable
    
    def connect(self, login: Optional[str] = None, password: Optional[str] = None,
                server: Optional[str] = None, timeout: int = 10000) -> bool:
        """Solicita conexión al session manager."""
        result = session_manager.request_session(
            user_id=self.user_id,
            login=login,
            password=password,
            server=server,
            priority=1 if (login and password) else 0
        )
        return result.get("connected", False)
    
    def disconnect(self) -> bool:
        """Libera la sesión."""
        return session_manager.release_session(self.user_id)
    
    def is_connected(self) -> bool:
        """Verifica si este usuario tiene la sesión activa."""
        status = session_manager.get_session_status(self.user_id)
        return status.get("connected", False)
    
    def get_account_info(self) -> Optional[Dict[str, Any]]:
        """Obtiene info de cuenta si tiene la sesión."""
        if not self.is_connected():
            return None
        
        status = session_manager.get_session_status(self.user_id)
        return status.get("account_info")
    
    def get_status(self) -> Dict[str, Any]:
        """Obtiene estado completo."""
        return session_manager.get_session_status(self.user_id)
    
    def heartbeat(self) -> Dict[str, Any]:
        """Mantiene viva la sesión."""
        return session_manager.heartbeat(self.user_id)
    
    #  MÉTODOS DE TRADING (requieren sesión activa)
    
    def _ensure_connected(self) -> bool:
        """Verifica que tenga la sesión activa."""
        if not self.is_connected():
            return False
        

        session_manager.heartbeat(self.user_id)
        return True
    
    def get_realtime_data(self, symbol: str, timeframe: str = "H1", count: int = 500) -> Optional[pd.DataFrame]:
        """Obtiene datos históricos."""
        if not self._ensure_connected():
            return None
            
        try:
            tf_map = {
                "M1": mt5.TIMEFRAME_M1, "M5": mt5.TIMEFRAME_M5, "M15": mt5.TIMEFRAME_M15,
                "M30": mt5.TIMEFRAME_M30, "H1": mt5.TIMEFRAME_H1, "H4": mt5.TIMEFRAME_H4,
                "D1": mt5.TIMEFRAME_D1, "W1": mt5.TIMEFRAME_W1, "MN1": mt5.TIMEFRAME_MN1,
            }
            tf = tf_map.get(timeframe, mt5.TIMEFRAME_H1)
            
            # Seleccionar símbolo
            info = mt5.symbol_info(symbol)
            if info is None:
                return None
            if not info.visible:
                mt5.symbol_select(symbol, True)
            
            rates = mt5.copy_rates_from_pos(symbol, tf, 0, count)
            if rates is None or len(rates) == 0:
                return None
            
            df = pd.DataFrame(rates)
            df["time"] = pd.to_datetime(df["time"], unit="s")
            df.set_index("time", inplace=True)
            
            # Normalizar columnas
            df.rename(columns={
                "open": "Open", "high": "High", "low": "Low", "close": "Close",
                "tick_volume": "Volume", "real_volume": "Volume"
            }, inplace=True, errors="ignore")
            
            keep = [c for c in ["Open", "High", "Low", "Close", "Volume"] if c in df.columns]
            return df[keep] if keep else df
            
        except Exception as e:
            logger.error(f"[{self.user_id}] get_realtime_data error: {e}")
            return None
    
    def get_current_price(self, symbol: str) -> Optional[float]:
        """Obtiene precio actual."""
        if not self._ensure_connected():
            return None
            
        try:
            tick = mt5.symbol_info_tick(symbol)
            if tick is None:
                return None
            
            if tick.bid is not None and tick.ask is not None:
                return (float(tick.bid) + float(tick.ask)) / 2.0
            return float(getattr(tick, "last", 0)) if hasattr(tick, "last") else None
            
        except Exception as e:
            logger.error(f"[{self.user_id}] get_current_price error: {e}")
            return None
    
    def get_symbol_info(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Obtiene información del símbolo."""
        if not self._ensure_connected():
            return None
            
        try:
            info = mt5.symbol_info(symbol)
            if info is None:
                return None
                
            return {
                "symbol": info.name,
                "description": getattr(info, "description", ""),
                "digits": getattr(info, "digits", 5),
                "point": getattr(info, "point", 0.00001),
                "spread": getattr(info, "spread", 0),
                "volume_min": getattr(info, "volume_min", 0.01),
                "volume_max": getattr(info, "volume_max", 100.0),
                "trade_mode": getattr(info, "trade_mode", 0),
            }
        except Exception as e:
            logger.error(f"[{self.user_id}] get_symbol_info error: {e}")
            return None
    
    def execute_order(self, symbol: str, order_type: str, volume: float,
                     price: float = None, sl: float = None, tp: float = None,
                     comment: str = "") -> Dict[str, Any]:
        """Ejecuta orden."""
        if not self._ensure_connected():
            return {"success": False, "error": "Not connected - no active session"}
        
        try:
            symbol_info = mt5.symbol_info(symbol)
            if symbol_info is None:
                return {"success": False, "error": f"Symbol {symbol} not found"}
            
            if not symbol_info.visible:
                mt5.symbol_select(symbol, True)
            
            ot = (order_type or "").upper()
            tick = mt5.symbol_info_tick(symbol)
            
            if ot == "BUY":
                trade_type = mt5.ORDER_TYPE_BUY
                order_price = tick.ask if tick else price
            elif ot == "SELL":
                trade_type = mt5.ORDER_TYPE_SELL  
                order_price = tick.bid if tick else price
            else:
                return {"success": False, "error": f"Invalid order type: {order_type}"}
            
            if price is None:
                price = order_price
            

            if volume < symbol_info.volume_min:
                return {"success": False, "error": f"Volume too small. Min: {symbol_info.volume_min}"}
            
            if not comment:
                comment = f"AI_{self.user_id[-8:]}"[:31]
            
            request = {
                "action": mt5.TRADE_ACTION_DEAL,
                "symbol": symbol,
                "volume": volume,
                "type": trade_type,
                "price": price,
                "deviation": 20,
                "magic": 234000,
                "comment": comment[:31],
                "type_time": mt5.ORDER_TIME_GTC,
                "type_filling": mt5.ORDER_FILLING_FOK,
            }
            
            if sl is not None:
                request["sl"] = sl
            if tp is not None:
                request["tp"] = tp
            
            result = mt5.order_send(request)
            if result is None:
                return {"success": False, "error": f"order_send returned None: {mt5.last_error()}"}
            
            if result.retcode != mt5.TRADE_RETCODE_DONE:
                return {
                    "success": False, 
                    "error": f"Order failed: {result.comment}",
                    "retcode": result.retcode
                }
            
            return {
                "success": True,
                "ticket": result.order,
                "price": result.price,
                "volume": result.volume,
                "comment": result.comment,
            }
            
        except Exception as e:
            logger.exception(f"[{self.user_id}] execute_order error: {e}")
            return {"success": False, "error": str(e)}
    
    def get_positions(self) -> List[Dict[str, Any]]:
        """Obtiene posiciones abiertas."""
        if not self._ensure_connected():
            return []
            
        try:
            positions = mt5.positions_get()
            if not positions:
                return []
            
            result = []
            for pos in positions:
                result.append({
                    "ticket": pos.ticket,
                    "time": datetime.fromtimestamp(pos.time),
                    "symbol": pos.symbol,
                    "type": pos.type,
                    "volume": pos.volume,
                    "price_open": pos.price_open,
                    "sl": pos.sl,
                    "tp": pos.tp,
                    "price_current": pos.price_current,
                    "comment": pos.comment,
                    "magic": pos.magic,
                    "profit": pos.profit,
                })
            return result
            
        except Exception as e:
            logger.error(f"[{self.user_id}] get_positions error: {e}")
            return []

#  REGISTRY  

class MT5ProviderRegistry:
    """Registry que usa el nuevo sistema de sesiones."""
    
    def __init__(self):
        self._providers: Dict[str, MT5DataProvider] = {}
        self._lock = threading.RLock()
    
    def get(self, user_id: str, terminal_path: Optional[str] = None, portable: bool = True) -> MT5DataProvider:
        with self._lock:
            if user_id not in self._providers:
                self._providers[user_id] = MT5DataProvider(
                    user_id=user_id, 
                    terminal_path=terminal_path, 
                    portable=portable
                )
            return self._providers[user_id]
    
    def remove(self, user_id: str) -> bool:
        with self._lock:
            provider = self._providers.pop(user_id, None)
            if provider:
                provider.disconnect()
                return True
            return False
    
    def is_connected(self, user_id: str) -> bool:
        with self._lock:
            provider = self._providers.get(user_id)
            return provider.is_connected() if provider else False
    
    def disconnect_all(self) -> int:
        with self._lock:
            count = 0
            for provider in self._providers.values():
                if provider.disconnect():
                    count += 1
            self._providers.clear()
            
            session_manager.force_cleanup()
            return count
    
    def snapshot(self) -> Dict[str, Any]:
        with self._lock:
            result = {}
            for user_id, provider in self._providers.items():
                status = provider.get_status()
                result[user_id] = status
            return result

#  INSTANCIAS GLOBALES 


session_manager = MT5SessionManager()

provider_registry = MT5ProviderRegistry()