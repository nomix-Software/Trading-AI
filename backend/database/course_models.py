from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from bson import ObjectId
from enum import Enum

# Importar PyObjectId del archivo existente
from database.models import PyObjectId

class CourseType(str, Enum):
    VOLUME_ANALYSIS = "volume_analysis"
    PRICE_ACTION = "price_action"
    TECHNICAL_ANALYSIS = "technical_analysis"
    RISK_MANAGEMENT = "risk_management"
    PSYCHOLOGY = "psychology"

class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    FILL_BLANK = "fill_blank"

class DifficultyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

# Modelo para las preguntas del curso
class CourseQuestion(BaseModel):
    question_id: str
    question_text: str
    question_type: QuestionType
    options: List[str] = []  # Para multiple choice
    correct_answer: str
    explanation: str
    difficulty: DifficultyLevel = DifficultyLevel.BEGINNER
    points: int = 10

# Modelo principal del curso
class Course(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: str
    description: str
    course_type: CourseType
    difficulty: DifficultyLevel
    estimated_duration: int  # en minutos
    
    # Contenido del curso
    questions: List[CourseQuestion] = []
    total_questions: int = 0
    total_points: int = 0
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    
    # Configuración
    passing_score: int = 70  # porcentaje mínimo para aprobar
    allow_retries: bool = False  # No permitir reintentos
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Modelo para las respuestas del usuario
class CourseAnswer(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    course_id: str
    question_id: str
    
    # Respuesta del usuario
    user_answer: str
    is_correct: bool
    points_earned: int = 0
    
    # Metadata
    answered_at: datetime = Field(default_factory=datetime.utcnow)
    time_taken: Optional[int] = None  # tiempo en segundos
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Modelo para el progreso del usuario en un curso
class CourseProgress(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    course_id: str
    
    # Progreso
    questions_answered: List[str] = []  # IDs de preguntas respondidas
    total_questions: int = 0
    questions_correct: int = 0
    questions_incorrect: int = 0
    
    # Puntuación
    total_points_earned: int = 0
    total_points_possible: int = 0
    percentage_score: float = 0.0
    
    # Estado
    is_completed: bool = False
    is_passed: bool = False
    
    # Timestamps
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    last_activity: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Modelo para estadísticas generales del usuario
class UserCourseStats(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    
    # Estadísticas generales
    total_courses_started: int = 0
    total_courses_completed: int = 0
    total_courses_passed: int = 0
    
    # Puntuaciones
    total_points_earned: int = 0
    average_score: float = 0.0
    
    # Por tipo de curso
    course_type_stats: Dict[str, Dict[str, Any]] = {}
    
    # Por dificultad
    difficulty_stats: Dict[str, Dict[str, Any]] = {}
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Modelos de request/response para la API

class AnswerQuestionRequest(BaseModel):
    course_id: str
    question_id: str
    user_answer: str
    time_taken: Optional[int] = None

class AnswerQuestionResponse(BaseModel):
    success: bool
    is_correct: bool
    correct_answer: str
    explanation: str
    points_earned: int
    progress: Dict[str, Any]
    message: str

class CourseProgressResponse(BaseModel):
    course_id: str
    course_title: str
    total_questions: int
    questions_answered: int
    questions_correct: int
    questions_incorrect: int
    percentage_score: float
    is_completed: bool
    is_passed: bool
    next_question_id: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

class UserStatsResponse(BaseModel):
    total_courses_started: int
    total_courses_completed: int
    total_courses_passed: int
    completion_rate: float
    pass_rate: float
    average_score: float
    total_points_earned: int
    course_progress: List[CourseProgressResponse]
    course_type_breakdown: Dict[str, Dict[str, Any]]
    difficulty_breakdown: Dict[str, Dict[str, Any]]

class CourseListResponse(BaseModel):
    id: str
    title: str
    description: str
    course_type: str
    difficulty: str
    total_questions: int
    estimated_duration: int
    user_progress: Optional[CourseProgressResponse] = None
    is_started: bool = False
    is_completed: bool = False
    is_passed: bool = False
