import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPanel = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState(localStorage.getItem('admin_token'));

  useEffect(() => {
    if (token && isOpen) {
      checkAuthAndLoadOrders();
    }
  }, [isOpen, token]);

  const checkAuthAndLoadOrders = async () => {
    try {
      const response = await axios.get(`${API}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('admin_token');
        setToken(null);
        setIsAuthenticated(false);
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/admin/auth`, { password });
      const newToken = response.data.token;
      
      setToken(newToken);
      localStorage.setItem('admin_token', newToken);
      setIsAuthenticated(true);
      await loadOrders(newToken);
    } catch (error) {
      setError('Senha incorreta');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async (authToken = token) => {
    try {
      const response = await axios.get(`${API}/admin/orders`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setOrders(response.data);
    } catch (error) {
      setError('Erro ao carregar pedidos');
    }
  };

  const updateOrderStatus = async (orderId, newStatus, adminNotes = '') => {
    try {
      await axios.put(`${API}/admin/orders/${orderId}/status`, {
        status: newStatus,
        admin_notes: adminNotes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await loadOrders();
    } catch (error) {
      setError('Erro ao atualizar status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatPrice = (cents) => {
    return (cents / 100).toFixed(2);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#f59e0b';
      case 'PAYMENT_SENT': return '#3b82f6';
      case 'CONFIRMED': return '#10b981';
      case 'ACTIVE': return '#059669';
      case 'CANCELLED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Aguardando';
      case 'PAYMENT_SENT': return 'Comprovante Enviado';
      case 'CONFIRMED': return 'Confirmado';
      case 'ACTIVE': return 'Ativo';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1200px', maxHeight: '90vh' }}>
        <button className="modal-close" onClick={handleClose}>
          ×
        </button>

        <h2 className="heading-2" style={{ marginBottom: '2rem', textAlign: 'center' }}>
          Painel Administrativo
        </h2>

        {!isAuthenticated ? (
          <form onSubmit={handleLogin} style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="body-small" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Senha de Administrador
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: '0' }}
                required
              />
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
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <div>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <button
                onClick={() => loadOrders()}
                className="btn-secondary"
                style={{ marginRight: '1rem' }}
              >
                Atualizar Lista
              </button>
              <span className="body-small">
                Total: {orders.length} pedidos
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f9f9f9' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--border-medium)' }}>
                      ID
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--border-medium)' }}>
                      Cliente
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--border-medium)' }}>
                      Plano
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--border-medium)' }}>
                      Valor
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--border-medium)' }}>
                      Status
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--border-medium)' }}>
                      Data
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--border-medium)' }}>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((orderData) => (
                    <tr key={orderData.order.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <code style={{ fontSize: '0.75rem' }}>
                          {orderData.order.id.substring(0, 8)}...
                        </code>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div>
                          <strong>{orderData.order.customer_data.name}</strong><br />
                          <small>{orderData.order.customer_data.email}</small><br />
                          <small>{orderData.order.customer_data.phone}</small>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div>
                          <strong>{orderData.plan.title}</strong>
                          {orderData.order.is_premium && <br />}<span style={{ color: 'var(--accent-gold)' }}>Premium</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <strong>R$ {formatPrice(orderData.order.amount)}</strong>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span
                          style={{
                            color: getStatusColor(orderData.order.status),
                            fontWeight: '600'
                          }}
                        >
                          {getStatusText(orderData.order.status)}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <small>{formatDate(orderData.order.created_at)}</small>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                          {orderData.order.status === 'PAYMENT_SENT' && (
                            <>
                              <button
                                onClick={() => updateOrderStatus(orderData.order.id, 'CONFIRMED')}
                                style={{ 
                                  background: '#10b981', 
                                  color: 'white', 
                                  border: 'none', 
                                  padding: '0.25rem 0.5rem', 
                                  borderRadius: '2px',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer'
                                }}
                              >
                                Confirmar
                              </button>
                              <button
                                onClick={() => updateOrderStatus(orderData.order.id, 'CANCELLED', 'Pagamento não confirmado')}
                                style={{ 
                                  background: '#ef4444', 
                                  color: 'white', 
                                  border: 'none', 
                                  padding: '0.25rem 0.5rem', 
                                  borderRadius: '2px',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer'
                                }}
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                          {orderData.order.status === 'CONFIRMED' && (
                            <button
                              onClick={() => updateOrderStatus(orderData.order.id, 'ACTIVE')}
                              style={{ 
                                background: '#059669', 
                                color: 'white', 
                                border: 'none', 
                                padding: '0.25rem 0.5rem', 
                                borderRadius: '2px',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                              }}
                            >
                              Ativar
                            </button>
                          )}
                          {orderData.order.payment_proof_url && (
                            <a
                              href={`${BACKEND_URL}${orderData.order.payment_proof_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: 'var(--accent-gold)',
                                textDecoration: 'none',
                                fontSize: '0.75rem'
                              }}
                            >
                              Ver Comprovante
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {orders.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p className="body-regular">Nenhum pedido encontrado</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;