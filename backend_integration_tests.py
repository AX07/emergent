#!/usr/bin/env python3
"""
Comprehensive Integration Testing for FinTrack AI Backend
Tests real-world scenarios and data flow
"""

import asyncio
import aiohttp
import json
import sys

BACKEND_URL = "https://73dec375-74fa-435b-b04c-652d66b377bf.preview.emergentagent.com/api"

class IntegrationTester:
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
        print(f"🔄 Starting Integration Tests")
        print(f"📡 Backend URL: {self.base_url}")
        print("=" * 60)
    
    async def cleanup(self):
        """Cleanup test session and resources"""
        try:
            # Clean up created resources in reverse order
            for transaction_id in self.created_resources['transactions']:
                try:
                    await self.session.delete(f"{self.base_url}/transactions/{transaction_id}")
                except:
                    pass
            
            for holding_id in self.created_resources['holdings']:
                try:
                    await self.session.delete(f"{self.base_url}/holdings/{holding_id}")
                except:
                    pass
            
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
    
    async def test_complete_user_workflow(self):
        """Test a complete user workflow from account creation to analytics"""
        success_count = 0
        total_tests = 8
        
        # Step 1: Create multiple accounts with different categories
        accounts_data = [
            {"name": "Wells Fargo Checking", "institution": "Wells Fargo", "category": "Bank Accounts", "balance": 5000.00},
            {"name": "Fidelity 401k", "institution": "Fidelity", "category": "Equities", "balance": 25000.00},
            {"name": "Coinbase Wallet", "institution": "Coinbase", "category": "Crypto", "balance": 3000.00}
        ]
        
        created_accounts = []
        for account_data in accounts_data:
            try:
                async with self.session.post(f"{self.base_url}/accounts", json=account_data) as response:
                    if response.status == 200:
                        account = await response.json()
                        created_accounts.append(account)
                        self.created_resources['accounts'].append(account['id'])
            except Exception as e:
                pass
        
        if len(created_accounts) == 3:
            self.log_test("Multiple Account Creation", True, f"Created {len(created_accounts)} accounts")
            success_count += 1
        else:
            self.log_test("Multiple Account Creation", False, f"Only created {len(created_accounts)} accounts")
        
        if not created_accounts:
            return False
        
        # Step 2: Add holdings to investment account
        investment_account = next((acc for acc in created_accounts if acc['category'] == 'Equities'), None)
        if investment_account:
            holdings_data = [
                {"name": "Apple Inc.", "ticker": "AAPL", "quantity": 50.0, "value": 7500.00},
                {"name": "Microsoft Corp.", "ticker": "MSFT", "quantity": 25.0, "value": 8750.00},
                {"name": "Tesla Inc.", "ticker": "TSLA", "quantity": 10.0, "value": 2000.00}
            ]
            
            created_holdings = []
            for holding_data in holdings_data:
                try:
                    async with self.session.post(f"{self.base_url}/accounts/{investment_account['id']}/holdings", json=holding_data) as response:
                        if response.status == 200:
                            holding = await response.json()
                            created_holdings.append(holding)
                            self.created_resources['holdings'].append(holding['id'])
                except Exception as e:
                    pass
            
            if len(created_holdings) == 3:
                self.log_test("Investment Holdings Creation", True, f"Added {len(created_holdings)} holdings")
                success_count += 1
            else:
                self.log_test("Investment Holdings Creation", False, f"Only added {len(created_holdings)} holdings")
        else:
            self.log_test("Investment Holdings Creation", False, "No investment account found")
        
        # Step 3: Create diverse transactions
        bank_account = next((acc for acc in created_accounts if acc['category'] == 'Bank Accounts'), None)
        if bank_account:
            transactions_data = [
                {"date": "2024-01-15", "description": "Salary Deposit", "amount": 5000.00, "category": "Income", "account_id": bank_account['id']},
                {"date": "2024-01-16", "description": "Grocery Store", "amount": -125.50, "category": "Groceries", "account_id": bank_account['id']},
                {"date": "2024-01-17", "description": "Gas Station", "amount": -65.00, "category": "Transportation", "account_id": bank_account['id']},
                {"date": "2024-01-18", "description": "Restaurant Dinner", "amount": -85.75, "category": "Food & Dining", "account_id": bank_account['id']},
                {"date": "2024-01-19", "description": "Electric Bill", "amount": -120.00, "category": "Utilities", "account_id": bank_account['id']}
            ]
            
            created_transactions = []
            for transaction_data in transactions_data:
                try:
                    async with self.session.post(f"{self.base_url}/transactions", json=transaction_data) as response:
                        if response.status == 200:
                            transaction = await response.json()
                            created_transactions.append(transaction)
                            self.created_resources['transactions'].append(transaction['id'])
                except Exception as e:
                    pass
            
            if len(created_transactions) == 5:
                self.log_test("Diverse Transactions Creation", True, f"Created {len(created_transactions)} transactions")
                success_count += 1
            else:
                self.log_test("Diverse Transactions Creation", False, f"Only created {len(created_transactions)} transactions")
        else:
            self.log_test("Diverse Transactions Creation", False, "No bank account found")
        
        # Step 4: Test AI transaction extraction
        try:
            ai_messages = [
                "I bought coffee for $4.50 this morning",
                "Paid $1200 rent today",
                "Got my paycheck of $3000"
            ]
            
            ai_responses = []
            for message in ai_messages:
                try:
                    async with self.session.post(f"{self.base_url}/ai/chat", json={"message": message}) as response:
                        if response.status == 200:
                            data = await response.json()
                            ai_responses.append(data)
                except:
                    pass
            
            if len(ai_responses) == 3:
                self.log_test("AI Transaction Processing", True, f"Processed {len(ai_responses)} AI messages")
                success_count += 1
            else:
                self.log_test("AI Transaction Processing", False, f"Only processed {len(ai_responses)} messages")
        except Exception as e:
            self.log_test("AI Transaction Processing", False, f"Error: {str(e)}")
        
        # Step 5: Test analytics with real data
        try:
            async with self.session.get(f"{self.base_url}/analytics/spending-by-category") as response:
                if response.status == 200:
                    data = await response.json()
                    if isinstance(data, dict) and len(data) > 0:
                        self.log_test("Analytics - Spending by Category", True, f"Found {len(data)} categories")
                        success_count += 1
                    else:
                        self.log_test("Analytics - Spending by Category", False, "No spending data found")
                else:
                    self.log_test("Analytics - Spending by Category", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("Analytics - Spending by Category", False, f"Error: {str(e)}")
        
        # Step 6: Test monthly spending calculation
        try:
            async with self.session.get(f"{self.base_url}/analytics/monthly-spending") as response:
                if response.status == 200:
                    data = await response.json()
                    if 'total' in data and data['total'] >= 0:
                        self.log_test("Analytics - Monthly Spending", True, f"Monthly total: ${data['total']}")
                        success_count += 1
                    else:
                        self.log_test("Analytics - Monthly Spending", False, "Invalid monthly spending data")
                else:
                    self.log_test("Analytics - Monthly Spending", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("Analytics - Monthly Spending", False, f"Error: {str(e)}")
        
        # Step 7: Test asset allocation
        try:
            async with self.session.get(f"{self.base_url}/analytics/asset-allocation") as response:
                if response.status == 200:
                    data = await response.json()
                    if 'allocation' in data and 'total' in data:
                        self.log_test("Analytics - Asset Allocation", True, f"Total assets: ${data['total']}")
                        success_count += 1
                    else:
                        self.log_test("Analytics - Asset Allocation", False, "Invalid asset allocation data")
                else:
                    self.log_test("Analytics - Asset Allocation", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("Analytics - Asset Allocation", False, f"Error: {str(e)}")
        
        # Step 8: Test data consistency
        try:
            # Get all accounts and verify they exist
            async with self.session.get(f"{self.base_url}/accounts") as response:
                if response.status == 200:
                    accounts = await response.json()
                    if len(accounts) >= len(created_accounts):
                        self.log_test("Data Consistency Check", True, f"All {len(accounts)} accounts accessible")
                        success_count += 1
                    else:
                        self.log_test("Data Consistency Check", False, "Account count mismatch")
                else:
                    self.log_test("Data Consistency Check", False, f"Status: {response.status}")
        except Exception as e:
            self.log_test("Data Consistency Check", False, f"Error: {str(e)}")
        
        return success_count == total_tests
    
    async def run_all_tests(self):
        """Run all integration tests"""
        await self.setup()
        
        try:
            tests = [
                ("Complete User Workflow", self.test_complete_user_workflow),
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
            print("📊 INTEGRATION TEST SUMMARY")
            print("=" * 60)
            
            passed = sum(1 for result in results.values() if result)
            total = len(results)
            
            for test_name, result in results.items():
                status = "✅ PASS" if result else "❌ FAIL"
                print(f"{status} {test_name}")
            
            print(f"\n🎯 Overall: {passed}/{total} integration tests passed ({passed/total*100:.1f}%)")
            
            if passed == total:
                print("🎉 All integration tests passed!")
                return True
            else:
                print("⚠️  Some integration tests failed. Check details above.")
                return False
                
        finally:
            await self.cleanup()

async def main():
    """Main test runner"""
    tester = IntegrationTester()
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