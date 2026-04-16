from pydantic import BaseModel
from typing import Literal


class ChatMessageSchema(BaseModel):
    role: Literal["user", "assistant", "tool", "system"]
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessageSchema] = []
    session_id: str


class ChatResponse(BaseModel):
    reply: str
    suggestions: list[str] = []
