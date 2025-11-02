# PowerShell script to organize Backend files
Write-Host "Organizing Backend files..." -ForegroundColor Green

# Create directories
New-Item -ItemType Directory -Force -Path "utils" | Out-Null
New-Item -ItemType Directory -Force -Path "middleware" | Out-Null
New-Item -ItemType Directory -Force -Path "routes" | Out-Null
New-Item -ItemType Directory -Force -Path "services" | Out-Null

Write-Host "Created directories: utils, middleware, routes, services" -ForegroundColor Yellow

# Move utils
if (Test-Path "pricing.js") {
    Move-Item -Force "pricing.js" "utils/pricing.js"
    Write-Host "Moved pricing.js to utils/" -ForegroundColor Cyan
}

if (Test-Path "invoiceCalculator.js") {
    Move-Item -Force "invoiceCalculator.js" "utils/invoiceCalculator.js"
    Write-Host "Moved invoiceCalculator.js to utils/" -ForegroundColor Cyan
}

# Move middleware
if (Test-Path "auth.js") {
    Move-Item -Force "auth.js" "middleware/auth.js"
    Write-Host "Moved auth.js to middleware/" -ForegroundColor Cyan
}

if (Test-Path "errorHandler.js") {
    Move-Item -Force "errorHandler.js" "middleware/errorHandler.js"
    Write-Host "Moved errorHandler.js to middleware/" -ForegroundColor Cyan
}

if (Test-Path "validator.js") {
    Move-Item -Force "validator.js" "middleware/validator.js"
    Write-Host "Moved validator.js to middleware/" -ForegroundColor Cyan
}

# Move models
if (Test-Path "categories-model.js") {
    Move-Item -Force "categories-model.js" "db/models/categories.js"
    Write-Host "Moved categories-model.js to db/models/categories.js" -ForegroundColor Cyan
}

if (Test-Path "customers-model.js") {
    Move-Item -Force "customers-model.js" "db/models/customers.js"
    Write-Host "Moved customers-model.js to db/models/customers.js" -ForegroundColor Cyan
}

if (Test-Path "suppliers-model.js") {
    Move-Item -Force "suppliers-model.js" "db/models/suppliers.js"
    Write-Host "Moved suppliers-model.js to db/models/suppliers.js" -ForegroundColor Cyan
}

if (Test-Path "invoices-model.js") {
    Move-Item -Force "invoices-model.js" "db/models/invoices.js"
    Write-Host "Moved invoices-model.js to db/models/invoices.js" -ForegroundColor Cyan
}

if (Test-Path "invoiceItems-model.js") {
    Move-Item -Force "invoiceItems-model.js" "db/models/invoiceItems.js"
    Write-Host "Moved invoiceItems-model.js to db/models/invoiceItems.js" -ForegroundColor Cyan
}

if (Test-Path "purchases-model.js") {
    Move-Item -Force "purchases-model.js" "db/models/purchases.js"
    Write-Host "Moved purchases-model.js to db/models/purchases.js" -ForegroundColor Cyan
}

if (Test-Path "stockMovements-model.js") {
    Move-Item -Force "stockMovements-model.js" "db/models/stockMovements.js"
    Write-Host "Moved stockMovements-model.js to db/models/stockMovements.js" -ForegroundColor Cyan
}

if (Test-Path "auditLogs-model.js") {
    Move-Item -Force "auditLogs-model.js" "db/models/auditLogs.js"
    Write-Host "Moved auditLogs-model.js to db/models/auditLogs.js" -ForegroundColor Cyan
}

Write-Host "`nFile organization complete! ✅" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Run: npm install jsonwebtoken bcryptjs cors nodemon" -ForegroundColor White
Write-Host "2. Update .env with JWT_SECRET" -ForegroundColor White
Write-Host "3. Run: npm run dev" -ForegroundColor White
