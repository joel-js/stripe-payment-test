# Claude Code Project Prompt

## Project Overview
Create a full-stack web application to test Stripe payment method integration. This is a sample environment to prototype adding credit cards to user accounts without processing actual transactions. The app will demonstrate saving payment methods for future use using Stripe's Setup Intents.

## Core Functionality
- Basic user signup/login system (super simple - no email verification or password reset)
- Integration with Stripe to add and save payment methods (credit cards only)
- Store only Stripe reference IDs in database (customer_id, payment_method_id)
- Fetch card details from Stripe API for display (no card data stored locally)
- View saved payment methods (retrieved from Stripe)
- Remove saved payment methods
- NO actual payment processing - only saving cards for future use
- NO webhooks needed (keeping it simple for testing)

## Technical Stack
### Frontend
- **Framework**: React (latest version)
- **Language**: JavaScript/JSX
- **Styling**: Simple functional CSS (no UI library needed)
- **Stripe Integration**: Stripe.js with embedded Payment Element
- **HTTP Client**: Axios or Fetch API
- **Routing**: React Router (minimal - just 2 pages)
- **IMPORTANT**: Do NOT use React.StrictMode in index.js to avoid double API calls in development

### Backend  
- **Framework**: FastAPI (Python)
- **Python Version**: 3.8+ 
- **Virtual Environment**: venv (included in setup)
- **Database**: PostgreSQL (Docker container)
- **ORM**: SQLAlchemy
- **Authentication**: Super basic JWT (no refresh tokens, no password reset)
- **Stripe**: Stripe Python SDK v12.4.0+ (IMPORTANT: Use v12+ to avoid import errors)
- **CORS**: Enabled for local development
- **Important Dependencies**: 
  - `pydantic[email]` (not just pydantic)
  - `email-validator` (required for EmailStr validation)

### Infrastructure
- **Database**: PostgreSQL in Docker container only
- **Backend**: Run locally with uvicorn (not dockerized)
- **Environment**: .env files for configuration
- **Ports**: 
  - Frontend: 3000
  - Backend: 8000
  - PostgreSQL: 5433

## Database Schema
```sql
users
- id (UUID, primary key)
- email (unique, required)
- password_hash (required)
- created_at (timestamp)
- updated_at (timestamp)

payment_methods
- id (UUID, primary key)  
- user_id (foreign key to users.id)
- stripe_customer_id (string, required)
- stripe_payment_method_id (string, required, unique)
- is_default (boolean, default false)
- created_at (timestamp)

# Note: Card details (last4, brand, exp_month, exp_year) are fetched 
# from Stripe API when needed, not stored in our database
```

## API Endpoints
```
POST   /api/auth/signup          - Create new user
POST   /api/auth/login           - Login user (returns JWT)
GET    /api/auth/me              - Get current user info

POST   /api/stripe/setup-intent  - Create Setup Intent for adding card
       (creates Stripe customer if first time)
POST   /api/stripe/save-payment-method - Save payment method after confirmation
GET    /api/stripe/payment-methods - List user's saved cards 
       (fetches card details from Stripe API)
DELETE /api/stripe/payment-methods/{pm_id} - Remove a payment method
```

## Frontend Pages & Flow
```
Pages (Minimal routing):
1. LoginPage (handles both login and signup with a toggle)
2. DashboardPage (shows saved payment methods + add new)

Components:
- AddPaymentMethod (Stripe Payment Element modal/section)
  IMPORTANT: This component should:
  - Create Setup Intent and get clientSecret in parent component
  - Pass clientSecret to Elements provider options
  - Pass clientSecret as prop to CheckoutForm child component
- PaymentMethodList (displays saved cards)
- PaymentMethodCard (individual card with remove button)

Stripe Elements Integration Flow (CRITICAL):
1. Create Setup Intent first to get clientSecret
2. Initialize Elements with clientSecret in options
3. In payment submission:
   - Call elements.submit() first
   - Then call stripe.confirmSetup({ clientSecret, ... })
4. Use billingDetails: 'auto' in PaymentElement options
```

## User Flow
1. User lands on Login page
2. User can toggle between Login/Signup on same page
3. After authentication → redirect to Dashboard
4. Dashboard shows:
   - List of saved payment methods (empty state if none)
   - "Add Payment Method" button
5. Click "Add" → shows Stripe Payment Element inline or in modal
6. Enter card → saves to Stripe and database
7. Card appears in list with remove option

## Project Structure
```
stripe-payment-test/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddPaymentMethod.js
│   │   │   ├── PaymentMethodList.js
│   │   │   └── PaymentMethodCard.js
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   └── DashboardPage.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── auth.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── .env.example
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── config.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── user.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   └── stripe.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   └── stripe.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── auth.py
│   ├── scripts/
│   │   ├── reset_db.py
│   │   └── init_db.py
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
│
├── docker-compose.yml (PostgreSQL only)
├── README.md
└── .gitignore

Note: Python virtual environment (venv/) will be created in backend/ but is excluded from git
```

## Environment Variables
```
# Backend .env
DATABASE_URL=postgresql://testuser:testpass@localhost:5433/stripe_test_db
SECRET_KEY=your-secret-key-for-jwt-make-this-long-and-random
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
FRONTEND_URL=http://localhost:3000

# Frontend .env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Database Scripts
Create the following utility scripts:

1. **scripts/init_db.py** - Initialize database and tables
2. **scripts/reset_db.py** - Drop all tables and recreate them
3. **scripts/seed_db.py** (optional) - Add test users

## Error Handling (Basic Level)
- Display Stripe error messages clearly (card declined, invalid number)
- Show generic error messages for network failures
- Basic form validation (email format, password length)
- Loading states during API calls

## Implementation Requirements
1. **Security**:
   - Never store raw card details OR card metadata in database
   - Fetch card display info from Stripe API when needed
   - Hash passwords with bcrypt
   - Validate JWT tokens on protected routes
   - Use parameterized queries (SQLAlchemy handles this)

2. **Stripe Data Architecture**:
   - Store only Stripe IDs in database (customer_id, payment_method_id)
   - When displaying cards, fetch details from Stripe using:
     ```python
     stripe.PaymentMethod.retrieve(payment_method_id)
     ```
   - This returns card info like last4, brand, exp_month, exp_year
   - Create Stripe customer only when user adds first payment method
   - One user → one Stripe customer → multiple payment methods

3. **Critical Stripe Elements Implementation**:
   ```javascript
   // Correct implementation in AddPaymentMethod component:
   
   // 1. Create Setup Intent first
   const response = await fetch('/api/stripe/setup-intent', ...)
   const { client_secret } = await response.json()
   
   // 2. Initialize Elements with clientSecret
   const options = {
     mode: 'setup',
     currency: 'usd',
     clientSecret: client_secret  // REQUIRED
   }
   
   // 3. In CheckoutForm submission:
   const { error: submitError } = await elements.submit()
   if (submitError) return
   
   const { error } = await stripe.confirmSetup({
     elements,
     clientSecret,  // REQUIRED - pass the clientSecret
     confirmParams: {
       return_url: window.location.href
     },
     redirect: 'if_required'
   })
   
   // 4. PaymentElement options
   <PaymentElement options={{ 
     layout: 'tabs',
     billingDetails: 'auto'  // NOT 'never'
   }} />
   ```

4. **UI/UX**:
   - Simple, clean interface
   - Show loading state while fetching card details from Stripe
   - Clear success/error messages
   - Loading spinners during async operations
   - Disabled buttons during form submission
   - Empty state message when no payment methods

3. **Code Quality**:
   - Comment Stripe integration points thoroughly
   - Use clear variable names
   - Include console.log for debugging Stripe responses
   - Keep components small and focused

## README Contents
```markdown
# Stripe Payment Method Test App

## Prerequisites
- Python 3.8+
- Node.js 14+
- Docker & Docker Compose
- Stripe account (test mode)

## Setup Instructions

### 1. Get Stripe Test Keys
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your test Publishable key and Secret key

### 2. Database Setup
```bash
# Start PostgreSQL in Docker
docker-compose up -d

# Initialize database (run from backend directory)
cd backend
python scripts/init_db.py
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy and configure .env
cp .env.example .env
# Edit .env with your Stripe keys

# Run the backend
uvicorn app.main:app --reload
```

### 4. Frontend Setup
```bash
cd frontend
npm install

# Copy and configure .env
cp .env.example .env
# Edit .env with your Stripe publishable key

# Run the frontend
npm start
```

## Test Credit Cards
Use these test card numbers (any future expiry, any CVC):

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 9995
- **Requires Authentication**: 4000 0025 0000 3155
- **Insufficient Funds**: 4000 0000 0000 9995
- **Expired Card**: 4000 0000 0000 0069
- **Incorrect CVC**: 4000 0000 0000 0127

Full list: https://stripe.com/docs/testing#cards

## Database Management

### Reset Database (Clear all data)
```bash
cd backend
python scripts/reset_db.py
```

### View Database
```bash
# Connect to PostgreSQL
docker exec -it stripe_test_db psql -U testuser -d stripe_test_db

# Useful commands:
\dt              # List tables
\d users         # Describe users table
SELECT * FROM users;
SELECT * FROM payment_methods;
\q               # Quit
```

## API Endpoints
[Document all endpoints with example requests/responses]

## Troubleshooting
- **CORS errors**: Make sure backend is running on port 8000
- **Stripe errors**: Check that you're using test keys (start with pk_test and sk_test)
- **Database connection**: Ensure Docker container is running (`docker ps`)
- **JWT errors**: Token expires after 24 hours, log in again
```

## Constraints
- Use Stripe test mode only
- Super basic authentication (no email verification, no password reset)
- No production deployment configuration
- Focus on clarity over optimization
- No unit tests (this is a proof of concept)
- Basic error handling only

## Success Criteria
The project is successful when:
1. User can sign up with email/password
2. User can log in and receive JWT token
3. Authenticated user can add a credit card using Stripe's Payment Element
4. Card is saved to Stripe and only reference IDs stored in PostgreSQL
5. User can view their saved cards (details fetched from Stripe API showing last 4 digits, brand, expiry)
6. User can remove a saved card (deletes from both Stripe and database)
7. All Stripe test cards work as expected
8. Database can be easily reset for fresh testing
9. No card information is stored in the database - only Stripe IDs

## Additional Notes for Claude Code
- **CRITICAL**: Do NOT wrap App in React.StrictMode in index.js (causes double API calls)
- **CRITICAL**: Use Stripe SDK v12.4.0+ in backend to avoid import errors
- **CRITICAL**: Use pydantic[email] not just pydantic, and include email-validator
- **CRITICAL**: Follow the exact Stripe Elements flow: elements.submit() then stripe.confirmSetup()
- Keep the UI minimal and functional - no fancy animations
- Use inline styles or a single CSS file - no CSS frameworks
- Add plenty of console.log statements for debugging
- Include clear error messages that help understand what went wrong
- Make sure to handle loading states to prevent double-submissions
- Comment the Stripe-specific code extensively for learning purposes
- Configure docker-compose.yml to map PostgreSQL to port 5433 on host machine
- Include proper .gitignore files that exclude venv/, node_modules/, .env, __pycache__, etc.
- Create activation scripts or document virtual environment usage clearly in README

## Backend requirements.txt (EXACT versions to avoid issues)
```
fastapi==0.109.0
uvicorn[standard]==0.25.0
python-multipart==0.0.6
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic[email]==2.5.0  # NOT just pydantic
email-validator==2.1.1  # REQUIRED for EmailStr
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
stripe==12.4.0  # MUST be v12+ to avoid import errors
python-dotenv==1.0.0
```

---
*This prompt is designed for Claude Code to create a complete, working Stripe payment method testing environment from scratch.*