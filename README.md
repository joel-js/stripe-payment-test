# Stripe Payment Method Test App

A full-stack web application for testing Stripe payment method integration. This app demonstrates saving payment methods for future use without processing actual transactions, using Stripe's Setup Intents.

## ✨ Features

- Simple user authentication (signup/login)
- Add and save credit cards using Stripe Payment Element
- View saved payment methods (card details fetched from Stripe API)
- Remove payment methods
- No actual payment processing - cards are only saved for future use
- Secure: Only Stripe reference IDs stored in database, never card data

## 🛠 Tech Stack

### Backend
- **FastAPI** (Python) - API framework
- **PostgreSQL** - Database (Docker)
- **SQLAlchemy** - ORM
- **Stripe Python SDK** - Payment processing
- **JWT** - Authentication

### Frontend
- **React** - UI framework
- **Stripe.js & React Stripe.js** - Payment integration
- **Axios** - HTTP client
- **React Router** - Routing

## 📋 Prerequisites

- Python 3.8+
- Node.js 14+
- Docker & Docker Compose
- Stripe account (test mode)

## 🚀 Setup Instructions

### 1. Get Stripe Test Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Publishable key** (`pk_test_...`) and **Secret key** (`sk_test_...`)

### 2. Clone and Navigate

```bash
git clone <this-repo>
cd stripe-payment-test
```

### 3. Database Setup

```bash
# Start PostgreSQL in Docker
docker-compose up -d

# Verify database is running
docker ps
```

### 4. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env file with your Stripe keys and database URL

# Initialize database
python scripts/init_db.py

# Optional: Create test user
python scripts/seed_db.py

# Run the backend
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env file with your Stripe publishable key

# Run the frontend
npm start
```

Frontend will be available at `http://localhost:3000`

## 🧪 Testing with Stripe Test Cards

Use these test card numbers (any future expiry date, any CVC):

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0000 0000 9995` | ❌ Declined |
| `4000 0025 0000 3155` | 🔐 Requires Authentication |
| `4000 0000 0000 0069` | 📅 Expired Card |
| `4000 0000 0000 0127` | ❗ Incorrect CVC |

Full list: [Stripe Test Cards](https://stripe.com/docs/testing#cards)

## 🎯 User Flow

1. **Sign Up/Login** - Create account or log in
2. **Dashboard** - View saved payment methods
3. **Add Payment Method** - Click "Add Payment Method"
4. **Enter Card** - Fill out Stripe Payment Element
5. **Save** - Card is saved to Stripe and database (only IDs stored)
6. **View/Remove** - Manage saved cards

## 📁 Project Structure

```
stripe-payment-test/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── config.py          # Configuration settings
│   │   ├── database.py        # Database connection
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── routes/            # API route handlers
│   │   └── utils/             # Utility functions
│   ├── scripts/               # Database management scripts
│   ├── requirements.txt       # Python dependencies
│   └── .env.example          # Environment variables template
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service functions
│   │   ├── App.js            # Main React component
│   │   └── App.css           # Styles
│   ├── package.json          # Node.js dependencies
│   └── .env.example          # Environment variables template
├── docker-compose.yml         # PostgreSQL container
└── README.md                 # This file
```

## 🗄 Database Management

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
\dt                    # List tables
\d users              # Describe users table
SELECT * FROM users;
SELECT * FROM payment_methods;
\q                    # Quit
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user (returns JWT)
- `GET /api/auth/me` - Get current user info

### Stripe Integration
- `POST /api/stripe/setup-intent` - Create Setup Intent for adding card
- `POST /api/stripe/save-payment-method` - Save payment method after confirmation
- `GET /api/stripe/payment-methods` - List user's saved cards
- `DELETE /api/stripe/payment-methods/{pm_id}` - Remove a payment method

## 🔒 Security Features

- Passwords hashed with bcrypt
- JWT token authentication
- No card data stored in database - only Stripe IDs
- Card details fetched from Stripe API when needed
- CORS protection
- SQL injection protection via SQLAlchemy

## 🐛 Troubleshooting

### Common Issues

**CORS Errors**
- Ensure backend is running on port 8000
- Check `FRONTEND_URL` in backend `.env`

**Stripe Integration Issues**
- Verify you're using test keys (start with `pk_test_` and `sk_test_`)
- Check browser console for Stripe.js errors
- Ensure both frontend and backend have correct Stripe keys

**Database Connection**
- Ensure Docker container is running: `docker ps`
- Check database URL in backend `.env`
- Try restarting: `docker-compose restart`

**Authentication Issues**
- JWT tokens expire after 24 hours - log in again
- Clear browser localStorage if needed
- Check token format in API requests

### Logs and Debugging

**Backend Logs**
```bash
cd backend
uvicorn app.main:app --reload --log-level debug
```

**Frontend Console**
- Open browser Developer Tools (F12)
- Check Console tab for JavaScript errors
- Check Network tab for API request/response details

**Database Logs**
```bash
docker logs stripe_test_db
```

## 🔧 Development Notes

- Frontend runs on port 3000
- Backend runs on port 8000  
- PostgreSQL runs on port 5433 (mapped from container port 5432)
- All Stripe operations are in test mode
- JWT tokens expire after 24 hours
- Payment methods are linked to Stripe customers (1:1 user-customer relationship)

## 📝 Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql://testuser:testpass@localhost:5433/stripe_test_db
SECRET_KEY=your-secret-key-for-jwt-make-this-long-and-random
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:8000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 🎯 Success Criteria Checklist

- ✅ User signup/login with JWT authentication
- ✅ Add credit cards using Stripe Payment Element
- ✅ Save payment methods to Stripe (only IDs in database)
- ✅ Display saved cards with details from Stripe API
- ✅ Remove payment methods from both Stripe and database
- ✅ Test cards work as expected
- ✅ Database can be reset for fresh testing
- ✅ No card data stored locally - security compliant

---

**Built for learning Stripe payment method integration** 🚀