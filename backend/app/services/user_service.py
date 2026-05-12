from typing import Optional
from sqlalchemy.orm import Session
from app.models import User
from app.schemas import UserCreate
from app.services.auth_service import get_password_hash, verify_password, create_access_token
from app.exception import BadRequestException, UnauthorizedException


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user_data: UserCreate) -> User:
    existing_user = get_user_by_email(db, user_data.email)
    if existing_user:
        raise BadRequestException("Email already registered")

    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = get_user_by_email(db, email)
    if not user:
        raise UnauthorizedException("Incorrect email or password")
    if not verify_password(password, user.hashed_password):
        raise UnauthorizedException("Incorrect email or password")
    return user


def create_token(user: User) -> str:
    return create_access_token(data={"sub": user.email})