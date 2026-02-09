/**
 * Code Quality Audit Script
 * Runs ESLint and generates quality report
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const AUDIT_DIR = path.join(__dirname, '..', 'audit-results');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

function ensureAuditDir() {
    if (!fs.existsSync(AUDIT_DIR)) {
        fs.mkdirSync(AUDIT_DIR, { recursive: true });
    }
}

function runESLint() {
    console.log('🔍 Running ESLint code quality check...');
    try {
        const output = execSync('npm run lint', { 
            encoding: 'utf-8',
            stdio: 'pipe'
        });
        return { success: true, output, errors: [] };
    } catch (error) {
        const output = error.stdout || error.stderr || '';
        // Parse ESLint output
        const errors = output.split('\n').filter(line => 
            line.includes('error') || line.includes('warning')
        );
        return { success: false, output, errors };
    }
}

function checkCodeMetrics() {
    console.log('📊 Analyzing code metrics...');
    const scriptPath = path.join(__dirname, '..', 'script.js');
    const code = fs.readFileSync(scriptPath, 'utf-8');
    const lines = code.split('\n');
    
    const metrics = {
        totalLines: lines.length,
        codeLines: lines.filter(l => l.trim() && !l.trim().startsWith('//')).length,
        commentLines: lines.filter(l => l.trim().startsWith('//')).length,
        functions: (code.match(/function\s+\w+/g) || []).length,
        variables: (code.match(/let\s+\w+|const\s+\w+|var\s+\w+/g) || []).length,
        maxFunctionLength: 0,
        complexity: 0
    };
    
    // Calculate function lengths
    const functionMatches = code.matchAll(/function\s+\w+[^}]*\{[^}]*\}/gs);
    for (const match of functionMatches) {
        const funcLines = match[0].split('\n').length;
        metrics.maxFunctionLength = Math.max(metrics.maxFunctionLength, funcLines);
    }
    
    return metrics;
}

function generateQualityReport(eslintResult, metrics) {
    const report = {
        timestamp: new Date().toISOString(),
        version: require('../package.json').version,
        quality: {
            eslint: {
                passed: eslintResult.success,
                errors: eslintResult.errors.length,
                details: eslintResult.output
            },
            metrics: {
                totalLines: metrics.totalLines,
                codeLines: metrics.codeLines,
                commentLines: metrics.commentLines,
                functions: metrics.functions,
                variables: metrics.variables,
                maxFunctionLength: metrics.maxFunctionLength,
                codeToCommentRatio: (metrics.commentLines / metrics.codeLines * 100).toFixed(2) + '%'
            },
            standards: {
                maxFunctionLength: metrics.maxFunctionLength <= 50 ? 'PASS' : 'FAIL',
                codeQuality: eslintResult.success ? 'PASS' : 'FAIL'
            }
        },
        summary: {
            overallStatus: eslintResult.success && metrics.maxFunctionLength <= 50 ? 'PASS' : 'FAIL',
            checksPassed: (eslintResult.success ? 1 : 0) + (metrics.maxFunctionLength <= 50 ? 1 : 0),
            totalChecks: 2
        }
    };
    
    return report;
}

function saveReport(report) {
    const filename = `quality-audit-${TIMESTAMP}.json`;
    const filepath = path.join(AUDIT_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`✅ Quality audit report saved: ${filepath}`);
    return filepath;
}

function main() {
    console.log('🚀 Starting Code Quality Audit...\n');
    ensureAuditDir();
    
    const eslintResult = runESLint();
    const metrics = checkCodeMetrics();
    const report = generateQualityReport(eslintResult, metrics);
    const reportPath = saveReport(report);
    
    console.log('\n📋 Quality Audit Summary:');
    console.log(`   Overall Status: ${report.summary.overallStatus}`);
    console.log(`   Checks Passed: ${report.summary.checksPassed}/${report.summary.totalChecks}`);
    console.log(`   ESLint Errors: ${report.quality.eslint.errors}`);
    console.log(`   Max Function Length: ${metrics.maxFunctionLength} lines`);
    console.log(`\n📄 Full report: ${reportPath}\n`);
    
    process.exit(report.summary.overallStatus === 'PASS' ? 0 : 1);
}

if (require.main === module) {
    main();
}

module.exports = { runESLint, checkCodeMetrics, generateQualityReport };
