/**
 * Opus 4.6 Fast Audit Review Script
 * 
 * This script is designed to be used with Opus 4.6 Fast model
 * to provide independent review of audit results.
 * 
 * Usage Instructions:
 * 1. Run audits first: npm run audit:all
 * 2. Use this script with Opus 4.6 Fast to review results
 * 3. The script loads audit results and prepares them for review
 */

const fs = require('fs');
const path = require('path');

const AUDIT_DIR = path.join(__dirname, '..', 'audit-results');

function loadAllAuditResults() {
    if (!fs.existsSync(AUDIT_DIR)) {
        console.error('No audit results found. Run audits first: npm run audit:all');
        process.exit(1);
    }
    
    const files = fs.readdirSync(AUDIT_DIR)
        .filter(f => f.endsWith('.json'))
        .map(f => ({
            name: f,
            path: path.join(AUDIT_DIR, f),
            content: JSON.parse(fs.readFileSync(path.join(AUDIT_DIR, f), 'utf-8'))
        }));
    
    return files;
}

function generateReviewPrompt(auditResults) {
    const latestQuality = auditResults.find(r => r.name.includes('quality'));
    const latestSecurity = auditResults.find(r => r.name.includes('security'));
    const latestPerformance = auditResults.find(r => r.name.includes('performance'));
    const summary = auditResults.find(r => r.name.includes('summary'));
    
    return `
# Independent Audit Review Request

Please review the following audit results and provide an independent assessment.

## Audit Results Summary

${summary ? `Overall Status: ${summary.content.summary.overallStatus}` : 'No summary found'}

## Code Quality Audit
${latestQuality ? `
- Status: ${latestQuality.content.summary?.overallStatus || 'UNKNOWN'}
- ESLint Errors: ${latestQuality.content.quality?.eslint?.errors || 0}
- Max Function Length: ${latestQuality.content.quality?.metrics?.maxFunctionLength || 'N/A'} lines
` : 'No quality audit found'}

## Security Audit
${latestSecurity ? `
- Status: ${latestSecurity.content.summary?.overallStatus || 'UNKNOWN'}
- Dependency Vulnerabilities: ${latestSecurity.content.security?.dependencies?.vulnerabilities?.total || 0}
- Code Security Issues: ${latestSecurity.content.security?.codeAnalysis?.totalIssues || 0}
- Critical Issues: ${latestSecurity.content.summary?.criticalIssues || 0}
` : 'No security audit found'}

## Performance Audit
${latestPerformance ? `
- Status: ${latestPerformance.content.summary?.overallStatus || 'UNKNOWN'}
- Page Load Time: ${latestPerformance.content.performance?.metrics?.pageLoadTime || 'N/A'}ms
- Checks Passed: ${latestPerformance.content.summary?.checksPassed || 0}/${latestPerformance.content.summary?.totalChecks || 0}
` : 'No performance audit found'}

## Review Request

Please provide:
1. Independent assessment of each audit category
2. Identification of any issues not caught by automated tools
3. Recommendations for improvement
4. Overall risk assessment
5. Approval status for production deployment

## Full Audit Data

The complete audit results are available in the audit-results/ directory for detailed review.
`;
}

function main() {
    console.log('📋 Preparing Audit Results for Opus 4.6 Fast Review...\n');
    
    const auditResults = loadAllAuditResults();
    
    if (auditResults.length === 0) {
        console.error('❌ No audit results found.');
        console.error('   Please run audits first: npm run audit:all');
        process.exit(1);
    }
    
    console.log(`✅ Loaded ${auditResults.length} audit result files\n`);
    
    const reviewPrompt = generateReviewPrompt(auditResults);
    
    const promptPath = path.join(AUDIT_DIR, 'opus-review-prompt.md');
    fs.writeFileSync(promptPath, reviewPrompt);
    
    console.log('📄 Review prompt generated:');
    console.log(`   ${promptPath}\n`);
    console.log('📋 Review Prompt:');
    console.log('─'.repeat(60));
    console.log(reviewPrompt);
    console.log('─'.repeat(60));
    console.log('\n💡 Instructions:');
    console.log('   1. Copy the review prompt above');
    console.log('   2. Use Opus 4.6 Fast to review the audit results');
    console.log('   3. Provide independent assessment');
    console.log('   4. Save the review results in audit-results/opus-review-*.md\n');
}

if (require.main === module) {
    main();
}

module.exports = { loadAllAuditResults, generateReviewPrompt };
