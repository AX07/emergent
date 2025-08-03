from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
from datetime import datetime, date
from typing import List, Optional, Dict, Any
import json

# Import models
from models.account import Account, AccountCreate, AccountUpdate
from models.holding import Holding, HoldingCreate, HoldingUpdate
from models.transaction import Transaction, TransactionCreate, TransactionUpdate

# Import services
from services.ai_service import AIService

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize AI service
ai_service = AIService()

# Create the main app without a prefix
app = FastAPI(title="FinTrack AI Backend", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Helper functions
def serialize_doc(doc):
    """Convert MongoDB document to JSON serializable format."""
    if doc is None:
        return None
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])
    return doc

async def get_account_by_id(account_id: str):
    """Get account by ID or raise 404."""
    account = await db.accounts.find_one({"id": account_id})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return serialize_doc(account)

# ============ ACCOUNT ENDPOINTS ============

@api_router.get("/accounts", response_model=List[Dict[str, Any]])
async def get_accounts():
    """Get all accounts."""
    try:
        accounts = await db.accounts.find({}).to_list(1000)
        return [serialize_doc(account) for account in accounts]
    except Exception as e:
        logger.error(f"Error fetching accounts: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch accounts")

@api_router.post("/accounts", response_model=Dict[str, Any])
async def create_account(account_data: AccountCreate):
    """Create a new account."""
    try:
        account = Account(**account_data.dict())
        result = await db.accounts.insert_one(account.dict())
        
        created_account = await db.accounts.find_one({"_id": result.inserted_id})
        return serialize_doc(created_account)
    except Exception as e:
        logger.error(f"Error creating account: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create account")

@api_router.get("/accounts/{account_id}", response_model=Dict[str, Any])
async def get_account(account_id: str):
    """Get account by ID."""
    return await get_account_by_id(account_id)

@api_router.put("/accounts/{account_id}", response_model=Dict[str, Any])
async def update_account(account_id: str, account_data: AccountUpdate):
    """Update an account."""
    try:
        await get_account_by_id(account_id)  # Check if exists
        
        update_data = {k: v for k, v in account_data.dict().items() if v is not None}
        update_data['updated_at'] = datetime.utcnow()
        
        await db.accounts.update_one(
            {"id": account_id},
            {"$set": update_data}
        )
        
        updated_account = await db.accounts.find_one({"id": account_id})
        return serialize_doc(updated_account)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating account: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update account")

@api_router.delete("/accounts/{account_id}")
async def delete_account(account_id: str):
    """Delete an account and its holdings."""
    try:
        await get_account_by_id(account_id)  # Check if exists
        
        # Delete associated holdings
        await db.holdings.delete_many({"account_id": account_id})
        
        # Delete account
        await db.accounts.delete_one({"id": account_id})
        
        return {"message": "Account deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting account: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete account")

# ============ HOLDING ENDPOINTS ============

@api_router.get("/accounts/{account_id}/holdings", response_model=List[Dict[str, Any]])
async def get_account_holdings(account_id: str):
    """Get holdings for a specific account."""
    try:
        await get_account_by_id(account_id)  # Check if account exists
        
        holdings = await db.holdings.find({"account_id": account_id}).to_list(1000)
        return [serialize_doc(holding) for holding in holdings]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching holdings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch holdings")

@api_router.post("/accounts/{account_id}/holdings", response_model=Dict[str, Any])
async def create_holding(account_id: str, holding_data: HoldingCreate):
    """Add a holding to an account."""
    try:
        await get_account_by_id(account_id)  # Check if account exists
        
        holding = Holding(account_id=account_id, **holding_data.dict())
        result = await db.holdings.insert_one(holding.dict())
        
        created_holding = await db.holdings.find_one({"_id": result.inserted_id})
        return serialize_doc(created_holding)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating holding: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create holding")

@api_router.put("/holdings/{holding_id}", response_model=Dict[str, Any])
async def update_holding(holding_id: str, holding_data: HoldingUpdate):
    """Update a holding."""
    try:
        holding = await db.holdings.find_one({"id": holding_id})
        if not holding:
            raise HTTPException(status_code=404, detail="Holding not found")
        
        update_data = {k: v for k, v in holding_data.dict().items() if v is not None}
        update_data['updated_at'] = datetime.utcnow()
        
        await db.holdings.update_one(
            {"id": holding_id},
            {"$set": update_data}
        )
        
        updated_holding = await db.holdings.find_one({"id": holding_id})
        return serialize_doc(updated_holding)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating holding: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update holding")

@api_router.delete("/holdings/{holding_id}")
async def delete_holding(holding_id: str):
    """Delete a holding."""
    try:
        holding = await db.holdings.find_one({"id": holding_id})
        if not holding:
            raise HTTPException(status_code=404, detail="Holding not found")
        
        await db.holdings.delete_one({"id": holding_id})
        return {"message": "Holding deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting holding: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete holding")

# ============ TRANSACTION ENDPOINTS ============

@api_router.get("/transactions", response_model=List[Dict[str, Any]])
async def get_transactions(skip: int = 0, limit: int = 100, account_id: Optional[str] = None):
    """Get transactions with optional filtering."""
    try:
        query = {}
        if account_id:
            query["account_id"] = account_id
        
        transactions = await db.transactions.find(query).sort("date", -1).skip(skip).limit(limit).to_list(limit)
        return [serialize_doc(transaction) for transaction in transactions]
    except Exception as e:
        logger.error(f"Error fetching transactions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch transactions")

@api_router.post("/transactions", response_model=Dict[str, Any])
async def create_transaction(transaction_data: TransactionCreate):
    """Create a new transaction."""
    try:
        # Verify account exists
        await get_account_by_id(transaction_data.account_id)
        
        transaction = Transaction(**transaction_data.dict())
        result = await db.transactions.insert_one(transaction.dict())
        
        created_transaction = await db.transactions.find_one({"_id": result.inserted_id})
        return serialize_doc(created_transaction)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating transaction: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create transaction")

@api_router.put("/transactions/{transaction_id}", response_model=Dict[str, Any])
async def update_transaction(transaction_id: str, transaction_data: TransactionUpdate):
    """Update a transaction."""
    try:
        transaction = await db.transactions.find_one({"id": transaction_id})
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        update_data = {k: v for k, v in transaction_data.dict().items() if v is not None}
        update_data['updated_at'] = datetime.utcnow()
        
        await db.transactions.update_one(
            {"id": transaction_id},
            {"$set": update_data}
        )
        
        updated_transaction = await db.transactions.find_one({"id": transaction_id})
        return serialize_doc(updated_transaction)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating transaction: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update transaction")

@api_router.delete("/transactions/{transaction_id}")
async def delete_transaction(transaction_id: str):
    """Delete a transaction."""
    try:
        transaction = await db.transactions.find_one({"id": transaction_id})
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        await db.transactions.delete_one({"id": transaction_id})
        return {"message": "Transaction deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting transaction: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete transaction")

# ============ ANALYTICS ENDPOINTS ============

@api_router.get("/analytics/spending-by-category")
async def get_spending_by_category():
    """Get spending breakdown by category."""
    try:
        pipeline = [
            {"$match": {"amount": {"$lt": 0}}},
            {"$group": {
                "_id": "$category",
                "total": {"$sum": {"$abs": "$amount"}},
                "count": {"$sum": 1}
            }},
            {"$sort": {"total": -1}}
        ]
        
        result = await db.transactions.aggregate(pipeline).to_list(100)
        return {category['_id']: {"total": category['total'], "count": category['count']} 
                for category in result}
    except Exception as e:
        logger.error(f"Error getting spending by category: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get spending data")

@api_router.get("/analytics/monthly-spending")
async def get_monthly_spending():
    """Get current month spending total."""
    try:
        current_date = datetime.now()
        start_of_month = datetime(current_date.year, current_date.month, 1)
        
        pipeline = [
            {"$match": {
                "amount": {"$lt": 0},
                "date": {"$gte": start_of_month.strftime('%Y-%m-%d')}
            }},
            {"$group": {
                "_id": None,
                "total": {"$sum": {"$abs": "$amount"}}
            }}
        ]
        
        result = await db.transactions.aggregate(pipeline).to_list(1)
        return {"total": result[0]['total'] if result else 0}
    except Exception as e:
        logger.error(f"Error getting monthly spending: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get monthly spending")

@api_router.get("/analytics/asset-allocation")
async def get_asset_allocation():
    """Get asset allocation by category."""
    try:
        pipeline = [
            {"$group": {
                "_id": "$category",
                "value": {"$sum": "$balance"}
            }},
            {"$sort": {"value": -1}}
        ]
        
        result = await db.accounts.aggregate(pipeline).to_list(100)
        total = sum(item['value'] for item in result)
        
        return {
            "allocation": [{"name": item['_id'], "value": item['value']} for item in result],
            "total": total
        }
    except Exception as e:
        logger.error(f"Error getting asset allocation: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get asset allocation")

# ============ AI ASSISTANT ENDPOINTS ============

@api_router.post("/ai/chat")
async def chat_with_ai(data: Dict[str, Any]):
    """Send message to AI assistant."""
    try:
        message = data.get('message', '')
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        # Check if message contains transaction data
        transaction_data = ai_service.extract_transaction_from_text(message)
        
        if transaction_data:
            # Get the first account for now (in production, let user choose or use default)
            accounts = await db.accounts.find({}).limit(1).to_list(1)
            if accounts:
                account_id = accounts[0]['id']
                
                # Create transaction
                transaction = Transaction(
                    account_id=account_id,
                    **transaction_data
                )
                await db.transactions.insert_one(transaction.dict())
                
                response = f"I've recorded your transaction: {transaction_data['description']} for {transaction_data['amount']}. It's been categorized as {transaction_data['category']}."
            else:
                response = "I understand you want to record a transaction, but you don't have any accounts set up yet. Please create an account first."
        else:
            # Regular chat response
            response = await ai_service.process_chat_message(message)
        
        # Save chat messages
        user_message = {
            "id": f"user_{datetime.now().timestamp()}",
            "role": "user",
            "content": message,
            "timestamp": datetime.utcnow()
        }
        
        ai_message = {
            "id": f"ai_{datetime.now().timestamp()}",
            "role": "ai", 
            "content": response,
            "timestamp": datetime.utcnow()
        }
        
        await db.chat_messages.insert_many([user_message, ai_message])
        
        return {"response": response}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in AI chat: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process chat message")

@api_router.get("/ai/messages")
async def get_chat_messages(limit: int = 50):
    """Get chat history."""
    try:
        messages = await db.chat_messages.find({}).sort("timestamp", 1).limit(limit).to_list(limit)
        return [serialize_doc(message) for message in messages]
    except Exception as e:
        logger.error(f"Error fetching chat messages: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch chat messages")

@api_router.post("/ai/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload and process document."""
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file uploaded")
        
        file_content = await file.read()
        result = ai_service.process_document(file_content, file.content_type, file.filename)
        
        # If transactions were extracted, save them
        if result.get('success') and result.get('transactions'):
            # Get the first account for now
            accounts = await db.accounts.find({}).limit(1).to_list(1)
            if accounts:
                account_id = accounts[0]['id']
                
                transactions_to_insert = []
                for trans_data in result['transactions']:
                    transaction = Transaction(
                        account_id=account_id,
                        **trans_data
                    )
                    transactions_to_insert.append(transaction.dict())
                
                if transactions_to_insert:
                    await db.transactions.insert_many(transactions_to_insert)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process uploaded document")

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "FinTrack AI Backend API", "version": "1.0.0"}

# Include the router in the main app
app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()