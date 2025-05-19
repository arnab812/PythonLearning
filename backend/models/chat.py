from pydantic import BaseModel
from typing import Optional, List

class ChatRequest(BaseModel):
    topic: str
    language: str
    model: str
    query: str
    familiarity_level: str
    conversation_mode: str
    api_key: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    error: Optional[str] = None
    # sections: Optional[dict] = None  # New field for structured content

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: int  # Index of the correct answer in options
    explanation: str
    improvement_suggestions: List[str]

class QuizResponse(BaseModel):
    questions: List[QuizQuestion]
    error: Optional[str] = None

class QuotaRequest(BaseModel):
    api_key: str

class QuotaResponse(BaseModel):
    used: int
    limit: int
    error: Optional[str] = None