from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas import (
    ChatRequest, ChatResponse, ConversationCreate, ConversationResponse,
    PullModelRequest, PullModelResponse, ModelsListResponse, ModelInfo,
    OllamaUrlUpdate, OllamaUrlResponse
)
from app.services import chat_service
from app.services import ollama_service
from app.core.config import settings
from app.api.routes.auth import get_current_user
from app.models import User
from app.exception import NotFoundException

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/send", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send a message and get AI response."""
    is_new_conversation = False
    if request.conversation_id:
        conversation = chat_service.get_conversation(db, request.conversation_id, current_user.id)
        if not conversation:
            raise NotFoundException("Conversation not found")
    else:
        conversation = chat_service.create_conversation(db, current_user.id, "New Conversation")
        is_new_conversation = True

    # Save user message
    chat_service.save_message(db, conversation.id, "user", request.message)

    # If it's a new conversation, update the title based on the first message
    if is_new_conversation:
        chat_service.update_conversation_title(db, conversation.id, request.message)

    # Generate AI response
    try:
        ai_response = await chat_service.generate_response(
            conversation.id,
            request.message,
            db,
            request.model
        )
    except Exception as e:
        # If AI fails, we still want to return what we have or an error
        # Let's save a system message or just raise
        raise HTTPException(status_code=500, detail=f"AI Model Error: {str(e)}")

    # Save AI response
    saved_response = chat_service.save_message(db, conversation.id, "assistant", ai_response)

    return ChatResponse(
        response=ai_response,
        conversation_id=conversation.id,
        message_id=saved_response.id,
    )


@router.get("/models", response_model=ModelsListResponse)
async def get_models(
    current_user: User = Depends(get_current_user),
):
    """Get list of available models with their status."""
    models = await chat_service.get_available_models()
    return ModelsListResponse(
        models=[ModelInfo(**model) for model in models]
    )


@router.post("/models/pull", response_model=PullModelResponse)
async def pull_model(
    request: PullModelRequest,
    current_user: User = Depends(get_current_user),
):
    """Pull a model from Ollama registry."""
    try:
        await chat_service.pull_model(request.model_name)
        return PullModelResponse(
            status="success",
            message=f"Model '{request.model_name}' pulled successfully"
        )
    except Exception as e:
        return PullModelResponse(
            status="error",
            message=str(e)
        )


@router.put("/ollama-url", response_model=OllamaUrlResponse)
async def update_ollama_url(
    request: OllamaUrlUpdate,
    current_user: User = Depends(get_current_user),
):
    """Update Ollama base URL at runtime."""
    ollama_service.ollama_service.update_base_url(request.url)
    return OllamaUrlResponse(
        status="updated",
        url=request.url
    )


@router.get("/health/ollama")
async def check_ollama_health(
    current_user: User = Depends(get_current_user),
):
    """Check if Ollama server is reachable."""
    is_healthy = await ollama_service.ollama_service.check_health()
    return {"status": "healthy" if is_healthy else "unreachable"}


@router.post("/conversations", response_model=ConversationResponse)
def create_conversation(
    request: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new conversation."""
    conversation = chat_service.create_conversation(db, current_user.id, request.title)
    return conversation


@router.get("/conversations", response_model=List[ConversationResponse])
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all conversations for the current user."""
    return chat_service.get_user_conversations(db, current_user.id)


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific conversation with messages."""
    conversation = chat_service.get_conversation(db, conversation_id, current_user.id)
    if not conversation:
        raise NotFoundException("Conversation not found")
    return conversation


@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a conversation."""
    success = chat_service.delete_conversation(db, conversation_id, current_user.id)
    if not success:
        raise NotFoundException("Conversation not found")
    return {"message": "Conversation deleted"}