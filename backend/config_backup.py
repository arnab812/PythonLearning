import os
from dotenv import load_dotenv

load_dotenv()

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DEFAULT_MODEL = "gpt-4.5-preview"

# Available models
AVAILABLE_MODELS = ["gpt-4.5-preview", "o3", "gpt-4.1", "gpt-4o"]

# Available languages
AVAILABLE_LANGUAGES = ["English", "Hindi", "Spanish", "French", "German", "Bengali"]

# Available chapters and topics
AVAILABLE_CHAPTERS = [
    "Introduction to Python",
    "Control Flow",
    "Functions and Modules",
    "Data Structures",
    "Object-Oriented Programming",
    "File Operations",
    "Advanced Python"
]

# Topics organized by chapter
CHAPTER_TOPICS = {
    "Introduction to Python": [
        "Variables",
        "Data Types",
        "Operators",
        "Basic Input/Output"
    ],
    "Control Flow": [
        "Conditionals",
        "Loops",
        "Exception Handling"
    ],
    "Functions and Modules": [
        "Functions",
        "Lambda Functions",
        "Modules and Packages",
        "Decorators"
    ],
    "Data Structures": [
        "Lists",
        "Tuples",
        "Dictionaries",
        "Sets",
        "List Comprehensions"
    ],
    "Object-Oriented Programming": [
        "Classes and Objects",
        "Inheritance",
        "Polymorphism",
        "Encapsulation"
    ],
    "File Operations": [
        "File Handling",
        "Working with CSV",
        "Working with JSON"
    ],
    "Advanced Python": [
        "Generators",
        "Context Managers",
        "Multithreading",
        "Multiprocessing"
    ]
}

# Flat list of all topics (for backward compatibility)
AVAILABLE_TOPICS = [topic for topics in CHAPTER_TOPICS.values() for topic in topics]

# Python familiarity levels
FAMILIARITY_LEVELS = [
    "Novice",
    "Advanced Beginner",
    "Competent",
    "Proficient",
    "Expert"
]

# Conversation modes
CONVERSATION_MODES = [
    "Informative",
    "Socratic"
]