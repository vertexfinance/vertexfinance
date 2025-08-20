from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Literal
from datetime import datetime
import uuid
from enum import Enum

class PlanType(str, Enum):
    PESSOA_FISICA = "pessoa-fisica"
    EMPRESA = "empresa"

class PaymentMethod(str, Enum):
    PIX = "pix"
    CREDIT_CARD = "credit_card"

class OrderStatus(str, Enum):
    PENDING = "PENDING"
    PAYMENT_SENT = "PAYMENT_SENT"
    CONFIRMED = "CONFIRMED"
    ACTIVE = "ACTIVE"
    CANCELLED = "CANCELLED"

class Plan(BaseModel):
    id: str
    title: str
    price: int  # em centavos
    premium_price: Optional[int] = None
    period: str
    commission: str
    subtitle: Optional[str] = None
    premium_text: Optional[str] = None
    features: List[str]
    premium_features: Optional[List[str]] = None
    whatsapp_message: str

class CustomerData(BaseModel):
    name: str
    email: EmailStr
    phone: str
    cpf_cnpj: str
    address: Optional[str] = None

class CreateOrderRequest(BaseModel):
    plan_id: PlanType
    customer_data: CustomerData
    payment_method: PaymentMethod
    is_premium: bool = False

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    plan_id: str
    customer_data: CustomerData
    payment_method: PaymentMethod
    is_premium: bool
    amount: int  # em centavos
    status: OrderStatus = OrderStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    payment_proof_url: Optional[str] = None
    admin_notes: Optional[str] = None

class UpdateOrderStatusRequest(BaseModel):
    status: OrderStatus
    admin_notes: Optional[str] = None

class AdminLoginRequest(BaseModel):
    password: str

class AdminLoginResponse(BaseModel):
    success: bool
    token: Optional[str] = None

class OrderResponse(BaseModel):
    order: Order
    plan: Plan