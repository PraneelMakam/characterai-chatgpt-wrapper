@echo off
echo Starting CharacterAI ChatGPT Wrapper...
echo.

REM Check if .env file exists
if not exist .env (
    echo ERROR: .env file not found!
    echo Please copy env.example to .env and add your OpenAI API key
    pause
    exit /b 1
)

REM Start the development server
echo Starting development server...
npm run dev

pause 