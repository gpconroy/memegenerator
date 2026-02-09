# Audit System Quick Start

## 🚀 Getting Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Full Audit
```bash
npm run audit:all
```

### 3. Generate Report
```bash
npm run audit:report
```

### 4. Review with Opus 4.6 Fast
```bash
node scripts/opus-audit-review.js
# Copy the generated prompt and use with Opus 4.6 Fast
```

## 📊 What Gets Audited

| Audit Type | Tool | Target | Output |
|------------|------|--------|--------|
| Code Quality | ESLint | Pass | `quality-audit-*.json` |
| Security | npm audit + custom | 0 vulnerabilities | `security-audit-*.json` |
| Performance | Puppeteer | < 3s load time | `performance-audit-*.json` |
| Coverage | Jest | 100% | `coverage/` + JSON |
| E2E Tests | Playwright | All passing | `e2e-results.json` |

## 📁 Audit Results Location

All results saved in: `audit-results/`

- JSON files: Technical details
- HTML files: Stakeholder reports
- Summary files: Quick overview

## ✅ Success Criteria

For production deployment:
- ✅ Code quality: PASS
- ✅ Security: 0 vulnerabilities
- ✅ Performance: All benchmarks met
- ✅ Coverage: 100%
- ✅ E2E: All tests passing
- ✅ Opus Review: Approved

## 🔄 Typical Workflow

```
1. Develop code (Composer 1)
2. Run: npm run audit:all
3. Review with Opus 4.6 Fast
4. Generate: npm run audit:report
5. Address any issues
6. Re-run audits
7. Deploy when all pass
```

## 📚 Full Documentation

- `AUDIT_SYSTEM.md` - Complete technical documentation
- `AUDIT_WORKFLOW.md` - Detailed workflow guide
- `README.md` - Project overview

## 🆘 Troubleshooting

**Server not running?**
```bash
python -m http.server 8000
```

**Coverage not 100%?**
```bash
npm run audit:coverage
# Open coverage/index.html to see what's missing
```

**Audits failing?**
- Check individual JSON reports in `audit-results/`
- Review error messages
- Fix issues and re-run

## 💡 Pro Tips

1. Run audits before each commit
2. Keep audit results in version control
3. Use Opus 4.6 Fast for independent review
4. Generate HTML reports for stakeholders
5. Archive results by version
