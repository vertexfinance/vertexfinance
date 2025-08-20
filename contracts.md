# Contratos API - Sistema de Pagamentos Vertex

## Frontend Mock Data Removido
- Remover dados mock de `mock.js`
- Integrar com endpoints reais do backend

## Backend Endpoints

### 1. Planos
- `GET /api/plans` - Lista planos disponíveis
- `GET /api/plans/:id` - Detalhes de um plano

### 2. Pagamentos/Pedidos
- `POST /api/orders` - Criar novo pedido
  ```json
  {
    "planId": "pessoa-fisica", 
    "customerData": {
      "name": "string",
      "email": "string", 
      "phone": "string",
      "cpfCnpj": "string"
    },
    "paymentMethod": "pix" | "credit_card"
  }
  ```

- `GET /api/orders/:id` - Buscar pedido por ID
- `POST /api/orders/:id/payment-proof` - Upload comprovante
- `GET /api/orders/:id/status` - Status do pedido

### 3. Admin (Sistema Semi-Automático)
- `GET /api/admin/orders` - Lista todos pedidos (requer auth)
- `PUT /api/admin/orders/:id/status` - Atualizar status pedido
- `POST /api/admin/auth` - Login admin

## Status dos Pedidos
- `PENDING` - Aguardando pagamento
- `PAYMENT_SENT` - Comprovante enviado
- `CONFIRMED` - Pagamento confirmado
- `ACTIVE` - Assinatura ativa
- `CANCELLED` - Cancelado

## Dados Banco Inter
- Chave PIX: (você fornecerá)
- Dados da conta: (você fornecerá)

## Notificações
- Email/WhatsApp para novos pedidos (opcional)
- Dashboard admin para gerenciar manualmente

## Integração Frontend
1. Modal de pagamento com formulário de dados
2. Tela de pagamento PIX (QR code manual)
3. Upload de comprovante
4. Acompanhamento de status
5. Área admin para gestão

## Observações
- Sistema semi-automático: PIX manual + validação manual
- Admin marca manualmente como "confirmado"
- Cliente recebe updates por email/WhatsApp (opcional)