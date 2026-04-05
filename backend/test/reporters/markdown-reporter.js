'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Custom Jest Reporter — outputs a Markdown test report to API-TEST-REPORT.md
 */
class MarkdownReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options || {};
    this._results = [];
  }

  onTestResult(_test, testResult) {
    for (const result of testResult.testResults) {
      // Parse module name and endpoint from test title
      // Expected format: "describe > it" or nested describes
      const parts = result.ancestorTitles || [];
      const module = parts[0] || 'Unknown';
      const endpointDesc = parts[1] || parts[0] || 'Unknown';
      const testName = result.title;

      // Extract HTTP method and path from describe title (e.g. "POST /auth/register")
      const methodMatch = endpointDesc.match(/^(GET|POST|PATCH|PUT|DELETE)\s+(\/\S+)/i);
      const method = methodMatch ? methodMatch[1].toUpperCase() : '';
      const endpoint = methodMatch ? methodMatch[2] : endpointDesc;

      this._results.push({
        module,
        endpointDesc,
        method,
        endpoint,
        testName,
        status: result.status, // 'passed' | 'failed' | 'pending' | 'todo' | 'skipped'
        duration: result.duration || 0,
        failureMessages: result.failureMessages || [],
      });
    }
  }

  onRunComplete(_contexts, aggregatedResults) {
    const { numPassedTests, numFailedTests, numPendingTests, numTotalTests } = aggregatedResults;
    const duration = ((aggregatedResults.testResults || []).reduce((sum, r) => sum + (r.perfStats?.runtime || 0), 0) / 1000).toFixed(2);

    // Group by module
    const byModule = {};
    for (const r of this._results) {
      if (!byModule[r.module]) byModule[r.module] = [];
      byModule[r.module].push(r);
    }

    // Build markdown
    const lines = [];
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    lines.push(`# API Test Report`);
    lines.push(`> Generated: ${timestamp}`);
    lines.push('');
    lines.push('## Summary');
    lines.push('');
    lines.push(`| Metric | Value |`);
    lines.push(`|--------|-------|`);
    lines.push(`| Total Tests | ${numTotalTests} |`);
    lines.push(`| ✅ Passed | ${numPassedTests} |`);
    lines.push(`| ❌ Failed | ${numFailedTests} |`);
    lines.push(`| ⏭ Skipped/Pending | ${numPendingTests} |`);
    lines.push(`| Duration | ${duration}s |`);
    lines.push('');

    const statusIcon = (s) => {
      if (s === 'passed') return '✅';
      if (s === 'failed') return '❌';
      return '⏭';
    };

    // Image upload endpoints summary first
    const uploadResults = this._results.filter(r =>
      r.endpointDesc && r.endpointDesc.toLowerCase().includes('image') ||
      r.endpointDesc && r.endpointDesc.toLowerCase().includes('avatar') ||
      r.endpointDesc && r.endpointDesc.toLowerCase().includes('photo')
    );

    if (uploadResults.length > 0) {
      lines.push('## 📸 Image Upload Endpoints');
      lines.push('');
      lines.push('| Module | Endpoint | Method | Test | Status | Notes |');
      lines.push('|--------|----------|--------|------|--------|-------|');
      for (const r of uploadResults) {
        const icon = statusIcon(r.status);
        const err = r.failureMessages.length > 0
          ? r.failureMessages[0].split('\n')[0].substring(0, 80).replace(/\|/g, '\\|')
          : '';
        lines.push(`| ${r.module} | \`${r.endpoint}\` | ${r.method} | ${r.testName} | ${icon} ${r.status.toUpperCase()} | ${err} |`);
      }
      lines.push('');
    }

    // All modules
    lines.push('## Results by Module');
    lines.push('');

    for (const [module, results] of Object.entries(byModule)) {
      const passed = results.filter(r => r.status === 'passed').length;
      const failed = results.filter(r => r.status === 'failed').length;
      const moduleIcon = failed > 0 ? '❌' : '✅';

      lines.push(`### ${moduleIcon} ${module} (${passed}/${results.length} passed)`);
      lines.push('');
      lines.push('| Endpoint | Method | Test | Status | Duration |');
      lines.push('|----------|--------|------|--------|----------|');

      for (const r of results) {
        const icon = statusIcon(r.status);
        const dur = r.duration ? `${r.duration}ms` : '-';
        lines.push(`| \`${r.endpoint || r.endpointDesc}\` | ${r.method || '-'} | ${r.testName} | ${icon} ${r.status.toUpperCase()} | ${dur} |`);
      }

      // Show failures inline
      const failures = results.filter(r => r.status === 'failed');
      if (failures.length > 0) {
        lines.push('');
        lines.push('**Failures:**');
        for (const f of failures) {
          lines.push('');
          lines.push(`- **${f.testName}**: \`${f.failureMessages[0]?.split('\n')[0] || 'Unknown error'}\``);
        }
      }
      lines.push('');
    }

    // Full failures section
    const allFailures = this._results.filter(r => r.status === 'failed');
    if (allFailures.length > 0) {
      lines.push('---');
      lines.push('');
      lines.push('## ❌ Failed Tests Detail');
      lines.push('');
      for (const f of allFailures) {
        lines.push(`### ${f.module} › ${f.endpointDesc} › ${f.testName}`);
        lines.push('```');
        lines.push((f.failureMessages[0] || 'No error message').substring(0, 1000));
        lines.push('```');
        lines.push('');
      }
    }

    const outputPath = path.join(process.cwd(), 'API-TEST-REPORT.md');
    fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');
    console.log(`\n📄 API Test Report saved to: ${outputPath}`);
  }
}

module.exports = MarkdownReporter;
