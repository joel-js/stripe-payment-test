#!/usr/bin/env python3
"""
Database reset script for Stripe Payment Test app.
Drops all tables and recreates them (clears all data).
"""
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base
from app.models.user import User, PaymentMethod

def reset_database():
    """Reset database by dropping all tables and recreating them."""
    try:
        print("⚠️  WARNING: This will delete ALL data in the database!")
        confirm = input("Are you sure you want to continue? (yes/no): ")
        
        if confirm.lower() != 'yes':
            print("Database reset cancelled.")
            return
        
        print("Dropping all database tables...")
        Base.metadata.drop_all(bind=engine)
        print("✓ All tables dropped successfully!")
        
        print("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✓ Database tables created successfully!")
        
        print("Tables recreated:")
        print("  - users")
        print("  - payment_methods")
        print("\nDatabase has been reset to a clean state.")
        
    except Exception as e:
        print(f"✗ Error resetting database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    reset_database()