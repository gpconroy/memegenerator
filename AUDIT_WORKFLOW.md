# Audit Workflow Guide

## Complete Audit Workflow

This guide explains the complete audit workflow for ensuring code quality, security, and performance.

## Workflow Overview

```
Development (Composer 1) → Automated Audits → Review (Opus 4.6 Fast) → Reports → Approval
```

## Step-by-Step Process

### 1. Development Phase
- Use **Composer 1** for code development
- Follow best practices from `.cursor/rules/`
- Make incremental commits

### 2. Pre-Audit Setup

```bash
# Install dependencies
npm install

# Ensure local server is running (for performance tests)
python -m http.server 8000
```

### 3. Run Full Audit Suite

```bash
# Run all audits
npm run audit:all
```

This runs:
- ✅ Code Quality Audit
- ✅ Security Audit  
- ✅ Performance Audit
- ✅ Test Coverage Audit

### 4. Review with Opus 4.6 Fast

```bash
# Generate review prompt
node scripts/opus-audit-review.js

# Copy the generated prompt and use with Opus 4.6 Fast
# Save review results in audit-results/opus-review-*.md
```

**Opus 4.6 Fast Review Checklist:**
- [ ] Review code quality findings
- [ ] Verify security vulnerabilities
- [ ] Assess performance metrics
- [ ] Check test coverage completeness
- [ ] Identify any missed issues
- [ ] Provide independent risk assessment

### 5. Generate Stakeholder Reports

```bash
# Generate HTML report for non-technical stakeholders
npm run audit:report
```

Reports are saved in `audit-results/audit-report-*.html`

### 6. Address Issues

If audits fail:
1. Review detailed JSON reports
2. Fix identified issues
3. Re-run audits
4. Get Opus 4.6 Fast review again

### 7. Approval and Deployment

Once all audits pass:
- ✅ All automated checks pass
- ✅ Opus 4.6 Fast review approved
- ✅ Stakeholder reports generated
- ✅ Ready for production deployment

## Version-Specific Audits

Each version should have:
1. **Audit timestamp** - When audit was run
2. **Git commit hash** - Code version audited
3. **Audit results** - JSON files with detailed data
4. **Stakeholder report** - HTML report for non-technical review
5. **Opus review** - Independent model review

## Audit Evidence Storage

### Recommended Structure

```
audit-results/
├── v1.0.0/
│   ├── quality-audit-*.json
│   ├── security-audit-*.json
│   ├── performance-audit-*.json
│   ├── full-audit-summary-*.json
│   ├── audit-report-*.html
│   └── opus-review-*.md
├── v1.1.0/
│   └── ...
└── latest -> v1.1.0/
```

### Git Integration

Option 1: Track in main repository
```bash
# Add audit results to git
git add audit-results/
git commit -m "Add audit results for v1.0.0"
```

Option 2: Separate audit repository
- Create dedicated repository for audit results
- Tag each version
- Maintain audit history separately

## Automated Workflow Script

Create `scripts/audit-workflow.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Starting Complete Audit Workflow..."

# Step 1: Run audits
echo "📊 Running automated audits..."
npm run audit:all

# Step 2: Generate reports
echo "📄 Generating stakeholder reports..."
npm run audit:report

# Step 3: Prepare Opus review
echo "🤖 Preparing Opus 4.6 Fast review..."
node scripts/opus-audit-review.js

echo "✅ Audit workflow complete!"
echo "📁 Results in: audit-results/"
echo "💡 Next: Review with Opus 4.6 Fast"
```

## Compliance Checklist

For each version release:

- [ ] Code quality audit passed
- [ ] Security audit passed (0 vulnerabilities)
- [ ] Performance benchmarks met
- [ ] 100% test coverage achieved
- [ ] E2E tests passing
- [ ] Opus 4.6 Fast review completed
- [ ] Stakeholder report generated
- [ ] All issues addressed
- [ ] Audit evidence archived
- [ ] Approval obtained

## Troubleshooting

### Audits Failing

1. Check individual audit outputs
2. Review JSON reports for details
3. Fix identified issues
4. Re-run specific audit: `npm run audit:quality`
5. Re-run full suite: `npm run audit:all`

### Performance Tests Failing

Ensure local server is running:
```bash
python -m http.server 8000
```

### Coverage Not 100%

1. Open coverage report: `coverage/index.html`
2. Identify uncovered lines
3. Add tests for uncovered code
4. Re-run: `npm run audit:coverage`

## Best Practices

1. **Run audits frequently** - Not just before release
2. **Fix issues immediately** - Don't accumulate technical debt
3. **Document exceptions** - If standards can't be met, document why
4. **Review with Opus** - Always get independent review
5. **Archive results** - Keep audit history for compliance
6. **Automate** - Use scripts to ensure consistency

## Integration with CI/CD

Example GitHub Actions workflow:

```yaml
name: Audit Pipeline

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run audit:all
      - run: npm run audit:report
      - uses: actions/upload-artifact@v3
        with:
          name: audit-reports
          path: audit-results/
```

## Questions?

Refer to:
- `AUDIT_SYSTEM.md` - Technical details
- `.cursor/rules/` - Best practices
- Individual audit scripts - Implementation details
