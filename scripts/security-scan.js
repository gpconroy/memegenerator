/**
 * Standalone Security Scan Script
 * Comprehensive security vulnerability scanning
 */

const { runNpmAudit, scanCodeForSecurityIssues, generateSecurityReport } = require('./audit-security');
const fs = require('fs');
const path = require('path');

const AUDIT_DIR = path.join(__dirname, '..', 'audit-results');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

function ensureAuditDir() {
    if (!fs.existsSync(AUDIT_DIR)) {
        fs.mkdirSync(AUDIT_DIR, { recursive: true });
    }
}

async function main() {
    console.log('🔒 Running Security Scan...\n');
    ensureAuditDir();
    
    const npmAudit = runNpmAudit();
    const codeIssues = scanCodeForSecurityIssues();
    
    // Check CSP
    const htmlPath = path.join(__dirname, '..', 'index.html');
    const htmlCode = fs.readFileSync(htmlPath, 'utf-8');
    const hasCSP = /Content-Security-Policy/i.test(htmlCode);
    
    console.log('\n📋 Security Scan Results:');
    console.log(`   Dependency Vulnerabilities: ${npmAudit.vulnerabilities.total}`);
    console.log(`   Code Security Issues: ${codeIssues.length}`);
    
    if (codeIssues.length > 0) {
        console.log('\n⚠️  Security Issues Found:');
        codeIssues.forEach(issue => {
            console.log(`   [${issue.severity}] ${issue.type} in ${issue.file}`);
        });
    }
    
    console.log(`   CSP Configured: ${hasCSP ? 'Yes' : 'No'}`);
    
    const report = generateSecurityReport(npmAudit, codeIssues, { hasCSPMetaTag: hasCSP });
    
    const reportPath = path.join(AUDIT_DIR, `security-scan-${TIMESTAMP}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n✅ Security scan complete. Report saved: ${reportPath}`);
    console.log(`   Overall Status: ${report.summary.overallStatus}\n`);
    
    process.exit(report.summary.overallStatus === 'PASS' ? 0 : 1);
}

if (require.main === module) {
    main().catch(console.error);
}
