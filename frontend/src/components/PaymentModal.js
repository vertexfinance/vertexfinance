import React, { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PaymentModal = ({ plan, isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: form, 2: payment, 3: proof upload, 4: confirmation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  const [pixInfo, setPixInfo] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpfCnpj: '',
    address: ''
  });

  React.useEffect(() => {
    if (isOpen && step === 2) {
      fetchPixInfo();
    }
  }, [isOpen, step]);

  const fetchPixInfo = async () => {
    try {
      const response = await axios.get(`${API}/pix-info`);
      setPixInfo(response.data);
    } catch (error) {
      console.error('Error fetching PIX info:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const { name, email, phone, cpfCnpj } = formData;
    if (!name || !email || !phone || !cpfCnpj) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um email válido');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const orderData = {
        plan_id: plan.id,
        customer_data: formData,
        payment_method: 'pix',
        is_premium: isPremium
      };

      const response = await axios.post(`${API}/orders`, orderData);
      setOrder(response.data);
      setStep(2);
    } catch (error) {
      setError(error.response?.data?.detail || 'Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError('');

    try {
      await axios.post(`${API}/orders/${order.order.id}/payment-proof`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setStep(4);
    } catch (error) {
      setError(error.response?.data?.detail || 'Erro ao enviar comprovante');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setFormData({
      name: '',
      email: '',
      phone: '',
      cpfCnpj: '',
      address: ''
    });
    setOrder(null);
    setError('');
    setIsPremium(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixInfo?.pix_key);
    alert('Chave PIX copiada!');
  };

  const calculatePrice = () => {
    if (!plan) return 0;
    
    const basePrice = isPremium && plan.premium_price ? plan.premium_price : plan.price;
    return (basePrice / 100).toFixed(2);
  };

  if (!isOpen || !plan) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>
          ×
        </button>

        {step === 1 && (
          <div>
            <h2 className="heading-2" style={{ marginBottom: '2rem', textAlign: 'center' }}>
              Contratar {plan.title}
            </h2>

            {/* Plan Selection */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '4px' }}>
              <h3 className="body-large" style={{ marginBottom: '1rem' }}>Escolha o plano:</h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="premium"
                    checked={!isPremium}
                    onChange={() => setIsPremium(false)}
                  />
                  <span className="body-regular">
                    Básico - R$ {(plan.price / 100).toFixed(2)}/mês
                  </span>
                </label>
              </div>

              {plan.premium_price && (
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="premium"
                      checked={isPremium}
                      onChange={() => setIsPremium(true)}
                    />
                    <span className="body-regular">
                      Premium - R$ {(plan.premium_price / 100).toFixed(2)}/mês
                      {plan.premium_text && <em> ({plan.premium_text})</em>}
                    </span>
                  </label>
                </div>
              )}

              <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', borderLeft: '3px solid var(--accent-gold)' }}>
                <strong className="body-regular">Valor total: R$ {calculatePrice()}</strong>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                  <label className="body-small" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: '0' }}
                  />
                </div>

                <div>
                  <label className="body-small" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: '0' }}
                  />
                </div>

                <div>
                  <label className="body-small" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Telefone/WhatsApp *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                    className="form-input"
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: '0' }}
                  />
                </div>

                <div>
                  <label className="body-small" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    CPF/CNPJ *
                  </label>
                  <input
                    type="text"
                    name="cpfCnpj"
                    value={formData.cpfCnpj}
                    onChange={handleInputChange}
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                    className="form-input"
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: '0' }}
                  />
                </div>

                <div>
                  <label className="body-small" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Endereço (opcional)
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-input"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: '0' }}
                  />
                </div>
              </div>

              {error && (
                <div style={{ color: 'var(--status-error)', marginBottom: '1rem', textAlign: 'center' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? 'Processando...' : 'Continuar para Pagamento'}
              </button>
            </form>
          </div>
        )}

        {step === 2 && pixInfo && (
          <div style={{ textAlign: 'center' }}>
            <h2 className="heading-2" style={{ marginBottom: '2rem' }}>
              Pagamento via PIX
            </h2>

            <div style={{ background: '#f9f9f9', padding: '2rem', marginBottom: '2rem', borderRadius: '4px' }}>
              <h3 className="body-large" style={{ marginBottom: '1rem', color: 'var(--accent-gold)' }}>
                Valor a pagar: R$ {(order.order.amount / 100).toFixed(2)}
              </h3>

              <div style={{ marginBottom: '1.5rem' }}>
                <p className="body-regular" style={{ marginBottom: '0.5rem' }}>
                  <strong>Favorecido:</strong> {pixInfo.recipient_name}
                </p>
                <p className="body-regular" style={{ marginBottom: '1rem' }}>
                  <strong>Banco:</strong> {pixInfo.bank}
                </p>
                
                <div style={{ background: 'white', padding: '1rem', margin: '1rem 0', borderRadius: '4px' }}>
                  <p className="body-small" style={{ marginBottom: '0.5rem' }}>
                    <strong>Chave PIX:</strong>
                  </p>
                  <code style={{ 
                    display: 'block', 
                    wordBreak: 'break-all', 
                    background: '#f0f0f0', 
                    padding: '0.5rem',
                    fontSize: '0.8rem'
                  }}>
                    {pixInfo.pix_key}
                  </code>
                  <button 
                    onClick={copyPixKey}
                    className="btn-secondary"
                    style={{ marginTop: '0.5rem', width: '100%' }}
                  >
                    Copiar Chave PIX
                  </button>
                </div>
              </div>

              <div style={{ background: '#fff3e0', padding: '1rem', marginBottom: '1.5rem', borderRadius: '4px' }}>
                <p className="body-small">
                  <strong>Instruções:</strong><br />
                  1. Abra o app do seu banco<br />
                  2. Escolha PIX → Transferir<br />
                  3. Cole a chave PIX copiada<br />
                  4. Insira o valor exato: R$ {(order.order.amount / 100).toFixed(2)}<br />
                  5. Finalize o pagamento
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              className="btn-primary"
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              Já fiz o PIX, Enviar Comprovante
            </button>

            <p className="body-small" style={{ opacity: 0.7 }}>
              Pedido #{order.order.id}
            </p>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <h2 className="heading-2" style={{ marginBottom: '2rem' }}>
              Enviar Comprovante
            </h2>

            <p className="body-regular" style={{ marginBottom: '2rem' }}>
              Envie o comprovante do seu PIX para confirmarmos o pagamento.
            </p>

            <div style={{ marginBottom: '2rem' }}>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="proof-upload"
              />
              <label
                htmlFor="proof-upload"
                className="btn-primary"
                style={{ 
                  display: 'inline-block', 
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                {loading ? 'Enviando...' : 'Escolher Arquivo'}
              </label>
            </div>

            {error && (
              <div style={{ color: 'var(--status-error)', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <p className="body-small" style={{ opacity: 0.7 }}>
              Formatos aceitos: JPG, PNG, PDF (máx. 5MB)
            </p>
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--accent-gold)', marginBottom: '1.5rem' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>

            <h2 className="heading-2" style={{ marginBottom: '1rem' }}>
              Comprovante Enviado!
            </h2>

            <p className="body-regular" style={{ marginBottom: '1.5rem' }}>
              Recebemos seu comprovante com sucesso. Nossa equipe verificará o pagamento 
              e ativará sua assinatura em até 2 horas úteis.
            </p>

            <div style={{ background: '#f9f9f9', padding: '1.5rem', marginBottom: '2rem', borderRadius: '4px' }}>
              <p className="body-small">
                <strong>Pedido:</strong> #{order.order.id}<br />
                <strong>Email:</strong> {order.order.customer_data.email}<br />
                <strong>Status:</strong> Comprovante enviado
              </p>
            </div>

            <p className="body-small" style={{ marginBottom: '2rem', opacity: 0.8 }}>
              Você receberá um email de confirmação assim que a assinatura for ativada.
            </p>

            <button
              onClick={handleClose}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              Finalizar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;