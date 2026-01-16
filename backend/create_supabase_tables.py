#!/usr/bin/env python3
"""
Create missing database tables for Quest RPG on Supabase
Run this from the backend directory: python create_supabase_tables.py
"""

import sys
from pathlib import Path

# Add the app directory to the path
sys.path.insert(0, str(Path(__file__).parent))

def create_tables():
    """Create goals and milestones tables on Supabase"""
    from app.database import engine
    from sqlalchemy import text
    
    print("🔗 Connecting to Supabase database...")
    
    # SQL to create goals table
    create_goals_sql = """
    CREATE TABLE IF NOT EXISTS goals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description VARCHAR(1000),
        category VARCHAR(50) NOT NULL,
        target_date DATE,
        is_completed BOOLEAN DEFAULT FALSE NOT NULL,
        xp_reward INTEGER DEFAULT 500 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
    );
    """
    
    # SQL to create milestones table
    create_milestones_sql = """
    CREATE TABLE IF NOT EXISTS milestones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        "order" INTEGER NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE NOT NULL,
        xp_reward INTEGER DEFAULT 50 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        completed_at TIMESTAMP
    );
    """
    
    # Create indexes
    create_indexes_sql = """
    CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
    CREATE INDEX IF NOT EXISTS idx_goals_completed ON goals(is_completed);
    CREATE INDEX IF NOT EXISTS idx_milestones_goal_id ON milestones(goal_id);
    CREATE INDEX IF NOT EXISTS idx_milestones_order ON milestones(goal_id, "order");
    """
    
    try:
        with engine.connect() as conn:
            print("📋 Creating goals table...")
            conn.execute(text(create_goals_sql))
            conn.commit()
            print("✅ goals table created")
            
            print("📋 Creating milestones table...")
            conn.execute(text(create_milestones_sql))
            conn.commit()
            print("✅ milestones table created")
            
            print("📋 Creating indexes...")
            conn.execute(text(create_indexes_sql))
            conn.commit()
            print("✅ indexes created")
            
        print("\n🎉 SUCCESS! Database tables created on Supabase!")
        print("\nCreated tables:")
        print("  ✓ goals")
        print("  ✓ milestones")
        print("\nYou can now create goals from your frontend!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\n💡 Make sure your DATABASE_URL in .env is correct")
        sys.exit(1)

if __name__ == "__main__":
    create_tables()