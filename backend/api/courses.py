from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
import logging

# Importar modelos y dependencias
from database.course_models import (
    Course, CourseAnswer, CourseProgress, UserCourseStats,
    AnswerQuestionRequest, AnswerQuestionResponse, 
    CourseProgressResponse, UserStatsResponse, CourseListResponse
)
from database.models import User
from database.connection import db_manager
from api.auth import get_current_active_user

def serialize_mongo_doc(doc: Any) -> Any:
    """Convierte documentos MongoDB a JSON serializable"""
    if isinstance(doc, list):
        return [serialize_mongo_doc(item) for item in doc]
    elif isinstance(doc, dict):
        return {key: serialize_mongo_doc(value) for key, value in doc.items()}
    elif isinstance(doc, ObjectId):
        return str(doc)
    elif hasattr(doc, 'isoformat'):  # Para datetime
        return doc.isoformat()
    else:
        return doc

# Configurar logging
logger = logging.getLogger(__name__)

# Crear router
router = APIRouter(prefix="/courses", tags=["courses"])

STATIC_COURSES = {
    1: {
        "id": 1,
        "title": "Básicos de Trading",
        "description": "Curso completo de fundamentos de trading en 3 volúmenes progresivos",
        "course_type": "trading",
        "difficulty": "beginner",
        "total_questions": 90,  # 25+30+35
        "total_points": 900,
        "estimated_duration": 180,
        "passing_score": 70,
        "is_active": True,
        "has_volumes": True
    },
    2: {
        "id": 2, 
        "title": "Análisis Técnico Avanzado",
        "description": "Técnicas avanzadas de análisis técnico e indicadores personalizados",
        "course_type": "technical_analysis",
        "difficulty": "advanced", 
        "total_questions": 40,  # 15+15+10
        "total_points": 400,
        "estimated_duration": 120,
        "passing_score": 75,
        "is_active": True,
        "has_volumes": True
    },
    3: {
        "id": 3,
        "title": "Fundamentos de Criptomonedas",
        "description": "Introducción al mundo de las criptomonedas y blockchain",
        "course_type": "cryptocurrency",
        "difficulty": "beginner",
        "total_questions": 20,  # 7+8+5
        "total_points": 200,
        "estimated_duration": 90,
        "passing_score": 70,
        "is_active": True,
        "has_volumes": True
    },
    4: {
        "id": 4,
        "title": "Estrategias de Day Trading",
        "description": "Técnicas y estrategias para el trading intradía",
        "course_type": "day_trading",
        "difficulty": "intermediate",
        "total_questions": 28,  # 10+9+9
        "total_points": 280,
        "estimated_duration": 150,
        "passing_score": 75,
        "is_active": True,
        "has_volumes": True
    },
    5: {
        "id": 5,
        "title": "Gestión de Riesgo Profesional",
        "description": "Técnicas avanzadas de gestión de capital y riesgo",
        "course_type": "risk_management",
        "difficulty": "advanced",
        "total_questions": 32,  # 12+10+10
        "total_points": 320,
        "estimated_duration": 100,
        "passing_score": 80,
        "is_active": True,
        "has_volumes": True
    },
    6: {
        "id": 6,
        "title": "Trading Algorítmico",
        "description": "Introducción al trading automatizado y algoritmos",
        "course_type": "algorithmic_trading",
        "difficulty": "advanced",
        "total_questions": 45,  # 15+20+10
        "total_points": 450,
        "estimated_duration": 200,
        "passing_score": 80,
        "is_active": True,
        "has_volumes": True
    }
}

def get_course_data(course_id):
    """Obtener datos del curso compatible con IDs numéricos y strings"""
    # Intentar como número primero (para coincidir con frontend)
    if isinstance(course_id, str) and course_id.isdigit():
        course_id = int(course_id)
    
    # Intentar como string
    if course_id in STATIC_COURSES:
           return STATIC_COURSES.get(course_id)
    
    # Buscar por ID interno
    for course_data in STATIC_COURSES.values():
        if str(course_data["id"]) == str(course_id) or course_data["id"] == course_id:
            return course_data
    
    return None

def get_volume_questions_count(course_id: int, volume_id: str) -> int:
    """Obtener el número real de preguntas por volumen según el frontend"""
    VOLUME_QUESTIONS = {
        1: {"1": 25, "2": 30, "3": 35},  # Básicos de Trading
        2: {"1": 15, "2": 15, "3": 10},  # Análisis Técnico Avanzado
        3: {"1": 7, "2": 8, "3": 5},     # Fundamentos de Criptomonedas
        4: {"1": 10, "2": 9, "3": 9},    # Estrategias de Day Trading
        5: {"1": 12, "2": 10, "3": 10},  # Gestión de Riesgo Profesional
        6: {"1": 15, "2": 20, "3": 10},  # Trading Algorítmico
    }
    
    return VOLUME_QUESTIONS.get(course_id, {}).get(volume_id, 10)

def calculate_progress_stats(answers: List[Dict], total_questions: int, total_points: int) -> Dict[str, Any]:
    """Calcula estadísticas de progreso basadas en las respuestas"""
    questions_answered = len(answers)
    questions_correct = sum(1 for answer in answers if answer.get("is_correct", False))
    questions_incorrect = questions_answered - questions_correct
    points_earned = sum(answer.get("points_earned", 0) for answer in answers)
    
    percentage_score = (points_earned / total_points * 100) if total_points > 0 else 0
    
    return {
        "questions_answered": questions_answered,
        "questions_correct": questions_correct,
        "questions_incorrect": questions_incorrect,
        "points_earned": points_earned,
        "percentage_score": round(percentage_score, 2)
    }

@router.post("/answers", response_model=Dict[str, Any])
async def save_course_answer(
    answer_data: Dict[str, Any],
    current_user: User = Depends(get_current_active_user)
):
    """Guardar respuesta de curso (coincide con frontend)"""
    try:
        course_id = answer_data.get("course_id")
        question_id = answer_data.get("question_id")
        user_answer = answer_data.get("answer")
        
        # Verificar que el curso existe
        course_data = get_course_data(course_id)
        if not course_data:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Verificar si ya fue respondida
        existing_answer = await db_manager.find_one(
            "course_answers",
            {
                "user_id": str(current_user.id),
                "course_id": str(course_data["id"]),
                "question_id": question_id
            }
        )
        
        if existing_answer:
            raise HTTPException(
                status_code=400, 
                detail="Question already answered"
            )
        
        # Por simplicidad, asumimos que todas las respuestas valen 10 puntos
        points_earned = 10 if answer_data.get("is_correct", False) else 0
        
        # Guardar respuesta
        answer_record = {
            "user_id": str(current_user.id),
            "course_id": str(course_data["id"]),
            "volume_id": answer_data.get("volume_id"),  # Opcional
            "question_id": question_id,
            "user_answer": user_answer,
            "is_correct": answer_data.get("is_correct", False),
            "points_earned": points_earned,
            "answered_at": datetime.utcnow(),
            "timestamp": answer_data.get("timestamp", datetime.utcnow().isoformat())
        }
        
        try:
            result = await db_manager.insert_one("course_answers", answer_record)
            
            if hasattr(result, 'inserted_id'):
                answer_id = str(result.inserted_id)
            elif isinstance(result, ObjectId):
                answer_id = str(result)
            elif isinstance(result, dict) and 'inserted_id' in result:
                answer_id = str(result['inserted_id'])
            else:
                # Fallback - generate a temporary ID or use a timestamp
                answer_id = str(ObjectId())
                logger.warning(f"Could not get inserted_id from result: {type(result)}, using fallback ID")
            
        except Exception as insert_error:
            logger.error(f"Error inserting course answer: {insert_error}")
            raise HTTPException(status_code=500, detail="Error saving answer to database")
        
        return {
            "success": True,
            "answer_id": answer_id,
            "message": "Answer saved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving course answer: {e}")
        raise HTTPException(status_code=500, detail="Error saving answer")


@router.get("/{course_id}/progress", response_model=Dict[str, Any])
async def get_course_progress(
    course_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Obtener progreso del usuario en un curso específico"""
    try:
        # Verificar que el curso existe
        course_data = get_course_data(course_id)
        if not course_data:
            raise HTTPException(status_code=404, detail="Course not found")

        # Obtener respuestas del usuario
        user_answers = await db_manager.find_many(
            "course_answers",
            {"user_id": str(current_user.id), "course_id": str(course_data["id"])}
        )

        # Serializar respuestas antes de procesar
        serialized_answers = serialize_mongo_doc(user_answers)

        # Calcular estadísticas generales
        stats = calculate_progress_stats(
            serialized_answers,
            course_data["total_questions"],
            course_data["total_points"]
        )

        # Calcular progreso por volumen
        volumes_progress = {}
        if course_data.get("has_volumes", False):
            for volume_id in ["1", "2", "3"]:
                volume_answers = [a for a in serialized_answers if a.get("volume_id") == volume_id]
                volume_total_questions = get_volume_questions_count(course_data["id"], volume_id)

                volume_completed_count = len(volume_answers)
                volume_correct_count = sum(1 for a in volume_answers if a.get("is_correct", False))
                volume_progress_percent = (volume_completed_count / volume_total_questions * 100) if volume_total_questions > 0 else 0

                volumes_progress[volume_id] = {
                    "progress": round(volume_progress_percent, 2),
                    "completed_questions": [a["question_id"] for a in volume_answers],
                    "total_questions": volume_total_questions,
                    "correct_answers": volume_correct_count,
                    "is_completed": volume_completed_count >= volume_total_questions,
                    "completed": volume_completed_count  # campo oficial usado en frontend
                }

        completed_questions = [answer["question_id"] for answer in serialized_answers]

        # NUEVO: última pregunta respondida
        last_answered = None
        if serialized_answers:
            last_answered_doc = max(serialized_answers, key=lambda a: a.get("answered_at", ""))
            last_answered = last_answered_doc.get("question_id")

        return {
            "course_id": course_data["id"],
            "total_progress": round((stats["questions_answered"] / course_data["total_questions"]) * 100, 2),
            "volumes_progress": volumes_progress,
            "completed_questions": completed_questions,
            "total_questions": course_data["total_questions"],
            "correct_answers": stats["questions_correct"],
            "questions_answered": stats["questions_answered"],
            "questions_correct": stats["questions_correct"],
            "questions_incorrect": stats["questions_incorrect"],
            "percentage_score": stats["percentage_score"],
            "is_completed": stats["questions_answered"] >= course_data["total_questions"],
            "is_passed": stats["questions_answered"] >= course_data["total_questions"] and stats["percentage_score"] >= course_data["passing_score"],
            "last_answered_question": last_answered  # NUEVO
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting course progress: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving progress")

# NUEVO: Endpoint para cursos del usuario
@router.get("/user", response_model=Dict[str, Any])
async def get_user_courses(current_user: User = Depends(get_current_active_user)):
    """Obtener cursos del usuario con su progreso (estructura compatible con frontend)"""
    try:
        courses = []
        total_courses = len(STATIC_COURSES)
        completed_courses = 0
        in_progress_courses = 0
        
        for course_id, course_data in STATIC_COURSES.items():
            # Obtener respuestas del usuario
            user_answers = await db_manager.find_many(
                "course_answers",
                {"user_id": str(current_user.id), "course_id": str(course_id)}
            )
            
            # Serializar respuestas
            serialized_answers = serialize_mongo_doc(user_answers)
            
            # Calcular estadísticas
            stats = calculate_progress_stats(
                serialized_answers, 
                course_data["total_questions"], 
                course_data["total_points"]
            )
            
            is_started = len(serialized_answers) > 0
            is_completed = stats["questions_answered"] >= course_data["total_questions"]
            
            if is_completed:
                completed_courses += 1
            elif is_started:
                in_progress_courses += 1
            
            # Calcular progreso por volumen (si el curso tiene volúmenes)
            volumes_progress = {}
            if course_data.get("has_volumes", False):
                for volume_id in ["1", "2", "3"]:
                    volume_answers = [a for a in serialized_answers if a.get("volume_id") == volume_id]
                    volume_total_questions = get_volume_questions_count(course_data["id"], volume_id)
                    
                    volumes_progress[volume_id] = {
                        "completed": len(volume_answers),
                        "totalQuestions": volume_total_questions
                    }
            
            courses.append({
                "course_id": course_id,
                "title": course_data["title"],
                "description": course_data["description"],
                "is_started": is_started,
                "is_completed": is_completed,
                "progress": stats["percentage_score"] if is_started else 0,
                "completed": stats["questions_answered"],
                "correct": stats["questions_correct"],
                "totalQuestions": course_data["total_questions"],
                "status": "completed" if is_completed else "in-progress" if is_started else "not-started",
                "volumes": volumes_progress
            })
        
        return {
            "courses": courses,
            "total_courses": total_courses,
            "completed_courses": completed_courses,
            "in_progress_courses": in_progress_courses
        }
        
    except Exception as e:
        logger.error(f"Error getting user courses: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving user courses")


# NUEVO: Endpoint para iniciar curso
@router.post("/{course_id}/start", response_model=Dict[str, Any])
async def start_course(
    course_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Iniciar un curso"""
    try:
        # Verificar que el curso existe
        if course_id not in STATIC_COURSES:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Verificar si ya fue iniciado
        existing_answers = await db_manager.find_many(
            "course_answers",
            {"user_id": str(current_user.id), "course_id": course_id}
        )
        
        if existing_answers:
            return {"message": "Course already started", "success": True}
        
        # En tu implementación, aquí podrías crear un registro de inicio
        # Por ahora solo retornamos éxito
        return {
            "success": True,
            "message": "Course started successfully",
            "course_id": course_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting course: {e}")
        raise HTTPException(status_code=500, detail="Error starting course")


# NUEVO: Endpoint para completar curso
@router.post("/{course_id}/complete", response_model=Dict[str, Any])
async def complete_course(
    course_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Completar un curso"""
    try:
        # Verificar que el curso existe
        if course_id not in STATIC_COURSES:
            raise HTTPException(status_code=404, detail="Course not found")
        
        course_data = STATIC_COURSES[course_id]
        
        # Verificar si realmente está completado
        user_answers = await db_manager.find_many(
            "course_answers",
            {"user_id": str(current_user.id), "course_id": course_id}
        )
        
        # Serializar para contar
        serialized_answers = serialize_mongo_doc(user_answers)
        
        if len(serialized_answers) < course_data["total_questions"]:
            raise HTTPException(
                status_code=400, 
                detail="Course not completed. Answer all questions first."
            )
        
        return {
            "success": True,
            "message": "Course completed successfully",
            "course_id": course_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error completing course: {e}")
        raise HTTPException(status_code=500, detail="Error completing course")


# NUEVO: Endpoint para obtener respuestas del curso
@router.get("/{course_id}/answers", response_model=Dict[str, Any])
async def get_course_answers(
    course_id: str,
    volume_id: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Obtener respuestas del usuario para un curso"""
    try:
        # Construir filtro
        filter_query = {
            "user_id": str(current_user.id),
            "course_id": course_id
        }
        
        if volume_id:
            filter_query["volume_id"] = volume_id
        
        # Obtener respuestas
        answers = await db_manager.find_many("course_answers", filter_query)
        
        # Serializar respuestas
        serialized_answers = serialize_mongo_doc(answers)
        
        return {
            "answers": serialized_answers,
            "total_answers": len(serialized_answers)
        }
        
    except Exception as e:
        logger.error(f"Error getting course answers: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving answers")
    

@router.get("/{course_id}/volumes/{volume_id}/progress", response_model=Dict[str, Any])
async def get_volume_progress(
    course_id: str,
    volume_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Obtener progreso de un volumen específico"""
    try:
        # Usar get_course_data para consistencia
        course_data = get_course_data(course_id)
        if not course_data:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Definir preguntas reales por volumen
        total_questions_in_volume = get_volume_questions_count(course_data["id"], volume_id)
        
        # USAR EL MISMO FILTRO que en el endpoint general
        user_answers = await db_manager.find_many(
            "course_answers",
            {
                "user_id": str(current_user.id), 
                "course_id": str(course_data["id"]),  # ← STRING, igual que el otro
                "volume_id": volume_id
            }
        )
        
        serialized_answers = serialize_mongo_doc(user_answers)
        completed_questions = [answer["question_id"] for answer in serialized_answers]
        correct_answers = sum(1 for answer in serialized_answers if answer.get("is_correct", False))
        
        progress = (len(serialized_answers) / total_questions_in_volume) * 100 if total_questions_in_volume > 0 else 0
        
        return {
            "volume_id": volume_id,
            "progress": round(progress, 2),
            "completed_questions": completed_questions,
            "total_questions": total_questions_in_volume,
            "correct_answers": correct_answers,
            "is_completed": len(serialized_answers) >= total_questions_in_volume
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting volume progress: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving volume progress")

@router.get("/{course_id}/answers/check", response_model=Dict[str, Any])
async def check_answer_exists(
    course_id: str,
    volume_id: Optional[str] = None,
    question_id: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Verificar si existe una respuesta específica"""
    try:
        filter_query = {
            "user_id": str(current_user.id),
            "course_id": course_id
        }
        
        if volume_id:
            filter_query["volume_id"] = volume_id
        if question_id:
            filter_query["question_id"] = question_id
        
        answer = await db_manager.find_one("course_answers", filter_query)
        
        # Serializar respuesta si existe
        serialized_answer = serialize_mongo_doc(answer) if answer else None
        
        return {
            "exists": answer is not None,
            "answer": serialized_answer
        }
        
    except Exception as e:
        logger.error(f"Error checking answer existence: {e}")
        raise HTTPException(status_code=500, detail="Error checking answer")

# NUEVO: Endpoint para estadísticas de cursos
@router.get("/stats", response_model=Dict[str, Any])
async def get_courses_stats(current_user: User = Depends(get_current_active_user)):
    """Obtener estadísticas generales de cursos del usuario"""
    try:
        total_courses = len(STATIC_COURSES)
        completed_courses = 0
        in_progress_courses = 0
        total_questions_answered = 0
        total_correct_answers = 0
        
        for course_id, course_data in STATIC_COURSES.items():
            # Obtener respuestas del usuario
            user_answers = await db_manager.find_many(
                "course_answers",
                {"user_id": str(current_user.id), "course_id": course_id}
            )
            
            # Serializar respuestas
            serialized_answers = serialize_mongo_doc(user_answers)
            
            total_questions_answered += len(serialized_answers)
            total_correct_answers += sum(1 for answer in serialized_answers if answer.get("is_correct", False))
            
            # Verificar si está completado
            if len(serialized_answers) >= course_data["total_questions"]:
                completed_courses += 1
            elif len(serialized_answers) > 0:
                in_progress_courses += 1
        
        correct_answers_percentage = (
            (total_correct_answers / total_questions_answered * 100) 
            if total_questions_answered > 0 else 0
        )
        
        average_course_completion = (
            (completed_courses / total_courses * 100) 
            if total_courses > 0 else 0
        )
        
        return {
            "total_courses": total_courses,
            "completed_courses": completed_courses,
            "in_progress_courses": in_progress_courses,
            "total_questions_answered": total_questions_answered,
            "correct_answers_percentage": round(correct_answers_percentage, 2),
            "average_course_completion": round(average_course_completion, 2)
        }
        
    except Exception as e:
        logger.error(f"Error getting courses stats: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving statistics")
    
    

# MANTENER: Endpoint original de estadísticas de usuario
@router.get("/user/stats", response_model=Dict[str, Any])
async def get_user_stats(current_user: User = Depends(get_current_active_user)):
    """Obtener estadísticas detalladas del usuario (endpoint original)"""
    try:
        # Reutilizar la lógica del endpoint de stats pero con más detalles
        stats = await get_courses_stats(current_user)
        
        # Agregar información adicional si es necesaria
        course_progress = []
        
        for course_id, course_data in STATIC_COURSES.items():
            user_answers = await db_manager.find_many(
                "course_answers",
                {"user_id": str(current_user.id), "course_id": course_id}
            )
            
            # Serializar respuestas
            serialized_answers = serialize_mongo_doc(user_answers)
            
            if serialized_answers:  # Solo incluir cursos con progreso
                progress_stats = calculate_progress_stats(
                    serialized_answers, 
                    course_data["total_questions"], 
                    course_data["total_points"]
                )
                
                course_progress.append({
                    "course_id": course_id,
                    "course_title": course_data["title"],
                    "progress": progress_stats
                })
        
        return {
            **stats,
            "course_progress": course_progress
        }
        
    except Exception as e:
        logger.error(f"Error getting user stats: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving user statistics")
