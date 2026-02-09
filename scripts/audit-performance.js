/**
 * Performance Audit Script
 * Benchmarks application performance metrics
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const AUDIT_DIR = path.join(__dirname, '..', 'audit-results');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

function ensureAuditDir() {
    if (!fs.existsSync(AUDIT_DIR)) {
        fs.mkdirSync(AUDIT_DIR, { recursive: true });
    }
}

async function measurePageLoadTime(page) {
    const navigationStart = await page.evaluate(() => window.performance.timing.navigationStart);
    const loadEventEnd = await page.evaluate(() => window.performance.timing.loadEventEnd);
    return loadEventEnd - navigationStart;
}

async function measureFirstContentfulPaint(page) {
    const paintMetrics = await page.evaluate(() => {
        const perfEntries = performance.getEntriesByType('paint');
        const fcp = perfEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcp ? fcp.startTime : null;
    });
    return paintMetrics;
}

async function measureLargestContentfulPaint(page) {
    const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                resolve(lastEntry.renderTime || lastEntry.loadTime);
            }).observe({ entryTypes: ['largest-contentful-paint'] });
            
            setTimeout(() => resolve(null), 5000);
        });
    });
    return lcp;
}

async function measureMemoryUsage(page) {
    const memory = await page.evaluate(() => {
        if (performance.memory) {
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    });
    return memory;
}

async function measureCanvasOperations(page) {
    // Load an image and measure canvas draw time
    await page.goto('http://localhost:8000/index.html');
    await page.waitForSelector('.template-item');
    
    const startTime = Date.now();
    await page.click('.template-item');
    await page.waitForTimeout(100); // Wait for image to load
    
    const canvasDrawTime = Date.now() - startTime;
    
    // Measure text rendering
    await page.fill('#topText', 'Test Text');
    const textRenderStart = Date.now();
    await page.waitForTimeout(50);
    const textRenderTime = Date.now() - textRenderStart;
    
    return {
        canvasDrawTime,
        textRenderTime
    };
}

async function runPerformanceBenchmark() {
    console.log('⚡ Starting Performance Benchmark...\n');
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        console.log('📊 Measuring page load metrics...');
        await page.goto('http://localhost:8000/index.html', { waitUntil: 'networkidle0' });
        
        const pageLoadTime = await measurePageLoadTime(page);
        const fcp = await measureFirstContentfulPaint(page);
        const lcp = await measureLargestContentfulPaint(page);
        const memory = await measureMemoryUsage(page);
        
        console.log('🎨 Measuring canvas operations...');
        const canvasMetrics = await measureCanvasOperations(page);
        
        await browser.close();
        
        return {
            pageLoadTime,
            firstContentfulPaint: fcp,
            largestContentfulPaint: lcp,
            memoryUsage: memory,
            canvasOperations: canvasMetrics
        };
    } catch (error) {
        await browser.close();
        console.error('Error during performance benchmark:', error);
        return {
            error: error.message,
            pageLoadTime: null,
            firstContentfulPaint: null,
            largestContentfulPaint: null,
            memoryUsage: null,
            canvasOperations: null
        };
    }
}

function generatePerformanceReport(metrics) {
    const thresholds = {
        pageLoadTime: 3000, // 3 seconds
        firstContentfulPaint: 1800, // 1.8 seconds
        largestContentfulPaint: 2500, // 2.5 seconds
        canvasDrawTime: 500, // 500ms
        textRenderTime: 100 // 100ms
    };
    
    const checks = {
        pageLoadTime: metrics.pageLoadTime ? metrics.pageLoadTime <= thresholds.pageLoadTime : false,
        firstContentfulPaint: metrics.firstContentfulPaint ? metrics.firstContentfulPaint <= thresholds.firstContentfulPaint : false,
        largestContentfulPaint: metrics.largestContentfulPaint ? metrics.largestContentfulPaint <= thresholds.largestContentfulPaint : false,
        canvasDrawTime: metrics.canvasOperations ? metrics.canvasOperations.canvasDrawTime <= thresholds.canvasDrawTime : false,
        textRenderTime: metrics.canvasOperations ? metrics.canvasOperations.textRenderTime <= thresholds.textRenderTime : false
    };
    
    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    
    const report = {
        timestamp: new Date().toISOString(),
        version: require('../package.json').version,
        performance: {
            metrics: {
                pageLoadTime: metrics.pageLoadTime,
                firstContentfulPaint: metrics.firstContentfulPaint,
                largestContentfulPaint: metrics.largestContentfulPaint,
                memoryUsage: metrics.memoryUsage,
                canvasOperations: metrics.canvasOperations
            },
            thresholds,
            checks,
            scores: {
                pageLoadScore: metrics.pageLoadTime ? 
                    Math.max(0, 100 - ((metrics.pageLoadTime / thresholds.pageLoadTime) * 100)) : 0,
                fcpScore: metrics.firstContentfulPaint ? 
                    Math.max(0, 100 - ((metrics.firstContentfulPaint / thresholds.firstContentfulPaint) * 100)) : 0,
                lcpScore: metrics.largestContentfulPaint ? 
                    Math.max(0, 100 - ((metrics.largestContentfulPaint / thresholds.largestContentfulPaint) * 100)) : 0
            }
        },
        summary: {
            overallStatus: passedChecks === totalChecks ? 'PASS' : 'FAIL',
            checksPassed: passedChecks,
            totalChecks,
            averageScore: metrics.pageLoadTime ? 
                ((checks.pageLoadTime ? 100 : 0) + 
                 (checks.firstContentfulPaint ? 100 : 0) + 
                 (checks.largestContentfulPaint ? 100 : 0)) / 3 : 0
        }
    };
    
    return report;
}

function saveReport(report) {
    const filename = `performance-audit-${TIMESTAMP}.json`;
    const filepath = path.join(AUDIT_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`✅ Performance audit report saved: ${filepath}`);
    return filepath;
}

async function main() {
    console.log('🚀 Starting Performance Audit...\n');
    ensureAuditDir();
    
    // Check if server is running
    try {
        const http = require('http');
        await new Promise((resolve, reject) => {
            const req = http.get('http://localhost:8000', (res) => {
                resolve();
            });
            req.on('error', reject);
            req.setTimeout(2000, () => reject(new Error('Server not responding')));
        });
    } catch (error) {
        console.error('❌ Error: Local server not running on port 8000');
        console.error('   Please start the server: python -m http.server 8000');
        process.exit(1);
    }
    
    const metrics = await runPerformanceBenchmark();
    const report = generatePerformanceReport(metrics);
    const reportPath = saveReport(report);
    
    console.log('\n📋 Performance Audit Summary:');
    console.log(`   Overall Status: ${report.summary.overallStatus}`);
    console.log(`   Checks Passed: ${report.summary.checksPassed}/${report.summary.totalChecks}`);
    if (metrics.pageLoadTime) {
        console.log(`   Page Load Time: ${metrics.pageLoadTime}ms`);
        console.log(`   First Contentful Paint: ${metrics.firstContentfulPaint}ms`);
    }
    console.log(`\n📄 Full report: ${reportPath}\n`);
    
    process.exit(report.summary.overallStatus === 'PASS' ? 0 : 1);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { runPerformanceBenchmark, generatePerformanceReport };
