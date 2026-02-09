/**
 * Security Audit Script
 * Runs security scans and vulnerability checks
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

function runNpmAudit() {
    console.log('🔒 Running npm audit...');
    try {
        const output = execSync('npm audit --json', { 
            encoding: 'utf-8',
            stdio: 'pipe'
        });
        const auditData = JSON.parse(output);
        return {
            success: auditData.metadata.vulnerabilities.total === 0,
            vulnerabilities: auditData.metadata.vulnerabilities,
            advisories: auditData.advisories || {}
        };
    } catch (error) {
        try {
            const output = error.stdout || '';
            const auditData = JSON.parse(output);
            return {
                success: auditData.metadata.vulnerabilities.total === 0,
                vulnerabilities: auditData.metadata.vulnerabilities,
                advisories: auditData.advisories || {}
            };
        } catch {
            return {
                success: false,
                vulnerabilities: { total: 0 },
                advisories: {},
                error: 'Failed to parse audit output'
            };
        }
    }
}

function scanCodeForSecurityIssues() {
    console.log('🔍 Scanning code for security vulnerabilities...');
    const scriptPath = path.join(__dirname, '..', 'script.js');
    const htmlPath = path.join(__dirname, '..', 'index.html');
    
    const scriptCode = fs.readFileSync(scriptPath, 'utf-8');
    const htmlCode = fs.readFileSync(htmlPath, 'utf-8');
    
    const issues = [];
    
    // Check for dangerous patterns
    const dangerousPatterns = [
        { pattern: /eval\s*\(/, name: 'eval() usage', severity: 'HIGH' },
        { pattern: /innerHTML\s*=/, name: 'innerHTML assignment', severity: 'MEDIUM' },
        { pattern: /document\.write/, name: 'document.write()', severity: 'MEDIUM' },
        { pattern: /dangerouslySetInnerHTML/, name: 'dangerouslySetInnerHTML', severity: 'HIGH' },
        { pattern: /localStorage\.setItem.*password/i, name: 'Password in localStorage', severity: 'HIGH' },
        { pattern: /localStorage\.setItem.*token/i, name: 'Token in localStorage', severity: 'MEDIUM' },
        { pattern: /\.src\s*=.*javascript:/i, name: 'JavaScript: protocol', severity: 'HIGH' }
    ];
    
    dangerousPatterns.forEach(({ pattern, name, severity }) => {
        if (pattern.test(scriptCode) || pattern.test(htmlCode)) {
            issues.push({ type: name, severity, file: 'script.js or index.html' });
        }
    });
    
    // Check for input validation
    const hasInputValidation = /\.value\s*&&|if\s*\(.*\.value/.test(scriptCode);
    if (!hasInputValidation) {
        issues.push({ 
            type: 'Missing input validation', 
            severity: 'MEDIUM', 
            file: 'script.js' 
        });
    }
    
    // Check for XSS protection
    const hasXSSProtection = /textContent|createTextNode/.test(scriptCode);
    const usesInnerHTML = /innerHTML/.test(scriptCode);
    if (usesInnerHTML && !hasXSSProtection) {
        issues.push({ 
            type: 'Potential XSS vulnerability', 
            severity: 'HIGH', 
            file: 'script.js' 
        });
    }
    
    // Check file upload security
    const hasFileTypeCheck = /accept\s*=\s*["']image/i.test(htmlCode);
    if (!hasFileTypeCheck) {
        issues.push({ 
            type: 'Missing file type validation', 
            severity: 'MEDIUM', 
            file: 'index.html' 
        });
    }
    
    return issues;
}

function checkCSPHeaders() {
    console.log('🛡️ Checking Content Security Policy...');
    // This would check if CSP headers are set (would need server config)
    // For client-side only, we'll check if CSP meta tag exists
    const htmlPath = path.join(__dirname, '..', 'index.html');
    const htmlCode = fs.readFileSync(htmlPath, 'utf-8');
    
    const hasCSP = /Content-Security-Policy/i.test(htmlCode);
    return {
        hasCSPMetaTag: hasCSP,
        recommendation: hasCSP ? 'CSP configured' : 'Consider adding CSP meta tag'
    };
}

function generateSecurityReport(npmAudit, codeIssues, cspCheck) {
    const highSeverity = codeIssues.filter(i => i.severity === 'HIGH').length;
    const mediumSeverity = codeIssues.filter(i => i.severity === 'MEDIUM').length;
    const lowSeverity = codeIssues.filter(i => i.severity === 'LOW').length;
    
    const report = {
        timestamp: new Date().toISOString(),
        version: require('../package.json').version,
        security: {
            dependencies: {
                status: npmAudit.success ? 'PASS' : 'FAIL',
                vulnerabilities: npmAudit.vulnerabilities,
                advisories: Object.keys(npmAudit.advisories).length
            },
            codeAnalysis: {
                status: codeIssues.length === 0 ? 'PASS' : 'FAIL',
                totalIssues: codeIssues.length,
                highSeverity,
                mediumSeverity,
                lowSeverity,
                issues: codeIssues
            },
            csp: {
                configured: cspCheck.hasCSPMetaTag,
                recommendation: cspCheck.recommendation
            }
        },
        summary: {
            overallStatus: (npmAudit.success && codeIssues.length === 0) ? 'PASS' : 'FAIL',
            checksPassed: (npmAudit.success ? 1 : 0) + (codeIssues.length === 0 ? 1 : 0) + (cspCheck.hasCSPMetaTag ? 1 : 0),
            totalChecks: 3,
            criticalIssues: highSeverity + (npmAudit.vulnerabilities.critical || 0)
        }
    };
    
    return report;
}

function saveReport(report) {
    const filename = `security-audit-${TIMESTAMP}.json`;
    const filepath = path.join(AUDIT_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`✅ Security audit report saved: ${filepath}`);
    return filepath;
}

function main() {
    console.log('🚀 Starting Security Audit...\n');
    ensureAuditDir();
    
    const npmAudit = runNpmAudit();
    const codeIssues = scanCodeForSecurityIssues();
    const cspCheck = checkCSPHeaders();
    const report = generateSecurityReport(npmAudit, codeIssues, cspCheck);
    const reportPath = saveReport(report);
    
    console.log('\n📋 Security Audit Summary:');
    console.log(`   Overall Status: ${report.summary.overallStatus}`);
    console.log(`   Dependency Vulnerabilities: ${npmAudit.vulnerabilities.total}`);
    console.log(`   Code Security Issues: ${codeIssues.length}`);
    console.log(`   Critical Issues: ${report.summary.criticalIssues}`);
    console.log(`\n📄 Full report: ${reportPath}\n`);
    
    if (codeIssues.length > 0) {
        console.log('⚠️  Security Issues Found:');
        codeIssues.forEach(issue => {
            console.log(`   [${issue.severity}] ${issue.type} in ${issue.file}`);
        });
    }
    
    process.exit(report.summary.overallStatus === 'PASS' ? 0 : 1);
}

if (require.main === module) {
    main();
}

module.exports = { runNpmAudit, scanCodeForSecurityIssues, generateSecurityReport };
