from motor.motor_asyncio import AsyncIOMotorClient
from models import Plan, Order, PlanType
import os

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/vertex')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'vertex')]

# Collections
plans_collection = db.plans
orders_collection = db.orders

async def init_database():
    """Initialize database with default plans"""
    
    # Check if plans already exist
    existing_plans = await plans_collection.count_documents({})
    if existing_plans > 0:
        return
    
    # Insert default plans
    default_plans = [
        Plan(
            id="pessoa-fisica",
            title="Pessoa Física",
            price=3500,  # R$ 35.00 em centavos
            premium_price=4500,  # R$ 45.00 em centavos
            period="/mês",
            commission="+ 5% do valor dos investimentos mensais resultantes dos investimentos Vertex",
            premium_text="com acompanhamento Premium",
            features=[
                "Consultoria personalizada de investimentos",
                "Análise de perfil de risco",
                "Relatórios mensais de performance",
                "Suporte via WhatsApp",
                "Estratégias de diversificação"
            ],
            premium_features=[
                "Acompanhamento semanal dedicado",
                "Consultoria em tempo real",
                "Análise técnica avançada",
                "Rebalanceamento automático de carteira"
            ],
            whatsapp_message="Olá! Tenho interesse no plano Pessoa Física da Vertex Investimentos. Gostaria de mais informações sobre como começar."
        ),
        Plan(
            id="empresa",
            title="Empresa",
            price=10000,  # R$ 100.00 em centavos
            period="/mês",
            commission="+ 1% do valor líquido mensal resultante dos investimentos Vertex",
            subtitle="com acompanhamento completo econômico",
            features=[
                "Gestão completa de portfólio corporativo",
                "Análise econômica e fiscal",
                "Planejamento estratégico financeiro",
                "Consultoria em investimentos empresariais",
                "Relatórios executivos mensais",
                "Suporte prioritário dedicado",
                "Análise de fluxo de caixa"
            ],
            whatsapp_message="Olá! Represento uma empresa e tenho interesse no plano Empresa da Vertex Investimentos. Gostaria de agendar uma reunião para conhecer os serviços."
        )
    ]
    
    for plan in default_plans:
        await plans_collection.insert_one(plan.dict())

async def get_plan_by_id(plan_id: str) -> Plan:
    """Get plan by ID"""
    plan_data = await plans_collection.find_one({"id": plan_id})
    if not plan_data:
        return None
    return Plan(**plan_data)

async def get_all_plans() -> List[Plan]:
    """Get all plans"""
    plans_data = await plans_collection.find().to_list(100)
    return [Plan(**plan) for plan in plans_data]

async def create_order(order: Order) -> str:
    """Create new order"""
    order_dict = order.dict()
    result = await orders_collection.insert_one(order_dict)
    return order.id

async def get_order_by_id(order_id: str) -> Order:
    """Get order by ID"""
    order_data = await orders_collection.find_one({"id": order_id})
    if not order_data:
        return None
    return Order(**order_data)

async def update_order_status(order_id: str, status: str, admin_notes: str = None) -> bool:
    """Update order status"""
    update_data = {
        "status": status,
        "updated_at": datetime.utcnow()
    }
    if admin_notes:
        update_data["admin_notes"] = admin_notes
    
    result = await orders_collection.update_one(
        {"id": order_id},
        {"$set": update_data}
    )
    return result.modified_count > 0

async def update_order_payment_proof(order_id: str, proof_url: str) -> bool:
    """Update order payment proof"""
    result = await orders_collection.update_one(
        {"id": order_id},
        {"$set": {
            "payment_proof_url": proof_url,
            "status": "PAYMENT_SENT",
            "updated_at": datetime.utcnow()
        }}
    )
    return result.modified_count > 0

async def get_all_orders(limit: int = 100) -> List[Order]:
    """Get all orders for admin"""
    orders_data = await orders_collection.find().sort("created_at", -1).limit(limit).to_list(limit)
    return [Order(**order) for order in orders_data]