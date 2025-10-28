# Remove Mock Data Files Script
# Removes all development mock data, sample data, and test files

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Removing Mock Data Files" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$filesRemoved = 0
$errors = @()

# List of mock data files to remove
$mockDataFiles = @(
    "server\scripts\seedSampleProducts.ts",
    "server\scripts\seedProducts.ts",
    "server\scripts\testAutoInit.ts",
    "server\scripts\testAuth.ts",
    "server\scripts\fixPasswords.ts",
    "server\dist\scripts\seedSampleProducts.js",
    "server\dist\scripts\seedProducts.js",
    "server\dist\scripts\testAutoInit.js",
    "server\dist\scripts\testAuth.js",
    "server\dist\scripts\fixPasswords.js",
    "src\data\mockProducts.ts",
    "src\data\mockUsers.ts",
    "src\data\mockOrders.ts",
    "src\data\sampleData.ts"
)

Write-Host "Removing mock data files..." -ForegroundColor Yellow
Write-Host ""

foreach ($file in $mockDataFiles) {
    if (Test-Path $file) {
        try {
            Remove-Item $file -Force
            $filesRemoved++
            Write-Host "  Removed: $file" -ForegroundColor Green
        } catch {
            $errors += "Failed to remove $file : $_"
            Write-Host "  Failed: $file" -ForegroundColor Red
        }
    } else {
        Write-Host "  Not found: $file" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Files removed: $filesRemoved" -ForegroundColor Yellow
Write-Host "  Errors: $($errors.Count)" -ForegroundColor $(if ($errors.Count -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($errors.Count -gt 0) {
    Write-Host "Errors encountered:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "Mock data files removed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Update package.json to remove these scripts:" -ForegroundColor Yellow
Write-Host "  - db:seed" -ForegroundColor White
Write-Host "  - db:test-auto-init" -ForegroundColor White
Write-Host "  - db:test:auth" -ForegroundColor White
Write-Host ""

