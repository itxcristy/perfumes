#!/usr/bin/env node

/**
 * Production Readiness Checker
 * Validates that the codebase is production-ready
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '../src');

interface ValidationResult {
    passed: boolean;
    message: string;
    file?: string;
}

// Check for console.log statements in production code
async function checkConsoleStatements(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    async function scanDirectory(dir: string): Promise<void> {
        const items = await fs.readdir(dir);

        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = await fs.stat(fullPath);

            if (stat.isDirectory()) {
                await scanDirectory(fullPath);
            } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
                const content = await fs.readFile(fullPath, 'utf-8');
                const lines = content.split('\n');

                lines.forEach((line, index) => {
                    if (line.includes('console.log') && !line.includes('console.error') && !line.includes('console.warn')) {
                        results.push({
                            passed: false,
                            message: `Console.log found at line ${index + 1}`,
                            file: path.relative(srcDir, fullPath)
                        });
                    }
                });
            }
        }
    }

    await scanDirectory(srcDir);

    if (results.length === 0) {
        results.push({
            passed: true,
            message: 'No console.log statements found in production code'
        });
    }

    return results;
}

// Check for TODO/FIXME comments
async function checkTodoComments(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    async function scanDirectory(dir: string): Promise<void> {
        const items = await fs.readdir(dir);

        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = await fs.stat(fullPath);

            if (stat.isDirectory()) {
                await scanDirectory(fullPath);
            } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
                const content = await fs.readFile(fullPath, 'utf-8');
                const lines = content.split('\n');

                lines.forEach((line, index) => {
                    if (line.includes('TODO') || line.includes('FIXME')) {
                        results.push({
                            passed: false,
                            message: `TODO/FIXME comment found at line ${index + 1}: ${line.trim()}`,
                            file: path.relative(srcDir, fullPath)
                        });
                    }
                });
            }
        }
    }

    await scanDirectory(srcDir);

    if (results.length === 0) {
        results.push({
            passed: true,
            message: 'No TODO/FIXME comments found'
        });
    }

    return results;
}

// Check for proper path aliases usage
async function checkPathAliases(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    async function scanDirectory(dir: string): Promise<void> {
        const items = await fs.readdir(dir);

        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = await fs.stat(fullPath);

            if (stat.isDirectory()) {
                await scanDirectory(fullPath);
            } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
                const content = await fs.readFile(fullPath, 'utf-8');
                const lines = content.split('\n');

                lines.forEach((line, index) => {
                    // Check for relative imports that could use aliases
                    if (line.includes('import') && line.includes('../../../')) {
                        results.push({
                            passed: false,
                            message: `Deep relative import found at line ${index + 1}: ${line.trim()}`,
                            file: path.relative(srcDir, fullPath)
                        });
                    }
                });
            }
        }
    }

    await scanDirectory(srcDir);

    if (results.length === 0) {
        results.push({
            passed: true,
            message: 'No deep relative imports found'
        });
    }

    return results;
}

// Main validation function
async function runValidation(): Promise<void> {
    console.log('🔍 Running Production Readiness Validation...\n');

    const checks = [
        { name: 'Console Statements', fn: checkConsoleStatements },
        { name: 'TODO Comments', fn: checkTodoComments },
        { name: 'Path Aliases', fn: checkPathAliases }
    ];

    let totalPassed = 0;
    let totalFailed = 0;

    for (const check of checks) {
        console.log(`Running ${check.name} check...`);
        const results = await check.fn();

        const passed = results.filter(r => r.passed).length;
        const failed = results.filter(r => !r.passed).length;

        totalPassed += passed;
        totalFailed += failed;

        if (failed === 0) {
            console.log(`✅ ${check.name}: PASSED`);
        } else {
            console.log(`❌ ${check.name}: FAILED (${failed} issues)`);
            results.filter(r => !r.passed).forEach(result => {
                console.log(`  - ${result.file ? result.file + ': ' : ''}${result.message}`);
            });
        }
        console.log('');
    }

    console.log('📊 Summary:');
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalFailed}`);
    console.log(`🎯 Success Rate: ${totalFailed === 0 ? '100%' : Math.round((totalPassed / (totalPassed + totalFailed)) * 100)}%`);

    if (totalFailed === 0) {
        console.log('\n🎉 All checks passed! Code is production-ready.');
        process.exit(0);
    } else {
        console.log('\n⚠️  Some checks failed. Please fix the issues before deploying to production.');
        process.exit(1);
    }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runValidation().catch(console.error);
}