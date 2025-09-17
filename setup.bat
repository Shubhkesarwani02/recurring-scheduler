@echo off
setlocal enabledelayedexpansion

echo 🚀 Setting up Recurring Scheduler Development Environment
echo ==================================================

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js ^>= 18.0.0
    pause
    exit /b 1
)

REM Get Node.js version
for /f "tokens=1" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js version %NODE_VERSION% detected

echo 📦 Installing root dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)

echo 📦 Installing backend dependencies...
cd backend
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

echo 📦 Installing frontend dependencies...
cd frontend
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo ⚙️  Setting up environment files...

if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env" >nul
    echo 📄 Created backend\.env from example
    echo ⚠️  Please update backend\.env with your database credentials
) else (
    echo 📄 backend\.env already exists
)

if not exist "frontend\.env.local" (
    copy "frontend\.env.example" "frontend\.env.local" >nul
    echo 📄 Created frontend\.env.local from example
) else (
    echo 📄 frontend\.env.local already exists
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo Next steps:
echo 1. Update backend\.env with your PostgreSQL database URL
echo 2. Make sure your database has the required tables (see README.md)
echo 3. Start the development servers:
echo    npm run dev (starts both frontend and backend)
echo    OR
echo    npm run dev:backend (backend only - port 5000)
echo    npm run dev:frontend (frontend only - port 3000)
echo.
echo 🌐 Application URLs:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:5000/api
echo    Health Check: http://localhost:5000/health
echo.
echo Happy coding! 🎯
pause