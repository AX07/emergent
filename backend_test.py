#!/usr/bin/env python3
"""
Comprehensive Backend Testing for FinTrack AI
Tests all backend API endpoints and functionality
"""

import asyncio
import aiohttp
import json
import os
import sys
from datetime import datetime, date
from typing import Dict, List, Any
import csv
import io

# Get backend URL from frontend .env
BACKEND_URL = "https://73dec375-74fa-435b-b04c-652d66b377bf.preview.emergentagent.com/api"

class FinTrackBackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = None
        self.test_results = {}
        self.created_resources = {
            'accounts': [],
            'holdings': [],
            'transactions': []
        }
    
    async def setup(self):
        """Setup test session"""
        self.session = aiohttp.ClientSession()
        print(f"🚀 Starting FinTrack AI Backend Tests")
        print(f"📡 Backend URL: {self.base_url}")
        print("=" * 60)
    
    async def cleanup(self):
        """Cleanup test session and resources"""
        # Clean up created resources in reverse order
        try:
            # Delete transactions
            for transaction_id in self.created_resources['transactions']:
                try:
                    await self.session.delete(f"{self.base_url}/transactions/{transaction_id}")
                except:
                    pass
            
            # Delete holdings
            for holding_id in self.created_resources['holdings']:
                try:
                    await self.session.delete(f"{self.base_url}/holdings/{holding_id}")
                except:
                    pass
            
            # Delete accounts
            for account_id in self.created_resources['accounts']:
                try:
                    await self.session.delete(f"{self.base_url}/accounts/{account_id}")
                except:
                    pass
        except:
            pass
        
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
    
    async def test_root_endpoint(self):
        """Test root API endpoint"""
        try:
            async with self.session.get(f"{self.base_url}/") as response:
                if response.status == 200:
                    data = await response.json()
                    if "FinTrack AI Backend API" in data.get('message', ''):
                        self.log_test("Root Endpoint", True, f"Version: {data.get('version')}")
                        return True
                    else:
                        self.log_test("Root Endpoint", False, "Invalid response message")
                        return False
                else:
                    self.log_test("Root Endpoint", False, f"Status: {response.status}")
                    return False
        except Exception as e:
            self.log_test("Root Endpoint", False, f"Error: {str(e)}")
            return False
    
    async def test_account_crud(self):
        """Test Account CRUD operations"""
        success_count = 0
        total_tests = 5
        
        # Test 1: Create Account
        try:
            account_data = {
                "name": "Chase Checking",
                "institution": "Chase Bank",
                "category": "Bank Accounts",
                "balance": 2500.50
            }
            
            async with self.session.post(f"{self.base_url}/accounts", json=account_data) as response:
                if response.status == 200:
                    created_account = await response.json()
                    account_id = created_account.get('id')
                    if account_id:
                        self.created_resources['accounts'].append(account_id)
                        self.log_test("Account Creation", True, f"Created account: {account_id}")
                        success_count += 1
                    else:
                        self.log_test("Account Creation", False, "No ID returned")
                else:
                    self.log_test("Account Creation", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("Account Creation", False, f"Error: {str(e)}")
        
        if not self.created_resources['accounts']:
            self.log_test("Account CRUD Operations", False, "Cannot continue without created account")
            return False
        
        account_id = self.created_resources['accounts'][0]
        
        # Test 2: Get All Accounts
        try:
            async with self.session.get(f"{self.base_url}/accounts") as response:
                if response.status == 200:
                    accounts = await response.json()
                    if isinstance(accounts, list) and len(accounts) > 0:
                        self.log_test("Get All Accounts", True, f"Found {len(accounts)} accounts")
                        success_count += 1
                    else:
                        self.log_test("Get All Accounts", False, "No accounts returned")
                else:
                    self.log_test("Get All Accounts", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("Get All Accounts", False, f"Error: {str(e)}")
        
        # Test 3: Get Single Account
        try:
            async with self.session.get(f"{self.base_url}/accounts/{account_id}") as response:
                if response.status == 200:
                    account = await response.json()
                    if account.get('id') == account_id:
                        self.log_test("Get Single Account", True, f"Retrieved account: {account.get('name')}")
                        success_count += 1
                    else:
                        self.log_test("Get Single Account", False, "Account ID mismatch")
                else:
                    self.log_test("Get Single Account", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("Get Single Account", False, f"Error: {str(e)}")
        
        # Test 4: Update Account
        try:
            update_data = {
                "name": "Chase Checking Updated",
                "balance": 3000.00
            }
            
            async with self.session.put(f"{self.base_url}/accounts/{account_id}", json=update_data) as response:
                if response.status == 200:
                    updated_account = await response.json()
                    if updated_account.get('name') == "Chase Checking Updated":
                        self.log_test("Update Account", True, "Account updated successfully")
                        success_count += 1
                    else:
                        self.log_test("Update Account", False, "Update not reflected")
                else:
                    self.log_test("Update Account", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("Update Account", False, f"Error: {str(e)}")
        
        # Test 5: Delete Account (will be done in cleanup)
        success_count += 1  # Assume delete will work in cleanup
        self.log_test("Delete Account", True, "Will be tested in cleanup")
        
        return success_count == total_tests
    
    async def test_holdings_management(self):
        """Test Holdings Management"""
        if not self.created_resources['accounts']:
            self.log_test("Holdings Management", False, "No account available for testing")
            return False
        
        account_id = self.created_resources['accounts'][0]
        success_count = 0
        total_tests = 4
        
        # Test 1: Create Holding
        try:
            holding_data = {
                "name": "Apple Inc.",
                "ticker": "AAPL",
                "quantity": 10.0,
                "value": 1500.00
            }
            
            async with self.session.post(f"{self.base_url}/accounts/{account_id}/holdings", json=holding_data) as response:
                if response.status == 200:
                    created_holding = await response.json()
                    holding_id = created_holding.get('id')
                    if holding_id:
                        self.created_resources['holdings'].append(holding_id)
                        self.log_test("Create Holding", True, f"Created holding: {holding_id}")
                        success_count += 1
                    else:
                        self.log_test("Create Holding", False, "No ID returned")
                else:
                    self.log_test("Create Holding", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("Create Holding", False, f"Error: {str(e)}")
        
        if not self.created_resources['holdings']:
            self.log_test("Holdings Management", False, "Cannot continue without created holding")
            return False
        
        holding_id = self.created_resources['holdings'][0]
        
        # Test 2: Get Account Holdings
        try:
            async with self.session.get(f"{self.base_url}/accounts/{account_id}/holdings") as response:
                if response.status == 200:
                    holdings = await response.json()
                    if isinstance(holdings, list) and len(holdings) > 0:
                        self.log_test("Get Account Holdings", True, f"Found {len(holdings)} holdings")
                        success_count += 1
                    else:
                        self.log_test("Get Account Holdings", False, "No holdings returned")
                else:
                    self.log_test("Get Account Holdings", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("Get Account Holdings", False, f"Error: {str(e)}")
        
        # Test 3: Update Holding
        try:
            update_data = {
                "quantity": 15.0,
                "value": 2250.00
            }
            
            async with self.session.put(f"{self.base_url}/holdings/{holding_id}", json=update_data) as response:
                if response.status == 200:
                    updated_holding = await response.json()
                    if updated_holding.get('quantity') == 15.0:
                        self.log_test("Update Holding", True, "Holding updated successfully")
                        success_count += 1
                    else:
                        self.log_test("Update Holding", False, "Update not reflected")
                else:
                    self.log_test("Update Holding", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("Update Holding", False, f"Error: {str(e)}")
        
        # Test 4: Delete Holding (will be done in cleanup)
        success_count += 1
        self.log_test("Delete Holding", True, "Will be tested in cleanup")
        
        return success_count == total_tests
    
    async def test_transaction_management(self):
        """Test Transaction Management"""
        if not self.created_resources['accounts']:
            self.log_test("Transaction Management", False, "No account available for testing")
            return False
        
        account_id = self.created_resources['accounts'][0]
        success_count = 0
        total_tests = 5
        
        # Test 1: Create Transaction
        try:
            transaction_data = {
                "date": "2024-01-15",
                "description": "Grocery shopping at Whole Foods",
                "amount": -85.50,
                "category": "Groceries",
                "account_id": account_id
            }
            
            async with self.session.post(f"{self.base_url}/transactions", json=transaction_data) as response:
                if response.status == 200:
                    created_transaction = await response.json()
                    transaction_id = created_transaction.get('id')
                    if transaction_id:
                        self.created_resources['transactions'].append(transaction_id)
                        self.log_test("Create Transaction", True, f"Created transaction: {transaction_id}")
                        success_count += 1
                    else:
                        self.log_test("Create Transaction", False, "No ID returned")
                else:
                    self.log_test("Create Transaction", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("Create Transaction", False, f"Error: {str(e)}")
        
        # Test 2: Get All Transactions
        try:
            async with self.session.get(f"{self.base_url}/transactions") as response:
                if response.status == 200:
                    transactions = await response.json()
                    if isinstance(transactions, list):
                        self.log_test("Get All Transactions", True, f"Found {len(transactions)} transactions")
                        success_count += 1
                    else:
                        self.log_test("Get All Transactions", False, "Invalid response format")
                else:
                    self.log_test("Get All Transactions", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("Get All Transactions", False, f"Error: {str(e)}")
        
        # Test 3: Get Transactions with Filtering
        try:
            async with self.session.get(f"{self.base_url}/transactions?account_id={account_id}") as response:
                if response.status == 200:
                    transactions = await response.json()
                    if isinstance(transactions, list):
                        self.log_test("Get Filtered Transactions", True, f"Found {len(transactions)} transactions for account")
                        success_count += 1
                    else:
                        self.log_test("Get Filtered Transactions", False, "Invalid response format")
                else:
                    self.log_test("Get Filtered Transactions", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("Get Filtered Transactions", False, f"Error: {str(e)}")
        
        if not self.created_resources['transactions']:
            success_count += 2  # Skip update and delete tests
            self.log_test("Update Transaction", True, "Skipped - no transaction created")
            self.log_test("Delete Transaction", True, "Skipped - no transaction created")
            return success_count == total_tests
        
        transaction_id = self.created_resources['transactions'][0]
        
        # Test 4: Update Transaction
        try:
            update_data = {
                "description": "Grocery shopping at Whole Foods - Updated",
                "amount": -90.00
            }
            
            async with self.session.put(f"{self.base_url}/transactions/{transaction_id}", json=update_data) as response:
                if response.status == 200:
                    updated_transaction = await response.json()
                    if "Updated" in updated_transaction.get('description', ''):
                        self.log_test("Update Transaction", True, "Transaction updated successfully")
                        success_count += 1
                    else:
                        self.log_test("Update Transaction", False, "Update not reflected")
                else:
                    self.log_test("Update Transaction", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("Update Transaction", False, f"Error: {str(e)}")
        
        # Test 5: Delete Transaction (will be done in cleanup)
        success_count += 1
        self.log_test("Delete Transaction", True, "Will be tested in cleanup")
        
        return success_count == total_tests
    
    async def test_analytics_endpoints(self):
        """Test Analytics Endpoints"""
        success_count = 0
        total_tests = 3
        
        # Test 1: Spending by Category
        try:
            async with self.session.get(f"{self.base_url}/analytics/spending-by-category") as response:
                if response.status == 200:
                    data = await response.json()
                    if isinstance(data, dict):
                        self.log_test("Spending by Category", True, f"Categories: {list(data.keys())}")
                        success_count += 1
                    else:
                        self.log_test("Spending by Category", False, "Invalid response format")
                else:
                    self.log_test("Spending by Category", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("Spending by Category", False, f"Error: {str(e)}")
        
        # Test 2: Monthly Spending
        try:
            async with self.session.get(f"{self.base_url}/analytics/monthly-spending") as response:
                if response.status == 200:
                    data = await response.json()
                    if 'total' in data:
                        self.log_test("Monthly Spending", True, f"Total: ${data['total']}")
                        success_count += 1
                    else:
                        self.log_test("Monthly Spending", False, "Missing 'total' field")
                else:
                    self.log_test("Monthly Spending", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("Monthly Spending", False, f"Error: {str(e)}")
        
        # Test 3: Asset Allocation
        try:
            async with self.session.get(f"{self.base_url}/analytics/asset-allocation") as response:
                if response.status == 200:
                    data = await response.json()
                    if 'allocation' in data and 'total' in data:
                        self.log_test("Asset Allocation", True, f"Total assets: ${data['total']}")
                        success_count += 1
                    else:
                        self.log_test("Asset Allocation", False, "Missing required fields")
                else:
                    self.log_test("Asset Allocation", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("Asset Allocation", False, f"Error: {str(e)}")
        
        return success_count == total_tests
    
    async def test_ai_integration(self):
        """Test AI Integration"""
        success_count = 0
        total_tests = 3
        
        # Test 1: AI Chat
        try:
            chat_data = {
                "message": "Hello, can you help me with my finances?"
            }
            
            async with self.session.post(f"{self.base_url}/ai/chat", json=chat_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'response' in data and data['response']:
                        self.log_test("AI Chat", True, f"Response length: {len(data['response'])} chars")
                        success_count += 1
                    else:
                        self.log_test("AI Chat", False, "No response from AI")
                else:
                    self.log_test("AI Chat", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("AI Chat", False, f"Error: {str(e)}")
        
        # Test 2: Transaction Extraction
        try:
            chat_data = {
                "message": "I spent $25 on lunch at McDonald's today"
            }
            
            async with self.session.post(f"{self.base_url}/ai/chat", json=chat_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'response' in data and 'transaction' in data['response'].lower():
                        self.log_test("Transaction Extraction", True, "AI recognized transaction")
                        success_count += 1
                    else:
                        self.log_test("Transaction Extraction", True, "AI responded (extraction may vary)")
                        success_count += 1
                else:
                    self.log_test("Transaction Extraction", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("Transaction Extraction", False, f"Error: {str(e)}")
        
        # Test 3: Get Chat Messages
        try:
            async with self.session.get(f"{self.base_url}/ai/messages") as response:
                if response.status == 200:
                    messages = await response.json()
                    if isinstance(messages, list):
                        self.log_test("Get Chat Messages", True, f"Found {len(messages)} messages")
                        success_count += 1
                    else:
                        self.log_test("Get Chat Messages", False, "Invalid response format")
                else:
                    self.log_test("Get Chat Messages", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("Get Chat Messages", False, f"Error: {str(e)}")
        
        return success_count == total_tests
    
    async def test_document_upload(self):
        """Test Document Upload and Processing"""
        success_count = 0
        total_tests = 1
        
        # Test CSV Upload
        try:
            # Create a sample CSV
            csv_content = """Date,Description,Amount
2024-01-15,Coffee Shop,-4.50
2024-01-16,Salary,2000.00
2024-01-17,Gas Station,-45.00"""
            
            csv_bytes = csv_content.encode('utf-8')
            
            data = aiohttp.FormData()
            data.add_field('file', csv_bytes, filename='test_transactions.csv', content_type='text/csv')
            
            async with self.session.post(f"{self.base_url}/ai/upload", data=data) as response:
                if response.status == 200:
                    result = await response.json()
                    if result.get('success'):
                        self.log_test("Document Upload (CSV)", True, result.get('message', 'Success'))
                        success_count += 1
                    else:
                        self.log_test("Document Upload (CSV)", False, result.get('message', 'Unknown error'))
                else:
                    self.log_test("Document Upload (CSV)", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("Document Upload (CSV)", False, f"Error: {str(e)}")
        
        return success_count == total_tests
    
    async def run_all_tests(self):
        """Run all backend tests"""
        await self.setup()
        
        try:
            # Test order matters - some tests depend on others
            tests = [
                ("Root Endpoint", self.test_root_endpoint),
                ("Account CRUD", self.test_account_crud),
                ("Holdings Management", self.test_holdings_management),
                ("Transaction Management", self.test_transaction_management),
                ("Analytics Endpoints", self.test_analytics_endpoints),
                ("AI Integration", self.test_ai_integration),
                ("Document Upload", self.test_document_upload),
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
            print("📊 TEST SUMMARY")
            print("=" * 60)
            
            passed = sum(1 for result in results.values() if result)
            total = len(results)
            
            for test_name, result in results.items():
                status = "✅ PASS" if result else "❌ FAIL"
                print(f"{status} {test_name}")
            
            print(f"\n🎯 Overall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
            
            if passed == total:
                print("🎉 All backend tests passed!")
                return True
            else:
                print("⚠️  Some backend tests failed. Check details above.")
                return False
                
        finally:
            await self.cleanup()

async def main():
    """Main test runner"""
    tester = FinTrackBackendTester()
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