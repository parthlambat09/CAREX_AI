@echo off
echo ==============================================================================
echo CAREX Local Server Launcher (AIIMS Hospital Edition)
echo ==============================================================================
echo [1/2] Starting FastAPI Backend Engine on http://localhost:8000 ...
start "CAREX Backend" cmd /k "cd /d %~dp0backend && .\venv\Scripts\python.exe main.py"

echo [2/2] Starting React Vite Frontend Portals on http://localhost:5173 ...
start "CAREX Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo CAREX is launching!
echo  - Doctor Portal:              http://localhost:5173/doctor
echo  - Nurse Portal:               http://localhost:5173/nurse
echo  - Hospital Management Portal: http://localhost:5173/hospital-management
echo  - Patient & Family Portal:    http://localhost:5173/patient/dashboard
echo  - FastAPI Swagger API Docs:   http://localhost:8000/docs
echo ==============================================================================
