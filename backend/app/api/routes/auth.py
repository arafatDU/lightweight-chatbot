from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import UserCreate, AuthResponse, UserLogin
from app.services import user_service
from app.services.auth_service import decode_access_token
from app.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

security = HTTPBearer()


@router.post("/register", response_model=AuthResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    user = user_service.create_user(db, user_data)
    access_token = user_service.create_token(user)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/login", response_model=AuthResponse)
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db),
):
    user = user_service.authenticate_user(db, login_data.email, login_data.password)
    access_token = user_service.create_token(user)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


def get_current_user(
    auth: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = auth.credentials
    email = decode_access_token(token)
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = user_service.get_user_by_email(db, email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user
