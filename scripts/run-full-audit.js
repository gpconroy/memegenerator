/**
 * Full Audit Runner
 * Runs all audit checks and generates comprehensive report
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

function getGitInfo() {
    try {
        const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
        const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
        const commitDate = execSync('git log -1 --format=%ci', { encoding: 'utf-8' }).trim();
        return { commitHash, branch, commitDate };
    } catch (error) {
        return { commitHash: 'unknown', branch: 'unknown', commitDate: new Date().toISOString() };
    }
}

async function runAudit(auditName, scriptPath) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Running ${auditName}...`);
    console.log('='.repeat(60));
    
    try {
        execSync(`node ${scriptPath}`, { stdio: 'inherit' });
        return { name: auditName, status: 'PASS', error: null };
    } catch (error) {
        return { name: auditName, status: 'FAIL', error: error.message };
    }
}

async function runAllAudits() {
    console.log('\n🚀 Starting Full Audit Suite...');
    console.log(`Timestamp: ${new Date().toISOString()}\n`);
    
    ensureAuditDir();
    const gitInfo = getGitInfo();
    
    const audits = [
        { name: 'Code Quality', script: path.join(__dirname, 'audit-quality.js') },
        { name: 'Security', script: path.join(__dirname, 'audit-security.js') },
        { name: 'Performance', script: path.join(__dirname, 'audit-performance.js') },
        { name: 'Test Coverage', script: 'npm run audit:coverage' }
    ];
    
    const results = [];
    
    for (const audit of audits) {
        if (audit.script.startsWith('npm')) {
            // Run npm script
            try {
                execSync(audit.script.replace('npm run ', 'npm run '), { stdio: 'inherit' });
                results.push({ name: audit.name, status: 'PASS', error: null });
            } catch (error) {
                results.push({ name: audit.name, status: 'FAIL', error: error.message });
            }
        } else {
            const result = await runAudit(audit.name, audit.script);
            results.push(result);
        }
    }
    
    // Collect all report files
    const reportFiles = fs.readdirSync(AUDIT_DIR)
        .filter(f => f.includes(TIMESTAMP.split('T')[0]))
        .map(f => path.join(AUDIT_DIR, f));
    
    const summary = {
        timestamp: new Date().toISOString(),
        version: require('../package.json').version,
        git: gitInfo,
        audits: results,
        reports: reportFiles,
        summary: {
            totalAudits: results.length,
            passedAudits: results.filter(r => r.status === 'PASS').length,
            failedAudits: results.filter(r => r.status === 'FAIL').length,
            overallStatus: results.every(r => r.status === 'PASS') ? 'PASS' : 'FAIL'
        }
    };
    
    const summaryPath = path.join(AUDIT_DIR, `full-audit-summary-${TIMESTAMP}.json`);
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log('\n' + '='.repeat(60));
    console.log('FULL AUDIT SUMMARY');
    console.log('='.repeat(60));
    console.log(`Version: ${summary.version}`);
    console.log(`Git Commit: ${gitInfo.commitHash.substring(0, 7)}`);
    console.log(`Branch: ${gitInfo.branch}`);
    console.log(`Overall Status: ${summary.summary.overallStatus}`);
    console.log(`\nAudit Results:`);
    results.forEach(result => {
        const icon = result.status === 'PASS' ? '✅' : '❌';
        console.log(`  ${icon} ${result.name}: ${result.status}`);
        if (result.error) {
            console.log(`     Error: ${result.error}`);
        }
    });
    console.log(`\n📄 Summary saved: ${summaryPath}`);
    console.log(`📁 All reports in: ${AUDIT_DIR}\n`);
    
    return summary;
}

if (require.main === module) {
    runAllAudits().then(summary => {
        process.exit(summary.summary.overallStatus === 'PASS' ? 0 : 1);
    }).catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { runAllAudits };
