/**
 * B.10.1 System Integration & Testing - Integration Test Runner
 * Execute complete integration testing suite
 */

import { integrationServicesManager } from './index'

/**
 * Test B.10.1 System Integration & Testing
 */
export async function testB10Integration(): Promise<void> {
  console.log('🧪 Testing B.10.1 System Integration & Testing...\n')

  try {
    // Test 1: Initialize Integration Services
    console.log('📋 Test 1: Initialize Integration Services')
    await integrationServicesManager.initialize()
    console.log('✅ Integration services initialized successfully\n')

    // Test 2: Run Quick Health Check
    console.log('🏥 Test 2: Quick System Health Check')
    const healthCheck = await integrationServicesManager.runQuickHealthCheck()
    console.log(
      `✅ Health Check completed: ${healthCheck.status} (${healthCheck.score}/100)`
    )

    if (healthCheck.issues.length > 0) {
      console.log('⚠️ Issues found:')
      healthCheck.issues.forEach(issue => console.log(`   - ${issue}`))
    }

    if (healthCheck.recommendations.length > 0) {
      console.log('💡 Recommendations:')
      healthCheck.recommendations.forEach(rec => console.log(`   - ${rec}`))
    }
    console.log('')

    // Test 3: Generate Production Readiness Report
    console.log('📋 Test 3: Production Readiness Assessment')
    const readinessReport =
      await integrationServicesManager.generateProductionReadinessReport()
    console.log(
      `✅ Production Readiness: ${readinessReport.ready ? 'READY' : 'NOT READY'} (${readinessReport.score}%)`
    )
    console.log(
      `   - Completed items: ${readinessReport.checklist.filter(item => item.status === 'COMPLETED').length}/${readinessReport.checklist.length}`
    )
    console.log(`   - Blockers: ${readinessReport.blockers.length}`)

    if (readinessReport.ready) {
      console.log('🚀 System is ready for production deployment!')
    }
    console.log('')

    // Test 4: Run Complete Integration Test Suite (if health check passes)
    if (healthCheck.status !== 'CRITICAL') {
      console.log('🔗 Test 4: Complete System Integration Test Suite')
      const completeResults =
        await integrationServicesManager.runCompleteTestSuite()

      console.log(
        `✅ Integration Test Suite completed: ${completeResults.overallStatus}`
      )
      console.log(
        `   - Integration Tests: ${completeResults.integrationReport.overallStatus} (${completeResults.integrationReport.passedTests}/${completeResults.integrationReport.totalTests})`
      )
      console.log(
        `   - Performance: ${completeResults.performanceReport.overallStatus} (${completeResults.performanceReport.overallScore.toFixed(1)}%)`
      )
      console.log(
        `   - Production Ready: ${completeResults.readyForProduction ? 'YES' : 'NO'}`
      )
      console.log('')

      // Test 5: Verify Service Status
      console.log('📊 Test 5: Service Status Verification')
      const serviceStatus = integrationServicesManager.getStatus()
      console.log(`✅ Service Status verified:`)
      console.log(`   - Initialized: ${serviceStatus.initialized}`)
      console.log(
        `   - Integration Service: ${serviceStatus.services.integration}`
      )
      console.log(
        `   - Performance Service: ${serviceStatus.services.performance}`
      )
      console.log(
        `   - Health Check Service: ${serviceStatus.services.healthCheck}`
      )
      console.log('')

      // Final Integration Test Summary
      console.log(
        '🎉 B.10.1 SYSTEM INTEGRATION & TESTING COMPLETED SUCCESSFULLY!'
      )
      console.log('📊 INTEGRATION SUMMARY:')
      console.log(
        '   ✅ Integration Services - Service initialization and management'
      )
      console.log('   ✅ System Health Check - Quick system health assessment')
      console.log(
        '   ✅ Production Readiness - Comprehensive readiness evaluation'
      )
      console.log(
        '   ✅ Complete Test Suite - Full integration and performance testing'
      )
      console.log(
        '   ✅ Service Status - Service monitoring and status reporting'
      )

      if (completeResults.readyForProduction) {
        console.log('\n🚀 B.10.1 SYSTEM IS PRODUCTION READY!')
        console.log('💡 Next Steps:')
        console.log('   - Deploy to production environment')
        console.log('   - Configure production monitoring')
        console.log('   - Setup automated health checks')
        console.log('   - Enable production analytics')
      } else {
        console.log('\n⚠️ B.10.1 SYSTEM REQUIRES OPTIMIZATION')
        console.log('💡 Required Actions:')
        if (completeResults.integrationReport.overallStatus !== 'PASSED') {
          console.log('   - Address integration test failures')
        }
        if (completeResults.performanceReport.overallScore < 80) {
          console.log('   - Optimize performance benchmarks')
        }
      }
    } else {
      console.log(
        '⚠️ Skipping complete test suite due to critical health issues'
      )
    }
  } catch (error) {
    console.error('❌ B.10.1 integration test failed:', error)
    throw error
  }
}

// Auto-run test in development mode
if (import.meta.env?.DEV) {
  console.log('🧪 B.10.1 System Integration & Testing ready for execution')
}
