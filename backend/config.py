import os
from dotenv import load_dotenv

load_dotenv()

# Google Gemini Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
DEFAULT_MODEL = "gemini-1.5-flash"  # Default model to use if not specified

# Available models
AVAILABLE_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro", "gemini-1.0-pro-vision"]

# Available languages
AVAILABLE_LANGUAGES = ["English", "Hindi", "Spanish", "French", "German", "Bengali"]

# Available chapters and topics
AVAILABLE_CHAPTERS = [
    "Familiarization with the basics of Python programming",
    "Knowledge of data types",
    "Operators",
    "Expressions, statement, type conversion and input/output",
    "Errors",
    "Flow of Control",
    "Conditional statements",
    "Iterative Statement",
    "Strings",
    "Lists",
    "Introduction to Python modules",
    "Functions"
]

# Topics organized by chapter
CHAPTER_TOPICS = {
    "Familiarization with the basics of Python programming": [
        "Introduction to Python",
        "Features of Python",
        "Executing a simple 'hello world' program",
        "Execution modes; interactive mode and script mode",
        "Python character set",
        "Python tokens (keyword, identifier, literal, operator, punctuator)",
        "Variables",
        "Concept of L-value and R-value",
        "Use of comments",
    ],
    "Knowledge of data types": [
        "Number (integer, floating point, complex)",
        "Boolean",
        "Sequence (string, list, tuple)",
        "None",
        "Mapping (dictionary)",
        "mutable and immutable data types",
    ],
    "Operators": [
        "Arithmetic operators",
        "Relational operators",
        "Bitwise operators",
        "Logical operators",
        "Assignment operators",
        "Augmented assignment operators",
        "Identity operators (is, is not)",
        "Membership operators (in, not in)",
    ],
    "Expressions, statement, type conversion and input/output": [
        "Precedence of operators",
        "Expression",
        "Evaluation of an expression",
        "Type-conversion (explicit and implicit conversion)",
        "Accepting data as input from the console and displaying output",
    ],
    "Errors": [
        "Syntax errors",
        "Logical errors"
        "Run-time errors",
    ],
    "Flow of Control": [
        "Introduction to flow of control",
        "Use of indentation in control flow",
        "Sequential flow in control flow",
        "Conditional and iterative flow",
    ],
    "Conditional statements": [
        "if-statement",
        "if-else statement",
        "if-elif-else statement",
        "Nested if-else statement",
    ],
    "Iterative Statement": [
        "while loop",
        "for loop",
        "range() function",
        "break statement",
        "continue statement",
        "pass statement",
        "nested loops"
    ],
    "Strings": [
        "Introduction to strings",
        "String literals",
        "String operations",
        "String methods",
        "String formatting",
        "Traversing a string using loops",
        "Built in functions/methods for strings"
    ],
    "Lists": [
        "Introduction to lists",
        "List literals",
        "List operations (concatenation, repetition, membership and slicing)",
        "List methods",
        "List comprehensions",
        "Traversing a list using loops",
        "Built in functions/methods for lists"
    ],
    "Introduction to Python modules": [
        "Introduction to modules",
        "Importing modules",
        "Built-in modules",
        "User-defined modules",
        "Importing module using 'import <module>' and using from statement",
        "Importing math module",
        "pi(), sqrt(), ceil(), floor(), pow(), fabs(), sin(), cos(), tan()), random module (random(), randint(), randrange()",
        "Statistics module (mean(), median(), mode())"
    ],
    "Functions": [
        "Introduction to functions",
        "Types of function (built-in functions, functions defined in module, user defined functions)",
        "Creating user defined function",
        "Arguments and parameters",
        "Default parameters",
        "Positional parameters",
        "Function returning value(s)",
        "Flow of execution",
        "Scope of a variable (global scope, local scope)"
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