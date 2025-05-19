from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.chat import ChatRequest, ChatResponse, QuizResponse, QuotaRequest, QuotaResponse
from llm_handler import get_llm_response, generate_quiz, check_api_key_quota
from config import (
    AVAILABLE_MODELS,
    AVAILABLE_LANGUAGES,
    AVAILABLE_TOPICS,
    AVAILABLE_CHAPTERS,
    CHAPTER_TOPICS,
    FAMILIARITY_LEVELS,
    CONVERSATION_MODES
)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# @app.get("/api/config")
@app.get("/")
def read_root():
    return {"message": "Welcome to my FastAPI app!"}
async def get_config():
    return {
        "models": AVAILABLE_MODELS,
        "languages": AVAILABLE_LANGUAGES,
        "chapters": AVAILABLE_CHAPTERS,
        "chapterTopics": CHAPTER_TOPICS,
        "topics": AVAILABLE_TOPICS,  # Keep for backward compatibility
        "familiarityLevels": FAMILIARITY_LEVELS,
        "conversationModes": CONVERSATION_MODES
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        response = await get_llm_response(
            topic=request.topic,
            language=request.language,
            model=request.model,
            query=request.query,
            familiarity_level=request.familiarity_level,
            conversation_mode=request.conversation_mode,
            api_key=request.api_key
        )
        return ChatResponse(response=response)
    except Exception as e:
        return ChatResponse(response="", error=str(e))

@app.post("/api/quiz", response_model=QuizResponse)
async def quiz(request: ChatRequest):
    try:
        # Validate API key
        if not request.api_key:
            return QuizResponse(
                questions=[],
                error="API key is required for quiz generation. Please enter your Google Gemini API key."
            )

        # Use Gemini 1.5 Pro for quiz generation regardless of the selected model
        # This ensures the most capable model is used for structured output
        questions = await generate_quiz(
            topic=request.topic,
            language=request.language,
            model="gemini-1.5-flash",  # Force using the most capable model
            familiarity_level=request.familiarity_level,
            api_key=request.api_key
        )

        if not questions or len(questions) == 0:
            return QuizResponse(
                questions=[],
                error="Failed to generate quiz questions. Please try again with a different topic."
            )

        return QuizResponse(questions=questions)
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Quiz generation error: {error_details}")
        return QuizResponse(
            questions=[],
            error=f"An error occurred while generating the quiz: {str(e)}"
        )

@app.post("/api/check-quota", response_model=QuotaResponse)
async def check_quota(request: QuotaRequest):
    try:
        quota_info = await check_api_key_quota(request.api_key)
        return QuotaResponse(
            used=quota_info.get("used", 0),
            limit=quota_info.get("limit", 0),
            error=quota_info.get("error")
        )
    except Exception as e:
        return QuotaResponse(used=0, limit=0, error=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
