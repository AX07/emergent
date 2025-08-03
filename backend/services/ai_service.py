import google.generativeai as genai
import os
import re
import json
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        api_key = os.environ.get('GOOGLE_GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GOOGLE_GEMINI_API_KEY environment variable is required")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
    async def process_chat_message(self, message: str, context: Optional[Dict] = None) -> str:
        """Process a chat message with financial context."""
        system_prompt = """You are FinTrack AI, a personal finance assistant. You help users:
        1. Track expenses and income with natural language
        2. Analyze spending patterns and budgets
        3. Manage investment portfolios and accounts
        4. Provide financial insights and recommendations

        When users mention spending money or making purchases, extract:
        - Amount (with currency)
        - Description/merchant
        - Category (Food & Dining, Transportation, Utilities, Entertainment, etc.)
        - Date (if mentioned, otherwise assume today)

        For financial questions, provide helpful, practical advice.
        Keep responses conversational but informative.
        """
        
        try:
            full_prompt = f"{system_prompt}\n\nUser: {message}\n\nAssistant:"
            response = self.model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            return "I apologize, but I'm having trouble processing your request right now. Please try again."

    def extract_transaction_from_text(self, text: str) -> Optional[Dict]:
        """Extract transaction details from natural language text."""
        try:
            # Use AI to extract structured data
            extraction_prompt = f"""
            Extract transaction information from this text: "{text}"
            
            Return a JSON object with these fields (use null if not found):
            {{
                "amount": number (negative for expenses, positive for income),
                "description": "string",
                "category": "string (Food & Dining, Transportation, Utilities, Entertainment, Groceries, Shopping, Income, etc.)",
                "date": "YYYY-MM-DD" (today if not specified)
            }}
            
            Examples:
            "I spent $25 on lunch" -> {{"amount": -25, "description": "lunch", "category": "Food & Dining", "date": "{datetime.now().strftime('%Y-%m-%d')}"}}
            "Got paid $2000" -> {{"amount": 2000, "description": "salary", "category": "Income", "date": "{datetime.now().strftime('%Y-%m-%d')}"}}
            
            Only return valid JSON, no other text.
            """
            
            response = self.model.generate_content(extraction_prompt)
            result_text = response.text.strip()
            
            # Clean up the response to extract JSON
            json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
            if json_match:
                json_text = json_match.group()
                transaction_data = json.loads(json_text)
                
                # Validate required fields
                if transaction_data.get('amount') is not None and transaction_data.get('description'):
                    return transaction_data
                    
        except Exception as e:
            logger.error(f"Error extracting transaction: {str(e)}")
            
        return None

    def analyze_spending_pattern(self, transactions: List[Dict]) -> str:
        """Analyze spending patterns and provide insights."""
        try:
            # Prepare transaction summary
            total_spent = sum(abs(t['amount']) for t in transactions if t['amount'] < 0)
            total_income = sum(t['amount'] for t in transactions if t['amount'] > 0)
            categories = {}
            
            for t in transactions:
                if t['amount'] < 0:
                    cat = t.get('category', 'Other')
                    categories[cat] = categories.get(cat, 0) + abs(t['amount'])
            
            analysis_prompt = f"""
            Analyze this spending data and provide insights:
            
            Total Spending: ${total_spent:.2f}
            Total Income: ${total_income:.2f}
            
            Spending by Category:
            {json.dumps(categories, indent=2)}
            
            Provide:
            1. Key insights about spending habits
            2. Areas for potential savings
            3. Budget recommendations
            4. Any concerning patterns
            
            Keep the response concise and actionable.
            """
            
            response = self.model.generate_content(analysis_prompt)
            return response.text
            
        except Exception as e:
            logger.error(f"Error analyzing spending: {str(e)}")
            return "I couldn't analyze your spending patterns right now. Please try again later."

    def process_document(self, file_content: bytes, file_type: str, filename: str) -> Dict:
        """Process uploaded documents (CSV, PDF, images) to extract financial data."""
        try:
            if file_type == 'text/csv':
                return self._process_csv(file_content, filename)
            elif file_type == 'application/pdf':
                return self._process_pdf(file_content, filename)
            elif file_type.startswith('image/'):
                return self._process_image(file_content, filename)
            else:
                return {
                    'success': False,
                    'message': f'Unsupported file type: {file_type}',
                    'transactions': []
                }
        except Exception as e:
            logger.error(f"Error processing document: {str(e)}")
            return {
                'success': False,
                'message': f'Error processing {filename}: {str(e)}',
                'transactions': []
            }

    def _process_csv(self, file_content: bytes, filename: str) -> Dict:
        """Process CSV files for transaction data."""
        import csv
        import io
        
        try:
            csv_text = file_content.decode('utf-8')
            csv_reader = csv.DictReader(io.StringIO(csv_text))
            
            transactions = []
            for row in csv_reader:
                # Try to map common CSV formats
                amount = None
                description = None
                date = None
                
                # Common column mappings
                for key, value in row.items():
                    key_lower = key.lower().strip()
                    if 'amount' in key_lower or 'value' in key_lower:
                        try:
                            amount = float(value.replace('$', '').replace(',', ''))
                        except:
                            pass
                    elif 'description' in key_lower or 'memo' in key_lower or 'merchant' in key_lower:
                        description = value.strip()
                    elif 'date' in key_lower:
                        date = value.strip()
                
                if amount is not None and description:
                    transactions.append({
                        'amount': amount,
                        'description': description,
                        'date': date or datetime.now().strftime('%Y-%m-%d'),
                        'category': 'Uncategorized'
                    })
            
            return {
                'success': True,
                'message': f'Successfully processed {len(transactions)} transactions from {filename}',
                'transactions': transactions
            }
            
        except Exception as e:
            return {
                'success': False,
                'message': f'Error parsing CSV: {str(e)}',
                'transactions': []
            }

    def _process_pdf(self, file_content: bytes, filename: str) -> Dict:
        """Process PDF files (bank statements, receipts)."""
        # For now, return a mock response
        # In production, you'd use pdf-parse or similar library
        return {
            'success': True,
            'message': f'PDF processing for {filename} completed. This feature is coming soon.',
            'transactions': []
        }

    def _process_image(self, file_content: bytes, filename: str) -> Dict:
        """Process images (receipts, statements) using OCR."""
        # For now, return a mock response
        # In production, you'd use Tesseract.js or Google Vision API
        return {
            'success': True,
            'message': f'Image processing for {filename} completed. This feature is coming soon.',
            'transactions': []
        }