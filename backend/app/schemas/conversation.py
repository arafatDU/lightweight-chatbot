from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional


class MessageCreate(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"


class ConversationResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: Optional[datetime]
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True


class ModelInfo(BaseModel):
    name: str
    label: str
    size: str
    description: str
    available: bool = False


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None
    model: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    conversation_id: int
    message_id: int


class PullModelRequest(BaseModel):
    model_name: str


class PullModelResponse(BaseModel):
    status: str
    message: str


class ModelsListResponse(BaseModel):
    models: List[ModelInfo]


class OllamaUrlUpdate(BaseModel):
    url: str


class OllamaUrlResponse(BaseModel):
    status: str
    url: str