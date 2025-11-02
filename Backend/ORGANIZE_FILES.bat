@echo off
echo Creating folder structure...
cd /d "%~dp0"

mkdir routes 2>nul
mkdir middleware 2>nul
mkdir utils 2>nul
mkdir models 2>nul

echo Moving files to correct folders...

REM Move route files
move auth-routes.js routes\auth.js 2>nul
move products-routes.js routes\products.js 2>nul
move categories-routes.js routes\categories.js 2>nul
move customers-routes.js routes\customers.js 2>nul
move suppliers-routes.js routes\suppliers.js 2>nul
move invoices-routes.js routes\invoices.js 2>nul
move purchases-routes.js routes\purchases.js 2>nul
move stock-routes.js routes\stock.js 2>nul
move reports-routes.js routes\reports.js 2>nul
move dashboard-routes.js routes\dashboard.js 2>nul

REM Move middleware files
move errorHandler.js middleware\ 2>nul
move auth.js middleware\ 2>nul

REM Move util files
move validator.js utils\ 2>nul
move invoiceCalculator.js utils\ 2>nul
move pricing.js utils\ 2>nul
move invoiceService.js utils\ 2>nul

REM Move model files
move *-model.js models\ 2>nul

echo.
echo File organization complete!
echo Now run: npm run dev
pause
