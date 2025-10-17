
from typing import List, Dict, Any, Optional
from datetime import datetime
from bson import ObjectId

from database.connection import db_manager
from database.course_models import Course, CourseAnswer, CourseProgress, UserCourseStats

async def get_user_answered_questions(user_id: str, course_id: str) -> List[str]:
    """Obtener lista de IDs de preguntas ya respondidas por el usuario"""
    answers = await db_manager.find_many(
        "course_answers",
        {"user_id": user_id, "course_id": course_id}
    )
    return [answer["question_id"] for answer in answers]

async def get_next_unanswered_question(user_id: str, course_id: str) -> Optional[str]:
    """Obtener el ID de la siguiente pregunta sin responder"""
    # Obtener el curso
    course_data = await db_manager.find_one("courses", {"_id": ObjectId(course_id)})
    if not course_data:
        return None
    
    # Obtener preguntas respondidas
    answered_questions = await get_user_answered_questions(user_id, course_id)
    answered_set = set(answered_questions)
    
    # Encontrar la primera pregunta sin responder
    for question in course_data.get("questions", []):
        if question["question_id"] not in answered_set:
            return question["question_id"]
    
    return None

async def calculate_course_completion_rate(user_id: str) -> float:
    """Calcular tasa de finalización de cursos del usuario"""
    progress_data = await db_manager.find_many(
        "course_progress",
        {"user_id": user_id}
    )
    
    if not progress_data:
        return 0.0
    
    completed = sum(1 for p in progress_data if p.get("is_completed", False))
    total = len(progress_data)
    
    return (completed / total) * 100 if total > 0 else 0.0

async def calculate_course_pass_rate(user_id: str) -> float:
    """Calcular tasa de aprobación de cursos del usuario"""
    progress_data = await db_manager.find_many(
        "course_progress",
        {"user_id": user_id, "is_completed": True}
    )
    
    if not progress_data:
        return 0.0
    
    passed = sum(1 for p in progress_data if p.get("is_passed", False))
    total = len(progress_data)
    
    return (passed / total) * 100 if total > 0 else 0.0

async def get_user_course_summary(user_id: str) -> Dict[str, Any]:
    """Obtener resumen completo de cursos del usuario"""
    # Obtener todos los progresos
    progress_data = await db_manager.find_many(
        "course_progress",
        {"user_id": user_id}
    )
    
    # Obtener información de cursos
    if progress_data:
        course_ids = [ObjectId(p["course_id"]) for p in progress_data]
        courses_data = await db_manager.find_many(
            "courses",
            {"_id": {"$in": course_ids}}
        )
        courses_dict = {str(c["_id"]): c for c in courses_data}
    else:
        courses_dict = {}
    
    # Calcular estadísticas
    total_started = len(progress_data)
    total_completed = sum(1 for p in progress_data if p.get("is_completed", False))
    total_passed = sum(1 for p in progress_data if p.get("is_passed", False))
    total_points = sum(p.get("total_points_earned", 0) for p in progress_data)
    
    # Estadísticas por tipo de curso
    course_type_stats = {}
    difficulty_stats = {}
    
    for progress in progress_data:
        course_info = courses_dict.get(progress["course_id"], {})
        
        # Por tipo
        course_type = course_info.get("course_type", "unknown")
        if course_type not in course_type_stats:
            course_type_stats[course_type] = {
                "started": 0, "completed": 0, "passed": 0, "points": 0
            }
        
        course_type_stats[course_type]["started"] += 1
        course_type_stats[course_type]["points"] += progress.get("total_points_earned", 0)
        
        if progress.get("is_completed"):
            course_type_stats[course_type]["completed"] += 1
        if progress.get("is_passed"):
            course_type_stats[course_type]["passed"] += 1
        
        # Por dificultad
        difficulty = course_info.get("difficulty", "unknown")
        if difficulty not in difficulty_stats:
            difficulty_stats[difficulty] = {
                "started": 0, "completed": 0, "passed": 0, "points": 0
            }
        
        difficulty_stats[difficulty]["started"] += 1
        difficulty_stats[difficulty]["points"] += progress.get("total_points_earned", 0)
        
        if progress.get("is_completed"):
            difficulty_stats[difficulty]["completed"] += 1
        if progress.get("is_passed"):
            difficulty_stats[difficulty]["passed"] += 1
    
    return {
        "total_started": total_started,
        "total_completed": total_completed,
        "total_passed": total_passed,
        "completion_rate": (total_completed / total_started * 100) if total_started > 0 else 0,
        "pass_rate": (total_passed / total_completed * 100) if total_completed > 0 else 0,
        "total_points_earned": total_points,
        "average_score": sum(p.get("percentage_score", 0) for p in progress_data) / total_started if total_started > 0 else 0,
        "course_type_breakdown": course_type_stats,
        "difficulty_breakdown": difficulty_stats,
        "progress_data": progress_data,
        "courses_info": courses_dict
    }

async def is_question_answered(user_id: str, course_id: str, question_id: str) -> bool:
    """Verificar si una pregunta específica ya fue respondida"""
    answer = await db_manager.find_one(
        "course_answers",
        {
            "user_id": user_id,
            "course_id": course_id,
            "question_id": question_id
        }
    )
    return answer is not None

async def get_course_leaderboard(course_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Obtener tabla de líderes para un curso específico"""
    # Obtener los mejores progresos para este curso
    progress_data = await db_manager.find_many(
        "course_progress",
        {"course_id": course_id, "is_completed": True},
        sort=[("percentage_score", -1), ("completed_at", 1)],
        limit=limit
    )
    
    # Obtener información de usuarios
    if progress_data:
        user_ids = [ObjectId(p["user_id"]) for p in progress_data]
        users_data = await db_manager.find_many(
            "users",
            {"_id": {"$in": user_ids}}
        )
        users_dict = {str(u["_id"]): u for u in users_data}
    else:
        users_dict = {}
    
    # Preparar leaderboard
    leaderboard = []
    for i, progress in enumerate(progress_data, 1):
        user_info = users_dict.get(progress["user_id"], {})
        leaderboard.append({
            "rank": i,
            "username": user_info.get("username", "Unknown"),
            "percentage_score": progress.get("percentage_score", 0),
            "points_earned": progress.get("total_points_earned", 0),
            "completed_at": progress.get("completed_at"),
            "time_taken": None  # Calcular si es necesario
        })
    
    return leaderboard

async def update_user_course_stats(user_id: str):
    """Actualizar estadísticas generales del usuario"""
    summary = await get_user_course_summary(user_id)
    
    stats_data = {
        "user_id": user_id,
        "total_courses_started": summary["total_started"],
        "total_courses_completed": summary["total_completed"],
        "total_courses_passed": summary["total_passed"],
        "total_points_earned": summary["total_points_earned"],
        "average_score": summary["average_score"],
        "course_type_stats": summary["course_type_breakdown"],
        "difficulty_stats": summary["difficulty_breakdown"],
        "updated_at": datetime.utcnow()
    }
    
    # Actualizar o crear estadísticas
    await db_manager.update_one(
        "user_course_stats",
        {"user_id": user_id},
        stats_data,
        upsert=True
    )
    
    return stats_data
