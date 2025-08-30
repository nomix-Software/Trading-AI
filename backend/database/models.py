from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from bson import ObjectId
from enum import Enum
from bson import ObjectId
from pydantic_core import core_schema
from pydantic import GetCoreSchemaHandler


class PyObjectId(ObjectId):

    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler: GetCoreSchemaHandler):
        return core_schema.no_info_after_validator_function(
            cls.validate,
            core_schema.str_schema(),
            serialization=core_schema.to_string_ser_schema(),
        )

    @classmethod
    def validate(cls, value):
        if not ObjectId.is_valid(value):
            raise ValueError("Invalid ObjectId")
        return ObjectId(value)

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    PREMIUM = "premium"

class SignalType(str, Enum):
    BUY = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"

class AnalysisType(str, Enum):
    ELLIOTT_WAVE = "elliott_wave"
    CHART_PATTERN = "chart_pattern"
    FIBONACCI = "fibonacci"
    SUPPORT_RESISTANCE = "support_resistance"
    
class ExecutionType(str, Enum):
    MARKET = "market"
    LIMIT = "limit" 
    STOP = "stop"

class TraderType(str, Enum):
    SCALPING = "scalping"
    DAY_TRADING = "day_trading"
    SWING_TRADING = "swing_trading"
    POSITION_TRADING = "position_trading"

class TradingStrategy(str, Enum):
    MALETA = "maleta"
    SWING_TRADING = "swing_trading"
    POSITION_TRADING = "position_trading"
    ALGORITHMIC = "algorithmic"
    ALGORITHMIC_TRADING = "algorithmic_trading"  # Agregado para compatibilidad
    PAIRS_TRADING = "pairs_trading"
    MEAN_REVERSION = "mean_reversion"
    SOCIAL_TRADING = "social_trading"
    CARRY_TRADE = "carry_trade"
    HEDGING = "hedging"
    PYRAMIDING = "pyramiding"

class ExtendedRiskConfig(BaseModel):
    max_daily_loss_percent: Optional[float] = None
    max_weekly_loss_percent: Optional[float] = None
    max_daily_profit_percent: Optional[float] = None
    max_open_trades: Optional[int] = None
    min_rrr: Optional[float] = None
    max_losing_streak: Optional[int] = None
    cool_down_hours: Optional[int] = None
    risk_by_strategy: Optional[Dict[str, float]] = None

class PyObjectId(ObjectId):
    """Custom ObjectId class for Pydantic"""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, handler=None):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")

class MT5Session(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
    
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    is_connected: bool = False
    connected_at: Optional[datetime] = None
    account_type: Optional[str] = None
    server: Optional[str] = None
    login: Optional[str] = None
    account_info: Optional[Dict[str, Any]] = None
    expires_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_activity: Optional[datetime] = None

class MT5Profile(BaseModel):
    """Modelo para perfiles guardados de MT5 (sin contraseña)"""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: str = Field(..., description="ID del usuario propietario del perfil")
    
    # Datos del perfil
    login: Optional[str] = None
    server: Optional[str] = None
    account_type: str = "real"
    profile_name: Optional[str] = None
    
    # Configuración
    is_default: bool = False
    auto_connect: bool = False
    # configuracion de confluencias
    ai_settings: Optional[Dict[str, Any]] = None
    # Metadatos
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class AnalysisConfig(BaseModel):
    """Configuración para el análisis de confluencias"""
    # Configuración básica
    confluence_threshold: float = 0.6
    risk_per_trade: float = 2.0
    lot_size: float = 0.1
    atr_multiplier_sl: float = 2.0
    risk_reward_ratio: float = 2.0
    
    # Análisis habilitados
    enable_elliott_wave: bool = True
    enable_fibonacci: bool = True
    enable_chart_patterns: bool = True
    enable_support_resistance: bool = True
    
    # Timeframe
    timeframe: str = "H1"
    
    # Tipo de trader y estrategia
    trader_type: Optional[TraderType] = None
    trader_timeframes: List[str] = ["H1"]
    trading_strategy: Optional[TradingStrategy] = None
    strategy_timeframes: List[str] = ["H1"]
    
    # Pesos personalizados
    elliott_wave_weight: float = 0.25
    fibonacci_weight: float = 0.25
    chart_patterns_weight: float = 0.30
    support_resistance_weight: float = 0.20
    
    # Configuración de ejecución
    execution_type: ExecutionType = ExecutionType.MARKET
    allowed_execution_types: List[ExecutionType] = [ExecutionType.MARKET]
    
    # Gestión de riesgo básica
    total_capital: Optional[float] = None
    risk_percentage: Optional[float] = None
    max_risk_amount: Optional[float] = None
    
    extended_risk_config: Optional[ExtendedRiskConfig] = None
    risk_management_locked: bool = False
    
    # Timeframes combinados
    combined_timeframes: List[str] = []
    
    # Pesos personalizados adicionales
    custom_weights: dict = {}

class AISettingsRequest(BaseModel):
    """Modelo para recibir la configuración de IA desde el frontend"""
    # Configuración básica
    timeframe: str = "H1"
    confluence_threshold: float = Field(default=0.6, ge=0, le=1)
    risk_per_trade: float = Field(default=2.0, gt=0, le=10)
    lot_size: float = Field(default=0.1, gt=0)
    atr_multiplier_sl: float = Field(default=2.0, gt=0)
    risk_reward_ratio: float = Field(default=2.0, gt=0)
    
    # Análisis habilitados
    enable_elliott_wave: bool = True
    enable_fibonacci: bool = True
    enable_chart_patterns: bool = True
    enable_support_resistance: bool = True
    
    # Pesos de análisis
    elliott_wave_weight: float = Field(default=0.25, ge=0, le=1)
    fibonacci_weight: float = Field(default=0.25, ge=0, le=1)
    chart_patterns_weight: float = Field(default=0.25, ge=0, le=1)
    support_resistance_weight: float = Field(default=0.25, ge=0, le=1)
    
    # Configuración de ejecución
    execution_type: str = "market"
    allowed_execution_types: List[str] = ["market"]
    
    # Tipos de trader y estrategias
    trader_type: Optional[str] = None
    trading_strategy: Optional[str] = None
    trader_timeframes: List[str] = ["H1"]
    strategy_timeframes: List[str] = ["H1"]
    
    # Configuración adicional del frontend
    analysisTimeframe: Optional[str] = None
    enabledAnalyses: List[str] = []
    selectedExecutionType: Optional[str] = None
    selectedStrategy: Optional[str] = None
    selectedTradingStrategy: Optional[str] = None
    
    # Configuración avanzada
    combined_timeframes: List[str] = []
    custom_weights: Dict[str, Any] = {}
    risk_management_locked: bool = False

    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }

class AISettings(BaseModel):
    """Modelo para almacenar en la base de datos"""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    
    # Configuración básica
    timeframe: str = "H1"
    confluence_threshold: float = 0.6
    risk_per_trade: float = 2.0
    lot_size: float = 0.1
    atr_multiplier_sl: float = 2.0
    risk_reward_ratio: float = 2.0
    
    # Análisis habilitados
    enable_elliott_wave: bool = True
    enable_fibonacci: bool = True
    enable_chart_patterns: bool = True
    enable_support_resistance: bool = True
    
    # Pesos de análisis
    elliott_wave_weight: float = 0.25
    fibonacci_weight: float = 0.25
    chart_patterns_weight: float = 0.25
    support_resistance_weight: float = 0.25
    
    # Configuración de ejecución
    execution_type: str = "market"
    allowed_execution_types: List[str] = ["market"]
    
    # Tipos de trader y estrategias
    trader_type: Optional[str] = None
    trading_strategy: Optional[str] = None
    trader_timeframes: List[str] = ["H1"]
    strategy_timeframes: List[str] = ["H1"]
    
    # Configuración adicional
    combined_timeframes: List[str] = []
    custom_weights: Dict[str, Any] = {}
    risk_management_locked: bool = False
    
    # Datos adicionales del frontend (opcionales)
    frontend_config: Optional[Dict[str, Any]] = None
    
    # Metadatos
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }

class AISettingsResponse(BaseModel):
    """Modelo de respuesta para el frontend"""
    success: bool
    ai_settings: Optional[Dict[str, Any]] = None
    message: str
    timestamp: str

class AISettingsValidation(BaseModel):
    """Modelo para validación de configuración"""
    is_valid: bool
    errors: List[str] = []

# Modelos de Usuario
class User(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password_hash: str
    role: UserRole = UserRole.USER
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Configuración del usuario
    preferred_pairs: List[str] = []
    preferred_timeframes: List[str] = ["H1", "H4", "D1"]
    notification_settings: Dict[str, bool] = {
        "email_signals": True,
        "push_notifications": True,
        "sms_alerts": False
    }
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime
    preferred_pairs: List[str]
    preferred_timeframes: List[str]

# Modelos de Señales
class TechnicalAnalysis(BaseModel):
    type: AnalysisType
    confidence: float = Field(..., ge=0, le=1) 
    data: Dict[str, Any] 
    description: str

class Signal(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    symbol: str
    timeframe: str
    signal_type: SignalType
    
    # Precios y niveles
    entry_price: float
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    current_price: float
    
    # Análisis técnico
    technical_analyses: List[TechnicalAnalysis] = []
    confluence_score: float = Field(..., ge=0, le=1)  # Puntuación de confluencia
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
    is_active: bool = True
    
    # Performance tracking
    max_profit: float = 0.0
    max_loss: float = 0.0
    result: Optional[str] = None  # "profit", "loss", "breakeven"
    pips_result: Optional[float] = None
    
    # User tracking
    created_by: str = "system" 
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class SignalResponse(BaseModel):
    id: str
    symbol: str
    timeframe: str
    signal_type: SignalType
    entry_price: float
    stop_loss: Optional[float]
    take_profit: Optional[float]
    current_price: float
    confluence_score: float
    technical_analyses: List[TechnicalAnalysis]
    created_at: datetime
    is_active: bool

# Modelos de Datos de Mercado
class OHLCV(BaseModel):
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float

class MarketData(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    symbol: str
    timeframe: str
    data: List[OHLCV]
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Modelos de Configuración
class TradingPair(BaseModel):
    symbol: str
    description: str
    currency_base: str
    currency_profit: str
    point: float
    digits: int
    category: str  # "Major", "Minor", "Exotic"
    is_active: bool = True

class SystemConfig(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    mt5_connected: bool = False
    active_pairs: List[str] = []
    default_timeframes: List[str] = ["M15", "H1", "H4", "D1"]
    ai_models_status: Dict[str, bool] = {
        "elliott_waves": True,
        "chart_patterns": True,
        "fibonacci": True,
        "support_resistance": True
    }
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Modelos de Alertas
class Alert(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    symbol: str
    alert_type: str  # "price", "signal", "pattern"
    condition: Dict[str, Any]  
    message: str
    is_triggered: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    triggered_at: Optional[datetime] = None
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Modelos de Performance
class PerformanceStats(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: Optional[str] = None  
    period_start: datetime
    period_end: datetime
    
    # Estadísticas generales
    total_signals: int = 0
    profitable_signals: int = 0
    losing_signals: int = 0
    win_rate: float = 0.0
    
    # Performance financiera
    total_pips: float = 0.0
    average_pips_per_trade: float = 0.0
    max_consecutive_wins: int = 0
    max_consecutive_losses: int = 0
    
    # Por símbolo
    symbol_performance: Dict[str, Dict[str, float]] = {}
    
    # Por timeframe
    timeframe_performance: Dict[str, Dict[str, float]] = {}
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}