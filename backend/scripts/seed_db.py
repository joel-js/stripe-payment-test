#!/usr/bin/env python3
"""
Database seeding script for Stripe Payment Test app.
Creates test users for development and testing.
"""
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import sessionmaker
from app.database import engine
from app.models.user import User
from app.utils.auth import get_password_hash

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_database():
    """Seed database with test users."""
    db = SessionLocal()
    
    try:
        print("Seeding database with test users...")
        
        existing_user = db.query(User).filter(User.email == "test@example.com").first()
        if existing_user:
            print("Test user already exists, skipping seed.")
            return
        
        test_user = User(
            email="test@example.com",
            password_hash=get_password_hash("password123")
        )
        
        db.add(test_user)
        db.commit()
        
        print("✓ Test user created successfully!")
        print("Test user credentials:")
        print("  Email: test@example.com")
        print("  Password: password123")
        
    except Exception as e:
        print(f"✗ Error seeding database: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()