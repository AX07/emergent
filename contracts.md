# FinTrack AI - Backend Integration Contracts

## API Contracts

### Base URL
- All API endpoints will be prefixed with `/api`
- Frontend will use `REACT_APP_BACKEND_URL` environment variable

### Authentication
- Initially: No authentication (single-user app)
- Future: JWT-based authentication

## Data Models

### Account Model
```javascript
{
  id: String (ObjectId),
  name: String,
  institution: String (optional),
  category: String, // 'Bank Accounts', 'Equities', 'Crypto', 'Real Estate'
  balance: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Holding Model (for accounts with investments)
```javascript
{
  id: String (ObjectId),
  accountId: String (ObjectId reference),
  name: String,
  ticker: String (optional),
  quantity: Number,
  value: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Model
```javascript
{
  id: String (ObjectId),
  date: Date,
  description: String,
  amount: Number, // negative for expenses, positive for income
  category: String,
  accountId: String (ObjectId reference),
  createdAt: Date,
  updatedAt: Date
}
```

### ChatMessage Model
```javascript
{
  id: String (ObjectId),
  role: String, // 'user' or 'ai'
  content: String,
  timestamp: Date,
  metadata: Object (optional) // for storing file info, parsing results, etc.
}
```

## API Endpoints

### Accounts
- `GET /api/accounts` - Get all accounts
- `POST /api/accounts` - Create new account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account
- `GET /api/accounts/:id` - Get account by ID

### Holdings
- `GET /api/accounts/:accountId/holdings` - Get holdings for account
- `POST /api/accounts/:accountId/holdings` - Add holding to account
- `PUT /api/holdings/:id` - Update holding
- `DELETE /api/holdings/:id` - Delete holding

### Transactions
- `GET /api/transactions` - Get all transactions (with pagination)
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/by-account/:accountId` - Get transactions for specific account

### Analytics
- `GET /api/analytics/spending-by-category` - Get spending breakdown by category
- `GET /api/analytics/monthly-spending` - Get current month spending
- `GET /api/analytics/asset-allocation` - Get asset allocation data
- `GET /api/analytics/portfolio-history` - Get portfolio value over time

### AI Assistant
- `POST /api/ai/chat` - Send message to AI assistant
- `GET /api/ai/messages` - Get chat history
- `POST /api/ai/upload` - Upload and process document (CSV, PDF, images)
- `DELETE /api/ai/messages` - Clear chat history

## Mock Data Replacement Plan

### Current Mock Data (to be replaced):

1. **mockAccounts** in mock.js → `/api/accounts` endpoint
2. **mockTransactions** in mock.js → `/api/transactions` endpoint  
3. **mockPortfolioData** in mock.js → `/api/analytics/portfolio-history` endpoint
4. **mockChatMessages** in mock.js → `/api/ai/messages` endpoint

### Helper Functions (to be replaced):
- `getAccountsByCategory()` → Frontend will group accounts from API
- `getTotalAssets()` → `/api/analytics/asset-allocation` will include total
- `getSpendingByCategory()` → `/api/analytics/spending-by-category`
- `getMonthlySpending()` → `/api/analytics/monthly-spending`
- `getRecentTransactions()` → `/api/transactions?limit=5&sort=date:desc`
- `getAssetAllocation()` → `/api/analytics/asset-allocation`

## Frontend Integration Changes

### 1. API Service Layer
Create `/frontend/src/services/api.js` with:
- Axios instance configured with base URL
- All API call functions
- Error handling utilities

### 2. Data Fetching Hooks
Create custom hooks for:
- `useAccounts()` - Fetch and manage accounts
- `useTransactions()` - Fetch and manage transactions
- `useAnalytics()` - Fetch dashboard analytics
- `useAIChat()` - Manage AI chat state

### 3. Page-by-Page Integration:

#### Dashboard.jsx
- Replace mock data calls with API hooks
- Add loading states and error handling
- Keep same UI components

#### Spending.jsx
- Replace spending calculations with API calls
- Update transaction editing to call API
- Add success/error notifications

#### Assets.jsx
- Replace account data with API calls
- Update account editing to call API
- Maintain account detail navigation

#### AccountDetail.jsx
- Fetch account and holdings from API
- Update holdings management to call API
- Add proper loading states

#### AIAgent.jsx
- Replace mock chat with real API calls
- Integrate file upload with backend processing
- Add Google Gemini AI responses

## Google Gemini Integration

### Configuration
- Store API key in backend `.env` file
- Use Google AI SDK for chat completions
- Implement prompt engineering for financial context

### Features to Implement
1. **Natural Language Transaction Processing**
   - Parse user input like "I spent $25 on lunch"
   - Extract amount, description, category
   - Create transaction via API

2. **Document Analysis**
   - CSV parsing for transaction imports
   - PDF statement processing
   - Receipt OCR and data extraction

3. **Financial Insights**
   - Spending analysis and recommendations
   - Portfolio performance insights
   - Budget optimization suggestions

## Document Processing

### Libraries to Use
- **CSV**: Built-in Node.js CSV parsing
- **PDF**: pdf-parse library
- **Images**: Tesseract.js for OCR + Google Vision API (optional)

### Upload Flow
1. Frontend uploads file to `/api/ai/upload`
2. Backend processes file based on type
3. Extract relevant financial data
4. Create transactions/accounts as needed
5. Return processing summary to frontend

## Error Handling Strategy

### Backend
- Structured error responses with codes
- Logging for debugging
- Input validation on all endpoints

### Frontend
- Global error boundary
- Toast notifications for user feedback
- Loading states for better UX
- Retry mechanisms for failed requests

## Testing Strategy

### Backend Testing
- Unit tests for core business logic
- Integration tests for API endpoints
- Mock external services (Gemini API)

### Frontend Testing
- Component testing with React Testing Library
- API integration testing
- E2E testing with user workflows

This contract serves as the blueprint for seamless backend integration while maintaining the existing frontend functionality and user experience.