#!/usr/bin/env python3
"""
Edge Case Testing for FinTrack AI Backend
Tests error handling, validation, and edge cases
"""

import asyncio
import aiohttp
import json
import sys

BACKEND_URL = "https://73dec375-74fa-435b-b04c-652d66b377bf.preview.emergentagent.com/api"

class EdgeCaseTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = None
        self.test_results = {}
    
    async def setup(self):
        """Setup test session"""
        self.session = aiohttp.ClientSession()
        print(f"🔍 Starting Edge Case Tests")
        print(f"📡 Backend URL: {self.base_url}")
        print("=" * 60)
    
    async def cleanup(self):
        """Cleanup test session"""
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"    {details}")
        
        self.test_results[test_name] = {
            'success': success,
            'details': details
        }
    
    async def test_invalid_endpoints(self):
        """Test invalid endpoints return proper 404s"""
        success_count = 0
        total_tests = 3
        
        # Test invalid account ID
        try:
            async with self.session.get(f"{self.base_url}/accounts/invalid-id") as response:
                if response.status == 404:
                    self.log_test("Invalid Account ID", True, "Returns 404 as expected")
                    success_count += 1
                else:
                    self.log_test("Invalid Account ID", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("Invalid Account ID", False, f"Error: {str(e)}")
        
        # Test invalid holding ID
        try:
            async with self.session.get(f"{self.base_url}/holdings/invalid-id") as response:
                if response.status == 404:
                    self.log_test("Invalid Holding ID", True, "Returns 404 as expected")
                    success_count += 1
                else:
                    self.log_test("Invalid Holding ID", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("Invalid Holding ID", False, f"Error: {str(e)}")
        
        # Test invalid transaction ID
        try:
            async with self.session.get(f"{self.base_url}/transactions/invalid-id") as response:
                if response.status == 404:
                    self.log_test("Invalid Transaction ID", True, "Returns 404 as expected")
                    success_count += 1
                else:
                    self.log_test("Invalid Transaction ID", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("Invalid Transaction ID", False, f"Error: {str(e)}")
        
        return success_count == total_tests
    
    async def test_validation_errors(self):
        """Test validation errors for required fields"""
        success_count = 0
        total_tests = 3
        
        # Test account creation without required fields
        try:
            invalid_account = {"name": ""}  # Empty name
            async with self.session.post(f"{self.base_url}/accounts", json=invalid_account) as response:
                if response.status in [400, 422]:  # Validation error
                    self.log_test("Account Validation", True, f"Validation error returned: {response.status}")
                    success_count += 1
                else:
                    self.log_test("Account Validation", False, f"Expected validation error, got: {response.status}")
        except Exception as e:
            self.log_test("Account Validation", False, f"Error: {str(e)}")
        
        # Test transaction creation without account_id
        try:
            invalid_transaction = {
                "date": "2024-01-15",
                "description": "Test",
                "amount": -10.0,
                "category": "Test"
                # Missing account_id
            }
            async with self.session.post(f"{self.base_url}/transactions", json=invalid_transaction) as response:
                if response.status in [400, 422]:  # Validation error
                    self.log_test("Transaction Validation", True, f"Validation error returned: {response.status}")
                    success_count += 1
                else:
                    self.log_test("Transaction Validation", False, f"Expected validation error, got: {response.status}")
        except Exception as e:
            self.log_test("Transaction Validation", False, f"Error: {str(e)}")
        
        # Test AI chat without message
        try:
            invalid_chat = {}  # Empty message
            async with self.session.post(f"{self.base_url}/ai/chat", json=invalid_chat) as response:
                if response.status == 400:  # Bad request
                    self.log_test("AI Chat Validation", True, "Empty message validation works")
                    success_count += 1
                else:
                    self.log_test("AI Chat Validation", False, f"Expected 400, got: {response.status}")
        except Exception as e:
            self.log_test("AI Chat Validation", False, f"Error: {str(e)}")
        
        return success_count == total_tests
    
    async def test_ai_edge_cases(self):
        """Test AI service edge cases"""
        success_count = 0
        total_tests = 2
        
        # Test AI with very long message
        try:
            long_message = "A" * 1000  # Very long message
            chat_data = {"message": long_message}
            async with self.session.post(f"{self.base_url}/ai/chat", json=chat_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'response' in data:
                        self.log_test("AI Long Message", True, "Handled long message successfully")
                        success_count += 1
                    else:
                        self.log_test("AI Long Message", False, "No response returned")
                else:
                    self.log_test("AI Long Message", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("AI Long Message", False, f"Error: {str(e)}")
        
        # Test AI with special characters
        try:
            special_message = "I spent $25.50 on café & restaurant! 🍕"
            chat_data = {"message": special_message}
            async with self.session.post(f"{self.base_url}/ai/chat", json=chat_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'response' in data:
                        self.log_test("AI Special Characters", True, "Handled special characters successfully")
                        success_count += 1
                    else:
                        self.log_test("AI Special Characters", False, "No response returned")
                else:
                    self.log_test("AI Special Characters", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("AI Special Characters", False, f"Error: {str(e)}")
        
        return success_count == total_tests
    
    async def test_analytics_edge_cases(self):
        """Test analytics with no data"""
        success_count = 0
        total_tests = 3
        
        # All analytics should handle empty data gracefully
        endpoints = [
            ("spending-by-category", "Spending by Category"),
            ("monthly-spending", "Monthly Spending"),
            ("asset-allocation", "Asset Allocation")
        ]
        
        for endpoint, name in endpoints:
            try:
                async with self.session.get(f"{self.base_url}/analytics/{endpoint}") as response:
                    if response.status == 200:
                        data = await response.json()
                        self.log_test(f"{name} Empty Data", True, "Handled empty data gracefully")
                        success_count += 1
                    else:
                        self.log_test(f"{name} Empty Data", False, f"Status: {response.status}")
            except Exception as e:
                self.log_test(f"{name} Empty Data", False, f"Error: {str(e)}")
        
        return success_count == total_tests
    
    async def run_all_tests(self):
        """Run all edge case tests"""
        await self.setup()
        
        try:
            tests = [
                ("Invalid Endpoints", self.test_invalid_endpoints),
                ("Validation Errors", self.test_validation_errors),
                ("AI Edge Cases", self.test_ai_edge_cases),
                ("Analytics Edge Cases", self.test_analytics_edge_cases),
            ]
            
            results = {}
            for test_name, test_func in tests:
                print(f"\n🧪 Testing {test_name}...")
                try:
                    results[test_name] = await test_func()
                except Exception as e:
                    print(f"❌ {test_name} failed with exception: {str(e)}")
                    results[test_name] = False
            
            # Summary
            print("\n" + "=" * 60)
            print("📊 EDGE CASE TEST SUMMARY")
            print("=" * 60)
            
            passed = sum(1 for result in results.values() if result)
            total = len(results)
            
            for test_name, result in results.items():
                status = "✅ PASS" if result else "❌ FAIL"
                print(f"{status} {test_name}")
            
            print(f"\n🎯 Overall: {passed}/{total} edge case tests passed ({passed/total*100:.1f}%)")
            
            if passed == total:
                print("🎉 All edge case tests passed!")
                return True
            else:
                print("⚠️  Some edge case tests failed. Check details above.")
                return False
                
        finally:
            await self.cleanup()

async def main():
    """Main test runner"""
    tester = EdgeCaseTester()
    success = await tester.run_all_tests()
    return success

if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n🛑 Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Test runner failed: {str(e)}")
        sys.exit(1)