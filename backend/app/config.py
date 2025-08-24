import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://testuser:testpass@localhost:5433/stripe_test_db")
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-for-jwt-make-this-long-and-random")
    STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
    STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS = 24

settings = Settings()