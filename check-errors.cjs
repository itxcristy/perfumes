#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 PERFUME SITE ERROR CHECKER - Starting comprehensive check...\n');

// Function to check for build errors by running vite build in dry mode
function checkBuildErrors() {
    return new Promise((resolve) => {
        console.log('📦 Running build check...');
        const buildProcess = spawn('npm', ['run', 'build'], {
            cwd: process.cwd(),
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true
        });

        let buildOutput = '';
        let buildErrors = '';

        buildProcess.stdout.on('data', (data) => {
            buildOutput += data.toString();
        });

        buildProcess.stderr.on('data', (data) => {
            buildErrors += data.toString();
        });

        buildProcess.on('close', (code) => {
            console.log(`Build process exited with code: ${code}`);

            if (code === 0) {
                console.log('✅ BUILD SUCCESS - No build errors found');
            } else {
                console.log('❌ BUILD FAILED - Errors found:');
                console.log(buildErrors);
            }

            resolve({
                success: code === 0,
                output: buildOutput,
                errors: buildErrors,
                code: code
            });
        });

        // Timeout after 30 seconds
        setTimeout(() => {
            buildProcess.kill();
            console.log('⏰ Build check timed out');
            resolve({ success: false, output: '', errors: 'Timeout', code: -1 });
        }, 30000);
    });
}

// Function to check for framer-motion imports using grep/findstr
function checkFramerMotionImports() {
    console.log('🎬 Scanning for remaining framer-motion imports...');

    try {
        // Use grep on Unix/Linux/Mac, findstr on Windows
        let command, args;
        if (process.platform === 'win32') {
            command = 'findstr';
            args = ['/s', '/i', 'framer-motion', 'src\\*.tsx', 'src\\*.ts'];
        } else {
            command = 'grep';
            args = ['-r', '-i', 'framer-motion', 'src/'];
        }

        const result = execSync(`${command} ${args.join(' ')}`, {
            encoding: 'utf8',
            cwd: process.cwd(),
            timeout: 10000
        });

        if (result.trim()) {
            console.log('❌ FRAMER-MOTION IMPORTS STILL FOUND:');
            console.log(result);
            return { hasFramerMotion: true, files: result };
        } else {
            console.log('✅ NO FRAMER-MOTION IMPORTS FOUND');
            return { hasFramerMotion: false, files: '' };
        }
    } catch (error) {
        // No matches found (command returns non-zero when no matches)
        if (error.status === 1) {
            console.log('✅ NO FRAMER-MOTION IMPORTS FOUND');
            return { hasFramerMotion: false, files: '' };
        } else {
            console.log('⚠️ Error checking framer-motion imports:', error.message);
            return { hasFramerMotion: false, files: '', error: error.message };
        }
    }
}

// Function to check for duplicate React imports
function checkDuplicateReactImports() {
    console.log('⚛️ Checking for duplicate React imports...');

    try {
        let command, args;
        if (process.platform === 'win32') {
            command = 'findstr';
            args = ['/s', '/n', '"import React"', 'src\\*.tsx', 'src\\*.ts'];
        } else {
            command = 'grep';
            args = ['-rn', '"import React"', 'src/'];
        }

        const result = execSync(`${command} ${args.join(' ')}`, {
            encoding: 'utf8',
            cwd: process.cwd(),
            timeout: 10000
        });

        const lines = result.split('\n').filter(line => line.trim());
        const fileImports = {};

        lines.forEach(line => {
            const match = line.match(/^([^:]+):/);
            if (match) {
                const file = match[1];
                if (!fileImports[file]) fileImports[file] = [];
                fileImports[file].push(line);
            }
        });

        const duplicates = Object.entries(fileImports).filter(([file, imports]) => imports.length > 1);

        if (duplicates.length > 0) {
            console.log('❌ DUPLICATE REACT IMPORTS FOUND:');
            duplicates.forEach(([file, imports]) => {
                console.log(`File: ${file}`);
                imports.forEach(imp => console.log(`  ${imp}`));
            });
            return { hasDuplicates: true, files: duplicates };
        } else {
            console.log('✅ NO DUPLICATE REACT IMPORTS FOUND');
            return { hasDuplicates: false, files: [] };
        }
    } catch (error) {
        if (error.status === 1) {
            console.log('✅ NO REACT IMPORT ISSUES FOUND');
            return { hasDuplicates: false, files: [] };
        } else {
            console.log('⚠️ Error checking React imports:', error.message);
            return { hasDuplicates: false, files: [], error: error.message };
        }
    }
}

// Function to check current dev server status
function checkDevServerStatus() {
    console.log('🌐 Checking dev server status...');

    try {
        // Check if dev server is running by trying to connect
        const result = execSync('netstat -an | findstr :5174', {
            encoding: 'utf8',
            timeout: 5000
        });

        if (result.trim()) {
            console.log('✅ DEV SERVER IS RUNNING on port 5174');
            return { isRunning: true, port: 5174 };
        } else {
            console.log('❌ DEV SERVER NOT FOUND on port 5174');
            return { isRunning: false, port: null };
        }
    } catch (error) {
        console.log('❌ DEV SERVER NOT RUNNING');
        return { isRunning: false, port: null, error: error.message };
    }
}

// Main error checking function
async function runErrorCheck() {
    console.log('='.repeat(60));
    console.log('🚨 COMPREHENSIVE ERROR CHECK STARTING');
    console.log('='.repeat(60));

    const timestamp = new Date().toISOString();
    console.log(`⏰ Check started at: ${timestamp}\n`);

    // 1. Check dev server status
    const serverCheck = checkDevServerStatus();
    console.log('');

    // 2. Check framer-motion imports
    const framerCheck = checkFramerMotionImports();
    console.log('');

    // 3. Check duplicate React imports
    const reactCheck = checkDuplicateReactImports();
    console.log('');

    // 4. Run build check (quick check)
    console.log('📦 Running quick build validation...');
    const buildCheck = await checkBuildErrors();
    console.log('');

    // Summary
    console.log('='.repeat(60));
    console.log('📊 ERROR CHECK SUMMARY');
    console.log('='.repeat(60));

    const criticalIssues = framerCheck.hasFramerMotion || reactCheck.hasDuplicates;
    const buildIssues = !buildCheck.success;

    if (!criticalIssues && !buildIssues && serverCheck.isRunning) {
        console.log('🎉 ALL CRITICAL CHECKS PASSED! Site should be working properly.');
        console.log('✅ Dev server running, no framer-motion imports, no duplicate React imports');
    } else {
        console.log('💥 ISSUES FOUND:');
        if (!serverCheck.isRunning) console.log('   - Dev server not running properly');
        if (framerCheck.hasFramerMotion) console.log('   - Framer Motion imports still present');
        if (reactCheck.hasDuplicates) console.log('   - Duplicate React imports found');
        if (buildIssues) console.log('   - Build validation failed');
    }

    console.log('='.repeat(60));

    // Write results to file
    const reportFile = path.join(process.cwd(), 'error-check-report.txt');
    const report = `
PERFUME SITE ERROR CHECK REPORT
Generated: ${timestamp}

DEV SERVER STATUS: ${serverCheck.isRunning ? 'RUNNING ✅' : 'NOT RUNNING ❌'}
Port: ${serverCheck.port || 'N/A'}

FRAMER-MOTION CHECK: ${framerCheck.hasFramerMotion ? 'FAILED ❌' : 'PASSED ✅'}
${framerCheck.files}

DUPLICATE REACT IMPORTS: ${reactCheck.hasDuplicates ? 'FAILED ❌' : 'PASSED ✅'}
${reactCheck.hasDuplicates ? JSON.stringify(reactCheck.files, null, 2) : ''}

BUILD VALIDATION: ${buildCheck.success ? 'PASSED ✅' : 'FAILED ❌'}
Exit Code: ${buildCheck.code}
Errors: ${buildCheck.errors}

OVERALL STATUS: ${(!criticalIssues && serverCheck.isRunning) ? 'SITE SHOULD BE WORKING ✅' : 'ISSUES NEED FIXING ❌'}
`;

    fs.writeFileSync(reportFile, report);
    console.log(`📄 Full report saved to: ${reportFile}`);

    return !criticalIssues && serverCheck.isRunning;
}

// Run the check
runErrorCheck().then(success => {
    if (success) {
        console.log('\n🚀 READY FOR USER TESTING - Site should be accessible and working!');
    } else {
        console.log('\n🔧 FIXES NEEDED - Issues must be resolved before site will work properly.');
    }
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('❌ Error check script failed:', error);
    process.exit(1);
});