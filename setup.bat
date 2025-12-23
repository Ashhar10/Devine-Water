@echo off
echo ====================================
echo Water Management System - Setup
echo ====================================
echo.

echo Step 1: Creating .env file...
cd backend
copy .env.example .env >nul 2>&1
echo ✓ .env file created
echo.

echo Step 2: Installing Backend Dependencies...
call npm install
echo ✓ Backend dependencies installed
echo.

echo Step 3: Generating Prisma Client...
call npx prisma generate
echo ✓ Prisma client generated
echo.

echo Step 4: Pushing schema to Supabase...
call npx prisma db push
echo ✓ Database schema created
echo.

echo Step 5: Seeding database...
call npm run seed
echo ✓ Database seeded with demo users
echo.

cd ..
echo Step 6: Installing Frontend Dependencies...
cd frontend
call npm install
echo ✓ Frontend dependencies installed
echo.

cd ..
echo ====================================
echo Setup Complete! ✓
echo ====================================
echo.
echo To start the application:
echo.
echo Terminal 1 (Backend):
echo   cd backend
echo   npm run dev
echo.
echo Terminal 2 (Frontend):
echo   cd frontend
echo   npm run dev
echo.
echo Then visit: http://localhost:5173
echo Login: admin / admin123
echo.
pause
