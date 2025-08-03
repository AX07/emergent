#!/usr/bin/env python3
"""
Test Pydantic Models and Validation
"""

import sys
import os
sys.path.append('/app/backend')

from models.account import Account, AccountCreate, AccountUpdate
from models.holding import Holding, HoldingCreate, HoldingUpdate  
from models.transaction import Transaction, TransactionCreate, TransactionUpdate
from datetime import datetime
import json

def test_pydantic_models():
    """Test Pydantic model validation and serialization"""
    print("🧪 Testing Pydantic Models and Validation")
    print("=" * 50)
    
    success_count = 0
    total_tests = 9
    
    # Test Account Models
    try:
        # Test AccountCreate
        account_create = AccountCreate(
            name="Test Account",
            institution="Test Bank",
            category="Bank Accounts",
            balance=1000.0
        )
        print("✅ AccountCreate validation passed")
        success_count += 1
        
        # Test Account with auto-generated fields
        account = Account(
            name="Test Account",
            institution="Test Bank", 
            category="Bank Accounts",
            balance=1000.0
        )
        
        # Test serialization
        account_dict = account.dict()
        account_json = json.dumps(account_dict, default=str)
        print("✅ Account serialization passed")
        success_count += 1
        
        # Test AccountUpdate
        account_update = AccountUpdate(name="Updated Account")
        print("✅ AccountUpdate validation passed")
        success_count += 1
        
    except Exception as e:
        print(f"❌ Account model test failed: {str(e)}")
    
    # Test Holding Models
    try:
        # Test HoldingCreate
        holding_create = HoldingCreate(
            name="Apple Inc.",
            ticker="AAPL",
            quantity=10.0,
            value=1500.0
        )
        print("✅ HoldingCreate validation passed")
        success_count += 1
        
        # Test Holding
        holding = Holding(
            account_id="test-account-id",
            name="Apple Inc.",
            ticker="AAPL",
            quantity=10.0,
            value=1500.0
        )
        
        # Test serialization
        holding_dict = holding.dict()
        holding_json = json.dumps(holding_dict, default=str)
        print("✅ Holding serialization passed")
        success_count += 1
        
        # Test HoldingUpdate
        holding_update = HoldingUpdate(quantity=15.0)
        print("✅ HoldingUpdate validation passed")
        success_count += 1
        
    except Exception as e:
        print(f"❌ Holding model test failed: {str(e)}")
    
    # Test Transaction Models
    try:
        # Test TransactionCreate
        transaction_create = TransactionCreate(
            date="2024-01-15",
            description="Test transaction",
            amount=-50.0,
            category="Food & Dining",
            account_id="test-account-id"
        )
        print("✅ TransactionCreate validation passed")
        success_count += 1
        
        # Test Transaction
        transaction = Transaction(
            date="2024-01-15",
            description="Test transaction",
            amount=-50.0,
            category="Food & Dining",
            account_id="test-account-id"
        )
        
        # Test serialization
        transaction_dict = transaction.dict()
        transaction_json = json.dumps(transaction_dict, default=str)
        print("✅ Transaction serialization passed")
        success_count += 1
        
        # Test TransactionUpdate
        transaction_update = TransactionUpdate(amount=-75.0)
        print("✅ TransactionUpdate validation passed")
        success_count += 1
        
    except Exception as e:
        print(f"❌ Transaction model test failed: {str(e)}")
    
    print(f"\n🎯 Model Tests: {success_count}/{total_tests} passed ({success_count/total_tests*100:.1f}%)")
    return success_count == total_tests

if __name__ == "__main__":
    success = test_pydantic_models()
    sys.exit(0 if success else 1)