@echo off
setlocal

:: Set base directory for the project
set "BASE_DIR=C:\Users\Errol Jay Batay-an\Desktop\Private Files\Coding System Projects\RSLT"

echo Starting application in PowerShell...

:: Launch first PowerShell for backend (virtual env + server.py)
start powershell -NoExit -Command ^
    "Write-Host 'Activating virtual environment...'; " ^
    "cd '%BASE_DIR%'; " ^
    "if (Test-Path '.env\Scripts\activate') { " ^
    "    & '.env\Scripts\activate'; " ^
    "    Write-Host 'Virtual environment activated.'; " ^
    "} else { " ^
    "    Write-Host 'Error: .env\Scripts\activate not found!'; exit 1 }; " ^
    "Write-Host 'Starting backend server...'; " ^
    "cd '%BASE_DIR%\backend'; " ^
    "python server.py"

:: Launch second PowerShell for frontend (npm run dev)
start powershell -NoExit -Command ^
    "Write-Host 'Starting frontend development server...'; " ^
    "cd '%BASE_DIR%\my-app'; " ^
    "npm run dev"

endlocal