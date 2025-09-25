#!/usr/bin/env node

/**
 * Comprehensive Test Runner Script
 *
 * Runs all test suites and generates a comprehensive report
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Starting Comprehensive Test Suite...\n");

const testSuites = [
  {
    name: "Integration Tests",
    command: "npm run test:integration",
    description: "Testing component interactions and game flow",
  },
  {
    name: "End-to-End Tests",
    command: "npm run test:e2e",
    description: "Testing complete user journeys",
  },
  {
    name: "Performance Tests",
    command: "npm run test:performance",
    description: "Testing performance benchmarks",
  },
  {
    name: "Accessibility Tests",
    command: "npm run test:accessibility",
    description: "Testing WCAG compliance and accessibility",
  },
  {
    name: "Visual Regression Tests",
    command: "npm run test:visual",
    description: "Testing UI consistency and visual regressions",
  },
];

const results = [];
let totalDuration = 0;

for (const suite of testSuites) {
  console.log(`📋 Running ${suite.name}...`);
  console.log(`   ${suite.description}`);

  const startTime = Date.now();

  try {
    const output = execSync(suite.command, {
      encoding: "utf8",
      stdio: "pipe",
    });

    const endTime = Date.now();
    const duration = endTime - startTime;
    totalDuration += duration;

    // Parse Jest output for test results
    const passed = (output.match(/✓/g) || []).length;
    const failed = (output.match(/✕/g) || []).length;
    const skipped = (output.match(/○/g) || []).length;

    results.push({
      name: suite.name,
      status: "passed",
      passed,
      failed,
      skipped,
      duration,
      output: output.substring(0, 500), // Truncate for brevity
    });

    console.log(`   ✅ Completed in ${(duration / 1000).toFixed(2)}s`);
    console.log(`   📊 Passed: ${passed}, Failed: ${failed}, Skipped: ${skipped}\n`);
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    totalDuration += duration;

    // Parse error output for test results
    const output = error.stdout || error.message;
    const passed = (output.match(/✓/g) || []).length;
    const failed = (output.match(/✕/g) || []).length;
    const skipped = (output.match(/○/g) || []).length;

    results.push({
      name: suite.name,
      status: "failed",
      passed,
      failed,
      skipped,
      duration,
      error: error.message.substring(0, 500), // Truncate for brevity
    });

    console.log(`   ❌ Failed in ${(duration / 1000).toFixed(2)}s`);
    console.log(`   📊 Passed: ${passed}, Failed: ${failed}, Skipped: ${skipped}`);
    console.log(`   🔍 Error: ${error.message.substring(0, 100)}...\n`);
  }
}

// Generate comprehensive report
console.log("📊 Generating Comprehensive Test Report...\n");

const totalTests = results.reduce((sum, r) => sum + r.passed + r.failed + r.skipped, 0);
const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);
const passRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : "0.0";

const report = `
=============================================================================
COMPREHENSIVE TEST REPORT
=============================================================================
Generated: ${new Date().toISOString()}
Platform: ${process.platform}
Node Version: ${process.version}

EXECUTIVE SUMMARY
-----------------------------------------------------------------------------
Total Tests: ${totalTests}
Passed: ${totalPassed} (${passRate}%)
Failed: ${totalFailed}
Skipped: ${totalSkipped}
Total Duration: ${(totalDuration / 1000).toFixed(2)}s

TEST SUITE BREAKDOWN
-----------------------------------------------------------------------------
${results
  .map((result) => {
    const total = result.passed + result.failed + result.skipped;
    const suitePassRate = total > 0 ? ((result.passed / total) * 100).toFixed(1) : "0.0";
    const status = result.status === "passed" ? "✅" : "❌";

    return `${status} ${result.name}:
  Passed: ${result.passed}/${total} (${suitePassRate}%)
  Duration: ${(result.duration / 1000).toFixed(2)}s
  ${result.failed > 0 ? `❌ ${result.failed} failed tests` : ""}
`;
  })
  .join("\n")}

PERFORMANCE METRICS
-----------------------------------------------------------------------------
Average Suite Duration: ${(totalDuration / results.length / 1000).toFixed(2)}s
Fastest Suite: ${Math.min(...results.map((r) => r.duration / 1000)).toFixed(2)}s
Slowest Suite: ${Math.max(...results.map((r) => r.duration / 1000)).toFixed(2)}s

RECOMMENDATIONS
-----------------------------------------------------------------------------
${generateRecommendations(results, totalPassed, totalFailed, passRate)}

=============================================================================
`;

// Save report to file
const reportPath = path.join(
  process.cwd(),
  "test-results",
  `comprehensive-report-${new Date().toISOString().split("T")[0]}.txt`
);

// Ensure directory exists
const reportDir = path.dirname(reportPath);
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

fs.writeFileSync(reportPath, report);

console.log(report);
console.log(`📄 Report saved to: ${reportPath}`);

// Exit with appropriate code
const hasFailures = results.some((r) => r.status === "failed" || r.failed > 0);
process.exit(hasFailures ? 1 : 0);

function generateRecommendations(results, totalPassed, totalFailed, passRate) {
  const recommendations = [];

  if (parseFloat(passRate) < 95) {
    recommendations.push("• Consider increasing test coverage to achieve 95%+ pass rate");
  }

  if (totalFailed > 0) {
    recommendations.push("• Fix failing tests before deployment");
  }

  const failedSuites = results.filter((r) => r.status === "failed");
  if (failedSuites.length > 0) {
    recommendations.push(`• Address issues in: ${failedSuites.map((s) => s.name).join(", ")}`);
  }

  const slowSuites = results.filter((r) => r.duration > 30000); // > 30 seconds
  if (slowSuites.length > 0) {
    recommendations.push(`• Optimize slow test suites: ${slowSuites.map((s) => s.name).join(", ")}`);
  }

  if (totalFailed === 0 && parseFloat(passRate) >= 95) {
    recommendations.push("✅ Excellent! All tests passing with high coverage");
    recommendations.push("✅ Test suite is comprehensive and well-maintained");
  }

  return recommendations.length > 0
    ? recommendations.join("\n")
    : "✅ No specific recommendations - test suite looks good!";
}
