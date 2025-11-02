@echo off
echo Installing required packages...
cd /d "%~dp0"
npm install cors bcrypt jsonwebtoken nodemon
echo.
echo Installation complete!
echo Now run: npm run dev
pause
