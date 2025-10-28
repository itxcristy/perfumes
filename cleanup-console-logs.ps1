# Simple Console Log Cleanup Script
# Removes console.log, console.debug, console.info from source files

Write-Host "Starting console log cleanup..." -ForegroundColor Cyan
Write-Host ""

$consoleLogsRemoved = 0
$filesModified = 0

# Get all TypeScript files in src directory
$files = Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx" -File

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Split into lines
    $lines = $content -split "`n"
    $newLines = @()
    
    foreach ($line in $lines) {
        # Check if line contains console.log, console.debug, or console.info
        if ($line -match '^\s*console\.(log|debug|info)\(') {
            $consoleLogsRemoved++
            $modified = $true
            # Skip this line (remove it)
        } else {
            $newLines += $line
        }
    }
    
    if ($modified) {
        $content = $newLines -join "`n"
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $filesModified++
        Write-Host "Cleaned: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Cleanup Summary:" -ForegroundColor Cyan
Write-Host "Console logs removed: $consoleLogsRemoved" -ForegroundColor Yellow
Write-Host "Files modified: $filesModified" -ForegroundColor Yellow
Write-Host ""
Write-Host "Cleanup complete!" -ForegroundColor Green

