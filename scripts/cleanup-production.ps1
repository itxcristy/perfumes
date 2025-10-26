# Production Cleanup Script
# Removes console.log statements and TODO comments from source code

Write-Host "Starting Production Cleanup..." -ForegroundColor Cyan

# Counter for changes
$consoleLogsRemoved = 0
$todosRemoved = 0
$filesModified = 0

# Get all TypeScript files in src directory
$files = Get-ChildItem -Path "..\src" -Recurse -Include "*.ts","*.tsx" -File

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false

    # Remove console.log statements (but keep console.error and console.warn)
    $pattern = '^\s*console\.(log|debug|info)\([^)]*\);?\s*$'
    $lines = $content -split "`n"
    $newLines = @()

    foreach ($line in $lines) {
        if ($line -match $pattern) {
            $consoleLogsRemoved++
            $modified = $true
            # Skip this line (remove it)
        } else {
            $newLines += $line
        }
    }

    $content = $newLines -join "`n"

    # Remove TODO and FIXME comments
    $todoPattern = '^\s*//\s*(TODO|FIXME):.*$'
    $lines = $content -split "`n"
    $newLines = @()

    foreach ($line in $lines) {
        if ($line -match $todoPattern) {
            $todosRemoved++
            $modified = $true
            # Skip this line (remove it)
        } else {
            $newLines += $line
        }
    }

    $content = $newLines -join "`n"

    # Save if modified
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $filesModified++
        Write-Host "  Cleaned: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Cleanup Summary:" -ForegroundColor Cyan
Write-Host "  Console.log statements removed: $consoleLogsRemoved" -ForegroundColor Yellow
Write-Host "  TODO/FIXME comments removed: $todosRemoved" -ForegroundColor Yellow
Write-Host "  Files modified: $filesModified" -ForegroundColor Yellow
Write-Host ""
Write-Host "Production cleanup complete!" -ForegroundColor Green

