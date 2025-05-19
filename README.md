# Python Learning App

This is a full-stack Python learning application with a FastAPI backend and a React frontend. The project is designed to help users learn Python interactively, featuring chat, quizzes, and code highlighting.

## Features
- **Frontend**: React, Material UI, Speech Recognition, Syntax Highlighting
- **Backend**: FastAPI, Google Generative AI, Pydantic
- **Chatbot**: Interactive chat for learning Python
- **Quiz**: Test your Python knowledge

## Project Structure
```
backend/
  main.py
  requirements.txt
  ...
frontend/
  package.json
  src/
    App.jsx
    ...
```

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/arnab812/PythonLearning.git
cd PythonLearning
```

### 2. Backend Setup
- Create a virtual environment and activate it:
  ```bash
  cd backend
  python3 -m venv venv
  source venv/bin/activate  # On Windows: venv\Scripts\activate
  pip install -r requirements.txt
  ```
- Start the FastAPI server:
  ```bash
  uvicorn main:app --reload
  ```

### 3. Frontend Setup
- Install dependencies and start the React app:
  ```bash
  cd ../frontend
  npm install
  npm start
  ```

### 4. Access the App
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8000/docs](http://localhost:8000/docs)

## Notes
- Make sure to set up your environment variables as needed (see `.env.example` if provided).
- The `node_modules` folder (frontend) and Python virtual environment (backend) are not included in version control.

## License
See [LICENSE](LICENSE) for details.
