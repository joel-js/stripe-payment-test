#!/usr/bin/env python3
"""
Database initialization script for Stripe Payment Test app.
Creates all database tables based on SQLAlchemy models.
"""
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base
from app.models.user import User, PaymentMethod

def init_database():
    """Initialize database by creating all tables."""
    try:
        print("Creating database tables...")
        
        Base.metadata.create_all(bind=engine)
        
        print("✓ Database tables created successfully!")
        print("Tables created:")
        print("  - users")
        print("  - payment_methods")
        
    except Exception as e:
        print(f"✗ Error creating database tables: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_database()