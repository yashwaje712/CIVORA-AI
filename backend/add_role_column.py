from sqlalchemy import text

from app.db.database import engine


with engine.connect() as connection:
    connection.execute(
        text(
            "ALTER TABLE users "
            "ADD COLUMN role VARCHAR(20) "
            "NOT NULL DEFAULT 'citizen'"
        )
    )
    connection.commit()

print("Role column added successfully!")