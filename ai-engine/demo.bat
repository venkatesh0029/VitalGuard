@echo off
echo ========================================
echo 🏥 VITALGUARD AI - Live Demo
echo ========================================
echo.

echo [1/5] 😌 Normal - Resting State
python update_vitals.py normal
timeout /t 4 /nobreak >nul
echo.

echo [2/5] 🚶 Walking - Light Activity
python update_vitals.py walking
timeout /t 4 /nobreak >nul
echo.

echo [3/5] ⚠️  WARNING - Elevated Vitals
python update_vitals.py warning
timeout /t 4 /nobreak >nul
echo.

echo [4/5] 🚨 CRITICAL - Emergency Alert!
python update_vitals.py critical
timeout /t 4 /nobreak >nul
echo.

echo [5/5] ✅ Recovery - Back to Normal
python update_vitals.py recovery
echo.
echo ========================================
echo 🎉 Demo Complete!
echo ========================================
pause