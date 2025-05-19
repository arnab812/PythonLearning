import google.generativeai as genai
from config import GEMINI_API_KEY, DEFAULT_MODEL
import logging
from typing import List, Dict, Any, Tuple
import json
import requests
import traceback
from models.chat import QuizQuestion

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Dictionary to store token usage per API key
token_usage_store = {}

# Default quota limits for Gemini API (these are example values)
DEFAULT_QUOTA_LIMIT = 60000  # Default monthly token limit for free tier

def count_tokens_in_text(text: str) -> int:
    """
    Estimate the number of tokens in a text string.
    This is a simple approximation - in production, use a proper tokenizer.
    """
    # Simple approximation: 1 token ≈ 4 characters
    return len(text) // 4

def update_token_usage(api_key: str, tokens_used: int) -> None:
    """
    Update the token usage for a specific API key.
    """
    if api_key not in token_usage_store:
        token_usage_store[api_key] = 0

    token_usage_store[api_key] += tokens_used

async def check_api_key_quota(api_key: str) -> Dict[str, Any]:
    """
    Check the quota usage for a Google Gemini API key.
    Returns a dictionary with 'used' and 'limit' values.
    """
    try:
        # Configure Gemini with the provided API key to validate it
        genai.configure(api_key=api_key)

        # Validate the API key without making an actual request
        # We'll just check if the key is properly formatted and not empty
        if not api_key or len(api_key) < 10:  # Simple validation
            return {
                "used": 0,
                "limit": DEFAULT_QUOTA_LIMIT,
                "error": "Invalid API key format"
            }

        # Get the current token usage for this API key from our tracking system
        # This doesn't make any new API calls that would consume tokens
        current_usage = token_usage_store.get(api_key, 0)

        # In a production environment, you would:
        # 1. Store token usage in a database
        # 2. Reset usage counters at the beginning of each billing period
        # 3. Possibly query Google Cloud's monitoring APIs for accurate usage data

        return {
            "used": current_usage,
            "limit": DEFAULT_QUOTA_LIMIT,
            "is_valid": True
        }
    except Exception as e:
        logging.error(f"Error checking API key quota: {str(e)}")
        # Return an error response
        return {
            "used": token_usage_store.get(api_key, 0),
            "limit": DEFAULT_QUOTA_LIMIT,
            "error": str(e)
        }

def build_user_message(topic: str, language: str, query: str, familiarity_level: str, conversation_mode: str) -> str:
    return f"""
Explain the following Python concept:
- Topic: {topic}
- User Query: {query}
- Familiarity Level: {familiarity_level}
- Language: {language}
- Conversation Mode: {conversation_mode}
"""

def get_system_message() -> str:
    return """You are an expert Python tutor. Always use UI-friendly markdown formatting.

Instructions:
- Use code blocks with triple backticks and language identifiers (e.g., ```python).
- Use headings (##, ###), bold text (**text**), and italic text (*text*).
- Use numbered or bulleted lists where appropriate.
- Structure responses clearly.

Modes:
- If Conversation Mode is 'Socratic', guide the user with questions and hints.
- If Conversation Mode is 'Informative', provide clear and direct explanations.

Also include:
1. A detailed explanation of the topic.
2. Relevant code examples.
3. Best practices.
4. Common pitfalls to avoid.
"""

async def get_llm_response(topic: str, language: str, model: str, query: str, familiarity_level: str, conversation_mode: str, api_key: str = None) -> str:
    try:
        # Use provided API key or fallback to the one in config
        api_key = api_key or GEMINI_API_KEY

        if not api_key:
            return "Error: No API key provided. Please enter your Google Gemini API key in the settings."

        # Configure Gemini with the provided API key
        genai.configure(api_key=api_key)

        # Create a Gemini model instance
        gemini_model = genai.GenerativeModel(model_name=model or DEFAULT_MODEL)

        # Build the prompt with system and user messages
        system_prompt = get_system_message()
        user_prompt = build_user_message(topic, language, query, familiarity_level, conversation_mode)

        # Combine prompts for Gemini (which doesn't have separate system/user messages like OpenAI)
        combined_prompt = f"{system_prompt}\n\n{user_prompt}"

        # Generate content
        response = gemini_model.generate_content(combined_prompt)

        # Count tokens and update usage
        prompt_tokens = count_tokens_in_text(combined_prompt)
        response_tokens = count_tokens_in_text(response.text)
        total_tokens = prompt_tokens + response_tokens

        # Update token usage for this API key
        update_token_usage(api_key, total_tokens)

        # Return the text response
        return response.text

    except Exception as e:
        logging.error(f"Error while fetching LLM response: {str(e)}")

        if "api_key" in str(e).lower():
            return "Error: Invalid or missing Google Gemini API key. Please check the backend configuration."
        elif "network" in str(e).lower():
            return "Error: Network issue while connecting to Google Gemini API. Please try again later."
        elif "model" in str(e).lower():
            return f"Error: The selected model is not available. Please try a different model. Details: {str(e)}"
        else:
            return f"Error: An unexpected issue occurred while processing your request. Details: {str(e)}"

async def generate_quiz(topic: str, language: str, model: str, familiarity_level: str, api_key: str = None) -> List[QuizQuestion]:
    try:
        # Use provided API key or fallback to the one in config
        api_key = api_key or GEMINI_API_KEY

        if not api_key:
            logging.error("No API key provided for quiz generation")
            return []

        # Configure Gemini with the provided API key
        genai.configure(api_key=api_key)

        # Create a Gemini model instance with specific generation parameters
        generation_config = {
            "temperature": 0.2,  # Lower temperature for more deterministic output
            "top_p": 0.95,       # High top_p for more focused output
            "top_k": 40,         # Reasonable top_k
            "max_output_tokens": 8192,  # Higher token limit for complex JSON responses
        }

        # Always use the most capable model for quiz generation
        # Gemini 1.5 Pro is better at following structured output instructions
        # Use the model passed from the API call, or default to gemini-1.5-pro
        quiz_model = model if model in ["gemini-1.5-pro", "gemini-1.5-flash"] else "gemini-1.5-pro"
        gemini_model = genai.GenerativeModel(
            model_name=quiz_model,
            generation_config=generation_config
        )

        # Build the quiz generation prompt with clearer JSON formatting instructions
        prompt = f"""Generate a quiz to test knowledge on the Python topic: {topic}

The quiz should be appropriate for a learner with {familiarity_level} level of Python familiarity.
Create 5 multiple-choice questions with 4 options each.

For each question, provide:
1. A clear explanation of why the correct answer is right
2. 3-4 specific improvement suggestions in {language} for someone who got it wrong

IMPORTANT FORMATTING INSTRUCTIONS:
- Your response must be VALID JSON that can be parsed with json.loads()
- Do not include any text before or after the JSON
- Do not include markdown formatting like ```json or ```
- Do not include any explanations outside the JSON structure
- The correct_answer field must be a number (0, 1, 2, or 3) representing the index of the correct option

Format your response as a JSON array of objects with the following structure:
[
  {{
    "question": "Question text here",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correct_answer": 0,
    "explanation": "Detailed explanation of why this answer is correct",
    "improvement_suggestions": [
      "Suggestion 1 in {language}",
      "Suggestion 2 in {language}",
      "Suggestion 3 in {language}"
    ]
  }},
  ...
]

Ensure the questions are challenging but appropriate for the {familiarity_level} level.
The quiz should be in {language} language.
"""

        # Generate content with a stronger system prompt
        system_prompt = """You are a Python quiz generator that ALWAYS returns valid JSON.
Your output must be parseable by Python's json.loads() function.
Never include explanatory text outside the JSON structure.
Never use markdown code blocks.
Always ensure the correct_answer field is a number (0-3)."""

        combined_prompt = f"{system_prompt}\n\n{prompt}"

        # Generate content with safety settings adjusted for code generation
        safety_settings = [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_ONLY_HIGH"
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_ONLY_HIGH"
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_ONLY_HIGH"
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_ONLY_HIGH"
            },
        ]

        response = gemini_model.generate_content(
            combined_prompt,
            safety_settings=safety_settings
        )
        content = response.text

        # Count tokens and update usage
        prompt_tokens = count_tokens_in_text(combined_prompt)
        response_tokens = count_tokens_in_text(content)
        total_tokens = prompt_tokens + response_tokens

        # Update token usage for this API key
        update_token_usage(api_key, total_tokens)

        # Parse the JSON response with improved error handling
        try:
            # Clean the response to ensure it's valid JSON
            # Remove any markdown formatting or extra text
            cleaned_content = content.strip()

            # Remove markdown code blocks if present
            if cleaned_content.startswith("```json"):
                cleaned_content = cleaned_content.replace("```json", "", 1)
            if cleaned_content.startswith("```"):
                cleaned_content = cleaned_content.replace("```", "", 1)
            if cleaned_content.endswith("```"):
                cleaned_content = cleaned_content[:-3]

            cleaned_content = cleaned_content.strip()

            # Try to find JSON array in the response if there's extra text
            if not cleaned_content.startswith("["):
                start_idx = cleaned_content.find("[")
                end_idx = cleaned_content.rfind("]")
                if start_idx != -1 and end_idx != -1:
                    cleaned_content = cleaned_content[start_idx:end_idx+1]

            # Log the cleaned content for debugging
            logging.info(f"Attempting to parse JSON: {cleaned_content[:100]}...")

            # Parse the JSON
            quiz_data = json.loads(cleaned_content)

            if not quiz_data:
                logging.error("Quiz generation failed: Empty quiz data")
                return []

            if len(quiz_data) < 3:  # Accept at least 3 questions instead of requiring 5
                logging.error(f"Quiz generation failed: Only {len(quiz_data)} questions generated")
                return []

        except json.JSONDecodeError as e:
            logging.error(f"Error parsing quiz response: {str(e)}")
            logging.error(f"Raw response: {content[:500]}...")  # Log first 500 chars

            # Try one more time with a different approach - extract JSON using regex
            import re
            try:
                json_pattern = r'\[\s*\{.*\}\s*\]'
                json_match = re.search(json_pattern, content, re.DOTALL)
                if json_match:
                    potential_json = json_match.group(0)
                    quiz_data = json.loads(potential_json)
                    logging.info("Successfully parsed JSON using regex approach")
                else:
                    return []
            except Exception:
                return []

        questions = []
        for q in quiz_data:
            try:
                # Validate and fix the correct_answer field if needed
                correct_answer = q.get("correct_answer")

                # Handle string values (convert to int)
                if isinstance(correct_answer, str):
                    try:
                        correct_answer = int(correct_answer)
                    except ValueError:
                        # If it can't be converted, default to 0
                        logging.warning(f"Invalid correct_answer format: {correct_answer}, defaulting to 0")
                        correct_answer = 0

                # Ensure correct_answer is within valid range
                options = q.get("options", [])
                if not options:
                    logging.error("Question has no options")
                    continue

                if correct_answer is None or not isinstance(correct_answer, int) or correct_answer < 0 or correct_answer >= len(options):
                    logging.warning(f"Invalid correct_answer: {correct_answer}, defaulting to 0")
                    correct_answer = 0

                # Ensure we have improvement suggestions
                improvement_suggestions = q.get("improvement_suggestions", [])
                if not improvement_suggestions:
                    improvement_suggestions = [
                        f"Review the concept of {topic} in more detail.",
                        f"Practice with more examples to better understand {topic}.",
                        f"Consider reviewing the documentation for {topic}."
                    ]

                # Create the question object
                questions.append(QuizQuestion(
                    question=q.get("question", "Question text not provided"),
                    options=options,
                    correct_answer=correct_answer,
                    explanation=q.get("explanation", "Explanation not provided"),
                    improvement_suggestions=improvement_suggestions
                ))
            except KeyError as e:
                logging.error(f"Missing required field in quiz question: {str(e)}")
                continue
            except Exception as e:
                logging.error(f"Error processing quiz question: {str(e)}")
                continue

        if not questions:
            logging.error("No valid questions were generated")
            return []

        # Limit to 5 questions maximum
        return questions[:5]
    except Exception as e:
        error_details = traceback.format_exc()
        logging.error(f"Error while generating quiz: {str(e)}")
        logging.error(f"Detailed traceback: {error_details}")
        return []
