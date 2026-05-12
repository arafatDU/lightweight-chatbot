from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database import engine
from app.database.init_db import init_db
from app.api import auth_router, chat_router

try:
    print(f"Connecting to database: {settings.DATABASE_URL.split('@')[-1]}") # Log host part only
    init_db(engine)
    print("Database initialized successfully")
except Exception as e:
    print(f"Database initialization failed: {str(e)}")
    # In production you might want to exit, but for now we'll allow startup

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(chat_router)


@app.get("/health")
async def health():
    return {"status": "ok", "message": "LightChat API is running"}


@app.get("/")
async def root():
    return {"message": "Welcome to LightChat API"}