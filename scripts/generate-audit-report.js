/**
 * Audit Report Generator
 * Creates non-technical audit reports for stakeholders
 */

const fs = require('fs');
const path = require('path');

const AUDIT_DIR = path.join(__dirname, '..', 'audit-results');

function loadLatestReports() {
    const files = fs.readdirSync(AUDIT_DIR)
        .filter(f => f.endsWith('.json') && !f.includes('summary') && !f.includes('report'))
        .map(f => ({
            name: f,
            path: path.join(AUDIT_DIR, f),
            time: fs.statSync(path.join(AUDIT_DIR, f)).mtime
        }))
        .sort((a, b) => b.time - a.time);
    
    const reports = {};
    files.forEach(file => {
        if (file.name.includes('quality')) {
            reports.quality = JSON.parse(fs.readFileSync(file.path, 'utf-8'));
        } else if (file.name.includes('security')) {
            reports.security = JSON.parse(fs.readFileSync(file.path, 'utf-8'));
        } else if (file.name.includes('performance')) {
            reports.performance = JSON.parse(fs.readFileSync(file.path, 'utf-8'));
        }
    });
    
    return reports;
}

function generateExecutiveSummary(reports) {
    const quality = reports.quality?.summary?.overallStatus || 'UNKNOWN';
    const security = reports.security?.summary?.overallStatus || 'UNKNOWN';
    const performance = reports.performance?.summary?.overallStatus || 'UNKNOWN';
    
    const allPassed = quality === 'PASS' && security === 'PASS' && performance === 'PASS';
    
    return {
        overallStatus: allPassed ? 'PASS' : 'REVIEW REQUIRED',
        qualityStatus: quality,
        securityStatus: security,
        performanceStatus: performance,
        recommendation: allPassed 
            ? 'All audit checks passed. Code is ready for production.'
            : 'Some audit checks failed. Review detailed reports before deployment.'
    };
}

function generateNonTechnicalReport(reports) {
    const execSummary = generateExecutiveSummary(reports);
    
    const report = {
        reportDate: new Date().toISOString(),
        version: reports.quality?.version || reports.security?.version || 'unknown',
        executiveSummary: execSummary,
        detailedFindings: {
            codeQuality: {
                status: reports.quality?.summary?.overallStatus || 'NOT RUN',
                description: 'Code quality audit checks code style, organization, and maintainability.',
                findings: reports.quality ? {
                    passed: reports.quality.summary.checksPassed,
                    total: reports.quality.summary.totalChecks,
                    issues: reports.quality.quality.eslint.errors
                } : null,
                recommendation: reports.quality?.summary?.overallStatus === 'PASS' 
                    ? 'Code meets quality standards.'
                    : 'Code quality issues detected. Review ESLint output for details.'
            },
            security: {
                status: reports.security?.summary?.overallStatus || 'NOT RUN',
                description: 'Security audit checks for vulnerabilities and security best practices.',
                findings: reports.security ? {
                    dependencyVulnerabilities: reports.security.security.dependencies.vulnerabilities.total,
                    codeIssues: reports.security.security.codeAnalysis.totalIssues,
                    criticalIssues: reports.security.summary.criticalIssues
                } : null,
                recommendation: reports.security?.summary?.overallStatus === 'PASS'
                    ? 'No security vulnerabilities detected.'
                    : 'Security issues found. Review detailed security report.'
            },
            performance: {
                status: reports.performance?.summary?.overallStatus || 'NOT RUN',
                description: 'Performance audit measures application speed and efficiency.',
                findings: reports.performance ? {
                    pageLoadTime: reports.performance.performance.metrics.pageLoadTime,
                    checksPassed: reports.performance.summary.checksPassed,
                    totalChecks: reports.performance.summary.totalChecks,
                    averageScore: Math.round(reports.performance.summary.averageScore)
                } : null,
                recommendation: reports.performance?.summary?.overallStatus === 'PASS'
                    ? 'Application meets performance standards.'
                    : 'Performance issues detected. Review performance metrics.'
            }
        },
        compliance: {
            codeQualityStandards: execSummary.qualityStatus === 'PASS' ? 'COMPLIANT' : 'NON-COMPLIANT',
            securityStandards: execSummary.securityStatus === 'PASS' ? 'COMPLIANT' : 'NON-COMPLIANT',
            performanceStandards: execSummary.performanceStatus === 'PASS' ? 'COMPLIANT' : 'NON-COMPLIANT'
        },
        nextSteps: execSummary.overallStatus === 'PASS' 
            ? [
                'All audit checks passed successfully.',
                'Code is approved for production deployment.',
                'Continue monitoring in production environment.'
            ]
            : [
                'Review failed audit checks in detailed reports.',
                'Address identified issues before deployment.',
                'Re-run audits after fixes are applied.',
                'Obtain approval before proceeding to production.'
            ]
    };
    
    return report;
}

function generateHTMLReport(jsonReport) {
    const statusColor = {
        'PASS': '#28a745',
        'FAIL': '#dc3545',
        'NOT RUN': '#ffc107',
        'REVIEW REQUIRED': '#ff9800'
    };
    
    const statusIcon = {
        'PASS': '✅',
        'FAIL': '❌',
        'NOT RUN': '⚠️',
        'REVIEW REQUIRED': '🔍'
    };
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Audit Report - ${jsonReport.version}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 4px;
            color: white;
            font-weight: bold;
            margin: 10px 0;
        }
        .section {
            background: white;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section h2 {
            margin-top: 0;
            color: #333;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        .finding {
            margin: 15px 0;
            padding: 15px;
            background: #f9f9f9;
            border-left: 4px solid #007bff;
            border-radius: 4px;
        }
        .metric {
            display: inline-block;
            margin: 10px 20px 10px 0;
            padding: 10px 15px;
            background: #e9ecef;
            border-radius: 4px;
        }
        .metric-label {
            font-size: 12px;
            color: #666;
            display: block;
        }
        .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #f8f9fa;
            font-weight: bold;
        }
        .next-steps {
            list-style: none;
            padding: 0;
        }
        .next-steps li {
            padding: 10px;
            margin: 5px 0;
            background: #e7f3ff;
            border-left: 4px solid #007bff;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Software Quality Audit Report</h1>
        <p><strong>Version:</strong> ${jsonReport.version}</p>
        <p><strong>Report Date:</strong> ${new Date(jsonReport.reportDate).toLocaleString()}</p>
        <div class="status-badge" style="background: ${statusColor[jsonReport.executiveSummary.overallStatus]}">
            ${statusIcon[jsonReport.executiveSummary.overallStatus]} Overall Status: ${jsonReport.executiveSummary.overallStatus}
        </div>
        <p><strong>Recommendation:</strong> ${jsonReport.executiveSummary.recommendation}</p>
    </div>
    
    <div class="section">
        <h2>Executive Summary</h2>
        <p>This report provides a comprehensive audit of code quality, security, and performance for version ${jsonReport.version}.</p>
        <div class="metric">
            <span class="metric-label">Code Quality</span>
            <span class="metric-value" style="color: ${statusColor[jsonReport.executiveSummary.qualityStatus]}">
                ${statusIcon[jsonReport.executiveSummary.qualityStatus]} ${jsonReport.executiveSummary.qualityStatus}
            </span>
        </div>
        <div class="metric">
            <span class="metric-label">Security</span>
            <span class="metric-value" style="color: ${statusColor[jsonReport.executiveSummary.securityStatus]}">
                ${statusIcon[jsonReport.executiveSummary.securityStatus]} ${jsonReport.executiveSummary.securityStatus}
            </span>
        </div>
        <div class="metric">
            <span class="metric-label">Performance</span>
            <span class="metric-value" style="color: ${statusColor[jsonReport.executiveSummary.performanceStatus]}">
                ${statusIcon[jsonReport.executiveSummary.performanceStatus]} ${jsonReport.executiveSummary.performanceStatus}
            </span>
        </div>
    </div>
    
    <div class="section">
        <h2>Detailed Findings</h2>
        
        <div class="finding">
            <h3>Code Quality Audit</h3>
            <p><strong>Status:</strong> <span style="color: ${statusColor[jsonReport.detailedFindings.codeQuality.status]}">${jsonReport.detailedFindings.codeQuality.status}</span></p>
            <p>${jsonReport.detailedFindings.codeQuality.description}</p>
            ${jsonReport.detailedFindings.codeQuality.findings ? `
                <p><strong>Checks Passed:</strong> ${jsonReport.detailedFindings.codeQuality.findings.passed} / ${jsonReport.detailedFindings.codeQuality.findings.total}</p>
                <p><strong>Code Issues Found:</strong> ${jsonReport.detailedFindings.codeQuality.findings.issues}</p>
            ` : '<p>Audit not run.</p>'}
            <p><strong>Recommendation:</strong> ${jsonReport.detailedFindings.codeQuality.recommendation}</p>
        </div>
        
        <div class="finding">
            <h3>Security Audit</h3>
            <p><strong>Status:</strong> <span style="color: ${statusColor[jsonReport.detailedFindings.security.status]}">${jsonReport.detailedFindings.security.status}</span></p>
            <p>${jsonReport.detailedFindings.security.description}</p>
            ${jsonReport.detailedFindings.security.findings ? `
                <p><strong>Dependency Vulnerabilities:</strong> ${jsonReport.detailedFindings.security.findings.dependencyVulnerabilities}</p>
                <p><strong>Code Security Issues:</strong> ${jsonReport.detailedFindings.security.findings.codeIssues}</p>
                <p><strong>Critical Issues:</strong> ${jsonReport.detailedFindings.security.findings.criticalIssues}</p>
            ` : '<p>Audit not run.</p>'}
            <p><strong>Recommendation:</strong> ${jsonReport.detailedFindings.security.recommendation}</p>
        </div>
        
        <div class="finding">
            <h3>Performance Audit</h3>
            <p><strong>Status:</strong> <span style="color: ${statusColor[jsonReport.detailedFindings.performance.status]}">${jsonReport.detailedFindings.performance.status}</span></p>
            <p>${jsonReport.detailedFindings.performance.description}</p>
            ${jsonReport.detailedFindings.performance.findings ? `
                <p><strong>Page Load Time:</strong> ${jsonReport.detailedFindings.performance.findings.pageLoadTime}ms</p>
                <p><strong>Performance Checks Passed:</strong> ${jsonReport.detailedFindings.performance.findings.checksPassed} / ${jsonReport.detailedFindings.performance.findings.totalChecks}</p>
                <p><strong>Performance Score:</strong> ${jsonReport.detailedFindings.performance.findings.averageScore}%</p>
            ` : '<p>Audit not run.</p>'}
            <p><strong>Recommendation:</strong> ${jsonReport.detailedFindings.performance.recommendation}</p>
        </div>
    </div>
    
    <div class="section">
        <h2>Compliance Status</h2>
        <table>
            <tr>
                <th>Standard</th>
                <th>Status</th>
            </tr>
            <tr>
                <td>Code Quality Standards</td>
                <td style="color: ${statusColor[jsonReport.compliance.codeQualityStandards === 'COMPLIANT' ? 'PASS' : 'FAIL']}">
                    ${jsonReport.compliance.codeQualityStandards}
                </td>
            </tr>
            <tr>
                <td>Security Standards</td>
                <td style="color: ${statusColor[jsonReport.compliance.securityStandards === 'COMPLIANT' ? 'PASS' : 'FAIL']}">
                    ${jsonReport.compliance.securityStandards}
                </td>
            </tr>
            <tr>
                <td>Performance Standards</td>
                <td style="color: ${statusColor[jsonReport.compliance.performanceStandards === 'COMPLIANT' ? 'PASS' : 'FAIL']}">
                    ${jsonReport.compliance.performanceStandards}
                </td>
            </tr>
        </table>
    </div>
    
    <div class="section">
        <h2>Next Steps</h2>
        <ul class="next-steps">
            ${jsonReport.nextSteps.map(step => `<li>${step}</li>`).join('')}
        </ul>
    </div>
</body>
</html>`;
}

function main() {
    console.log('📊 Generating Audit Report...\n');
    
    const reports = loadLatestReports();
    const jsonReport = generateNonTechnicalReport(reports);
    
    // Save JSON report
    const jsonPath = path.join(AUDIT_DIR, `audit-report-${Date.now()}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));
    console.log(`✅ JSON report saved: ${jsonPath}`);
    
    // Generate and save HTML report
    const htmlReport = generateHTMLReport(jsonReport);
    const htmlPath = path.join(AUDIT_DIR, `audit-report-${Date.now()}.html`);
    fs.writeFileSync(htmlPath, htmlReport);
    console.log(`✅ HTML report saved: ${htmlPath}`);
    
    console.log('\n📋 Report Summary:');
    console.log(`   Overall Status: ${jsonReport.executiveSummary.overallStatus}`);
    console.log(`   Quality: ${jsonReport.executiveSummary.qualityStatus}`);
    console.log(`   Security: ${jsonReport.executiveSummary.securityStatus}`);
    console.log(`   Performance: ${jsonReport.executiveSummary.performanceStatus}`);
    console.log(`\n📄 Reports available at: ${AUDIT_DIR}\n`);
}

if (require.main === module) {
    main();
}

module.exports = { generateNonTechnicalReport, generateHTMLReport };
