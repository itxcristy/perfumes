#!/usr/bin/env node

const { spawn } = require('child_process');
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
        errors: buildErrors
      });
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      buildProcess.kill();
      console.log('⏰ Build check timed out');
      resolve({ success: false, output: '', errors: 'Timeout' });
    }, 30000);
  });
}

// Function to check TypeScript errors
function checkTypeScriptErrors() {
  return new Promise((resolve) => {
    console.log('🔧 Running TypeScript check...');
    const tscProcess = spawn('npx', ['tsc', '--noEmit'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });

    let tscOutput = '';
    let tscErrors = '';

    tscProcess.stdout.on('data', (data) => {
      tscOutput += data.toString();
    });

    tscProcess.stderr.on('data', (data) => {
      tscErrors += data.toString();
    });

    tscProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ TYPESCRIPT SUCCESS - No type errors found');
      } else {
        console.log('❌ TYPESCRIPT ERRORS FOUND:');
        console.log(tscOutput);
        console.log(tscErrors);
      }
      
      resolve({
        success: code === 0,
        output: tscOutput,
        errors: tscErrors
      });
    });

    // Timeout after 20 seconds
    setTimeout(() => {
      tscProcess.kill();
      console.log('⏰ TypeScript check timed out');
      resolve({ success: false, output: '', errors: 'Timeout' });
    }, 20000);
  });
}

// Function to scan for framer-motion imports
function checkFramerMotionImports() {
  console.log('🎬 Scanning for remaining framer-motion imports...');
  
  const { execSync } = require('child_process');
  try {
    const result = execSync('findstr /s /i "framer-motion" src\\*.tsx src\\*.ts', { 
      encoding: 'utf8',
      cwd: process.cwd()
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
    // No matches found (grep returns non-zero when no matches)
    console.log('✅ NO FRAMER-MOTION IMPORTS FOUND');
    return { hasFramerMotion: false, files: '' };
  }
}

// Function to check for duplicate React imports
function checkDuplicateReactImports() {
  console.log('⚛️ Checking for duplicate React imports...');
  
  const { execSync } = require('child_process');
  try {
    // Look for files with duplicate React imports
    const result = execSync('findstr /s /n "import React" src\\*.tsx src\\*.ts', { 
      encoding: 'utf8',
      cwd: process.cwd()
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
    console.log('✅ NO REACT IMPORT ISSUES FOUND');
    return { hasDuplicates: false, files: [] };
  }
}

// Main error checking function
async function runErrorCheck() {
  console.log('='.repeat(60));
  console.log('🚨 COMPREHENSIVE ERROR CHECK STARTING');
  console.log('='.repeat(60));
  
  const timestamp = new Date().toISOString();
  console.log(`⏰ Check started at: ${timestamp}\n`);
  
  // 1. Check framer-motion imports
  const framerCheck = checkFramerMotionImports();
  console.log('');
  
  // 2. Check duplicate React imports
  const reactCheck = checkDuplicateReactImports();
  console.log('');
  
  // 3. Run TypeScript check
  const tscCheck = await checkTypeScriptErrors();
  console.log('');
  
  // 4. Run build check
  const buildCheck = await checkBuildErrors();
  console.log('');
  
  // Summary
  console.log('='.repeat(60));
  console.log('📊 ERROR CHECK SUMMARY');
  console.log('='.repeat(60));
  
  const allGood = !framerCheck.hasFramerMotion && 
                  !reactCheck.hasDuplicates && 
                  tscCheck.success && 
                  buildCheck.success;
  
  if (allGood) {
    console.log('🎉 ALL CHECKS PASSED! Site should be working properly.');
  } else {
    console.log('💥 ISSUES FOUND:');
    if (framerCheck.hasFramerMotion) console.log('   - Framer Motion imports still present');
    if (reactCheck.hasDuplicates) console.log('   - Duplicate React imports found');
    if (!tscCheck.success) console.log('   - TypeScript errors found');
    if (!buildCheck.success) console.log('   - Build errors found');
  }
  
  console.log('='.repeat(60));
  
  // Write results to file
  const reportFile = path.join(process.cwd(), 'error-check-report.txt');
  const report = `
PERFUME SITE ERROR CHECK REPORT
Generated: ${timestamp}

FRAMER-MOTION CHECK: ${framerCheck.hasFramerMotion ? 'FAILED' : 'PASSED'}
${framerCheck.files}

DUPLICATE REACT IMPORTS: ${reactCheck.hasDuplicates ? 'FAILED' : 'PASSED'}
${reactCheck.hasDuplicates ? JSON.stringify(reactCheck.files, null, 2) : ''}

TYPESCRIPT CHECK: ${tscCheck.success ? 'PASSED' : 'FAILED'}
${tscCheck.output}
${tscCheck.errors}

BUILD CHECK: ${buildCheck.success ? 'PASSED' : 'FAILED'}
${buildCheck.output}
${buildCheck.errors}

OVERALL STATUS: ${allGood ? 'ALL GOOD ✅' : 'ISSUES FOUND ❌'}
`;
  
  fs.writeFileSync(reportFile, report);
  console.log(`📄 Full report saved to: ${reportFile}`);
  
  return allGood;
}

// Run the check
runErrorCheck().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Error check script failed:', error);
  process.exit(1);
});