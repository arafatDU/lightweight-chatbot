from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import Conversation, Message
from app.core.config import settings
from app.services import ollama_service
from app.services import model_catalog


def create_conversation(db: Session, user_id: int, title: str = "New Conversation") -> Conversation:
    conversation = Conversation(user_id=user_id, title=title)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def get_conversation(db: Session, conversation_id: int, user_id: int) -> Optional[Conversation]:
    return (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == user_id)
        .first()
    )


def get_user_conversations(db: Session, user_id: int) -> List[Conversation]:
    return (
        db.query(Conversation)
        .filter(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )


def delete_conversation(db: Session, conversation_id: int, user_id: int) -> bool:
    conversation = get_conversation(db, conversation_id, user_id)
    if conversation:
        db.delete(conversation)
        db.commit()
        return True
    return False


def save_message(db: Session, conversation_id: int, role: str, content: str) -> Message:
    message = Message(conversation_id=conversation_id, role=role, content=content)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


async def generate_response(conversation_id: int, user_message: str, db: Session, model: Optional[str] = None) -> str:
    """Generate response using Ollama with conversation history from DB."""
    model = model or settings.DEFAULT_MODEL

    # Fetch all messages for this conversation to provide context
    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    ollama_messages = []
    for msg in messages:
        ollama_messages.append({"role": msg.role, "content": msg.content})

    # The user_message is already saved in DB before calling this, 
    # so it's already in the `messages` list if we fetch it now.
    
    response = await ollama_service.ollama_service.chat_completion(model, ollama_messages)
    return response


def update_conversation_title(db: Session, conversation_id: int, title: str):
    """Update conversation title."""
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if conversation:
        conversation.title = title[:50]  # Limit title length
        db.commit()


async def pull_model(model_name: str) -> dict:
    """Pull a model from Ollama."""
    result = await ollama_service.ollama_service.pull_model(model_name)
    return result


async def get_available_models() -> List[dict]:
    """Get list of models with availability status."""
    catalog = model_catalog.get_model_catalog()
    try:
        ollama_models = await ollama_service.ollama_service.list_models()
        available_names = {m["name"] for m in ollama_models}
    except Exception:
        available_names = set()

    return [
        {**model, "available": model["name"] in available_names}
        for model in catalog
    ]