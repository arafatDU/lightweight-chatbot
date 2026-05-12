from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


def init_db(engine):
    """Initialize database tables."""
    # Import models here to ensure they are registered with Base
    from app.models.user import User

    Base.metadata.create_all(bind=engine)