# Production Cleanup Script - Complete
# Removes all development artifacts, console logs, mock data, and prepares for production

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Production Cleanup & Security Audit" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$totalChanges = 0
$filesModified = 0
$consoleLogsRemoved = 0
$mockDataRemoved = 0
$securityIssues = @()

# Function to remove console logs from a file
function Remove-ConsoleLogs {
    param($filePath)
    
    $content = Get-Content $filePath -Raw
    $originalContent = $content
    $modified = $false
    
    # Remove console.log, console.debug, console.info (keep console.error and console.warn)
    $patterns = @(
        '^\s*console\.log\([^)]*\);?\s*$',
        '^\s*console\.debug\([^)]*\);?\s*$',
        '^\s*console\.info\([^)]*\);?\s*$'
    )
    
    $lines = $content -split "`n"
    $newLines = @()
    
    foreach ($line in $lines) {
        $shouldRemove = $false
        foreach ($pattern in $patterns) {
            if ($line -match $pattern) {
                $shouldRemove = $true
                $script:consoleLogsRemoved++
                $modified = $true
                break
            }
        }
        if (-not $shouldRemove) {
            $newLines += $line
        }
    }
    
    if ($modified) {
        $content = $newLines -join "`n"
        Set-Content -Path $filePath -Value $content -NoNewline
        return $true
    }
    return $false
}

# Function to check for security issues
function Check-SecurityIssues {
    param($filePath)

    $content = Get-Content $filePath -Raw
    $issues = @()

    # Check for hardcoded credentials
    if ($content -match 'password.*=.*["''][^"'']{8,}["'']') {
        $issues += "Potential hardcoded credentials found"
    }

    # Check for TODO/FIXME in production code
    if ($content -match '(TODO|FIXME):') {
        $issues += "TODO/FIXME comments found"
    }

    # Check for debugger statements
    if ($content -match 'debugger') {
        $issues += "Debugger statement found"
    }

    # Check for eval usage
    if ($content -match 'eval\s*\(') {
        $issues += "Eval usage found (security risk)"
    }

    return $issues
}

Write-Host "Step 1: Removing console logs from source files..." -ForegroundColor Yellow
$sourceFiles = Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx" -File

foreach ($file in $sourceFiles) {
    if (Remove-ConsoleLogs -filePath $file.FullName) {
        $filesModified++
        Write-Host "  ✓ Cleaned: $($file.Name)" -ForegroundColor Green
    }
    
    # Check for security issues
    $issues = Check-SecurityIssues -filePath $file.FullName
    if ($issues.Count -gt 0) {
        $securityIssues += @{
            File = $file.FullName
            Issues = $issues
        }
    }
}

Write-Host ""
Write-Host "Step 2: Removing console logs from server files..." -ForegroundColor Yellow
$serverFiles = Get-ChildItem -Path "server" -Recurse -Include "*.ts" -File -ErrorAction SilentlyContinue

foreach ($file in $serverFiles) {
    if (Remove-ConsoleLogs -filePath $file.FullName) {
        $filesModified++
        Write-Host "  ✓ Cleaned: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Step 3: Removing mock data files..." -ForegroundColor Yellow

# List of mock data files to remove
$mockDataFiles = @(
    "src\data\mockProducts.ts",
    "src\data\mockUsers.ts",
    "src\data\mockOrders.ts",
    "src\data\sampleData.ts",
    "server\scripts\seedSampleProducts.ts",
    "server\scripts\seedProducts.ts",
    "server\scripts\testAutoInit.ts",
    "server\scripts\testAuth.ts"
)

foreach ($mockFile in $mockDataFiles) {
    if (Test-Path $mockFile) {
        Remove-Item $mockFile -Force
        $mockDataRemoved++
        Write-Host "  ✓ Removed: $mockFile" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Step 4: Cleaning development scripts..." -ForegroundColor Yellow

# Remove development-only scripts
$devScripts = @(
    "scripts\validate-production.js",
    "scripts\cleanup-production.ps1"
)

foreach ($script in $devScripts) {
    if (Test-Path $script) {
        # Don't actually remove these, just note them
        Write-Host "  ℹ Development script: $script (keep for future use)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Step 5: Updating environment configuration..." -ForegroundColor Yellow

# Check if .env has development settings
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    
    if ($envContent -match 'VITE_DIRECT_LOGIN_ENABLED\s*=\s*true') {
        Write-Host "  ⚠ WARNING: Direct login is enabled in .env" -ForegroundColor Red
        Write-Host "    Set VITE_DIRECT_LOGIN_ENABLED=false for production" -ForegroundColor Yellow
    }
    
    if ($envContent -match 'NODE_ENV\s*=\s*development') {
        Write-Host "  ℹ NODE_ENV is set to development" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Step 6: Security audit results..." -ForegroundColor Yellow

if ($securityIssues.Count -gt 0) {
    Write-Host "  ⚠ Security issues found:" -ForegroundColor Red
    foreach ($issue in $securityIssues) {
        Write-Host "    File: $($issue.File)" -ForegroundColor Yellow
        foreach ($i in $issue.Issues) {
            Write-Host "      - $i" -ForegroundColor Red
        }
    }
} else {
    Write-Host "  ✓ No security issues detected" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Cleanup Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Console logs removed: $consoleLogsRemoved" -ForegroundColor Yellow
Write-Host "  Files modified: $filesModified" -ForegroundColor Yellow
Write-Host "  Mock data files removed: $mockDataRemoved" -ForegroundColor Yellow
Write-Host "  Security issues found: $($securityIssues.Count)" -ForegroundColor $(if ($securityIssues.Count -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($securityIssues.Count -gt 0) {
    Write-Host "⚠ Please review and fix security issues before deploying!" -ForegroundColor Red
} else {
    Write-Host "✓ Production cleanup complete!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review the changes" -ForegroundColor White
Write-Host "2. Test the application locally" -ForegroundColor White
Write-Host "3. Run npm run build to verify build succeeds" -ForegroundColor White
Write-Host "4. Review PRODUCTION_READINESS_CHECKLIST.md" -ForegroundColor White
Write-Host "5. Deploy to Netlify" -ForegroundColor White
Write-Host ""

