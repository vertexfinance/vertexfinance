from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
import uuid
from datetime import datetime, timedelta
import jwt
import shutil
from typing import List

# Import models and database
from models import *
from database import *

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOAD_DIR = Path(os.environ.get('UPLOAD_DIR', '/app/backend/uploads'))
UPLOAD_DIR.mkdir(exist_ok=True)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()
SECRET_KEY = "vertex-secret-key-2025"
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'vertex2025admin')

# PIX Configuration
PIX_KEY = os.environ.get('PIX_KEY')
PIX_RECIPIENT_NAME = os.environ.get('PIX_RECIPIENT_NAME', 'NICOLAS CAMARGO MARQUES')

def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify admin JWT token"""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Access denied")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    await init_database()

# Routes
@api_router.get("/")
async def root():
    return {"message": "Vertex Investimentos API"}

# Plans endpoints
@api_router.get("/plans", response_model=List[Plan])
async def get_plans():
    return await get_all_plans()

@api_router.get("/plans/{plan_id}", response_model=Plan)
async def get_plan(plan_id: str):
    plan = await get_plan_by_id(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

# Orders endpoints
@api_router.post("/orders", response_model=OrderResponse)
async def create_new_order(request: CreateOrderRequest):
    # Get plan details
    plan = await get_plan_by_id(request.plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Calculate amount
    amount = plan.premium_price if request.is_premium and plan.premium_price else plan.price
    
    # Create order
    order = Order(
        plan_id=request.plan_id,
        customer_data=request.customer_data,
        payment_method=request.payment_method,
        is_premium=request.is_premium,
        amount=amount,
        status=OrderStatus.PENDING
    )
    
    await create_order(order)
    
    return OrderResponse(order=order, plan=plan)

@api_router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str):
    order = await get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    plan = await get_plan_by_id(order.plan_id)
    return OrderResponse(order=order, plan=plan)

@api_router.post("/orders/{order_id}/payment-proof")
async def upload_payment_proof(order_id: str, file: UploadFile = File(...)):
    order = await get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="File type not allowed")
    
    # Save file
    file_extension = file.filename.split(".")[-1]
    filename = f"proof_{order_id}_{uuid.uuid4().hex[:8]}.{file_extension}"
    file_path = UPLOAD_DIR / filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update order
    proof_url = f"/uploads/{filename}"
    await update_order_payment_proof(order_id, proof_url)
    
    return {"message": "Payment proof uploaded successfully", "url": proof_url}

@api_router.get("/orders/{order_id}/status")
async def get_order_status(order_id: str):
    order = await get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {
        "order_id": order_id,
        "status": order.status,
        "updated_at": order.updated_at
    }

@api_router.get("/pix-info")
async def get_pix_info():
    return {
        "pix_key": PIX_KEY,
        "recipient_name": PIX_RECIPIENT_NAME,
        "bank": "Banco Inter"
    }

# Admin endpoints
@api_router.post("/admin/auth", response_model=AdminLoginResponse)
async def admin_login(request: AdminLoginRequest):
    if request.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    
    # Create JWT token
    payload = {
        "role": "admin",
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    
    return AdminLoginResponse(success=True, token=token)

@api_router.get("/admin/orders", response_model=List[OrderResponse])
async def get_all_orders_admin(admin: dict = Depends(verify_admin_token)):
    orders = await get_all_orders()
    order_responses = []
    
    for order in orders:
        plan = await get_plan_by_id(order.plan_id)
        order_responses.append(OrderResponse(order=order, plan=plan))
    
    return order_responses

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status_admin(
    order_id: str, 
    request: UpdateOrderStatusRequest,
    admin: dict = Depends(verify_admin_token)
):
    order = await get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    success = await update_order_status(order_id, request.status, request.admin_notes)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update order")
    
    return {"message": "Order status updated successfully"}

# Include the router in the main app
app.include_router(api_router)

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()