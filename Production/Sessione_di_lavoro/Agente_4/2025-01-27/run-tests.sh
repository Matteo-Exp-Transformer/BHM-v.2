#!/bin/bash
# =============================================================================
# TEST RUNNER - Backend Auth System
# =============================================================================

echo "🧪 Running Backend Auth System Tests"
echo "====================================="

# Set test environment
export DENO_TESTING=true
export NODE_ENV=test

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test file
run_test() {
    local test_file=$1
    local test_name=$2
    
    echo ""
    echo "📋 Running $test_name..."
    echo "   File: $test_file"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if deno test --allow-all "$test_file" --quiet; then
        echo "   ✅ PASSED"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo "   ❌ FAILED"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Run all test files
run_test "edge-functions/shared/test-validation.ts" "Validation Logic Tests"
run_test "edge-functions/shared/test-business-logic.ts" "Business Logic Tests"
run_test "edge-functions/shared/test-errors.ts" "Error Handling Tests"

# Summary
echo ""
echo "📊 TEST SUMMARY"
echo "==============="
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $FAILED_TESTS"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo "🎉 ALL TESTS PASSED!"
    echo "✅ Backend implementation is ready for production"
    exit 0
else
    echo ""
    echo "❌ SOME TESTS FAILED"
    echo "🔧 Please fix the failing tests before proceeding"
    exit 1
fi
