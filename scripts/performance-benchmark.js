/**
 * Standalone Performance Benchmark Script
 * Can be run independently for performance testing
 */

const { runPerformanceBenchmark, generatePerformanceReport } = require('./audit-performance');

async function main() {
    console.log('⚡ Running Performance Benchmark...\n');
    
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
    
    console.log('\n📊 Performance Metrics:');
    if (metrics.pageLoadTime) {
        console.log(`   Page Load Time: ${metrics.pageLoadTime}ms`);
        console.log(`   First Contentful Paint: ${metrics.firstContentfulPaint}ms`);
        console.log(`   Largest Contentful Paint: ${metrics.largestContentfulPaint}ms`);
    }
    if (metrics.canvasOperations) {
        console.log(`   Canvas Draw Time: ${metrics.canvasOperations.canvasDrawTime}ms`);
        console.log(`   Text Render Time: ${metrics.canvasOperations.textRenderTime}ms`);
    }
    if (metrics.memoryUsage) {
        console.log(`   Memory Used: ${(metrics.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    }
    
    console.log(`\n✅ Overall Status: ${report.summary.overallStatus}`);
    console.log(`   Checks Passed: ${report.summary.checksPassed}/${report.summary.totalChecks}\n`);
}

if (require.main === module) {
    main().catch(console.error);
}
