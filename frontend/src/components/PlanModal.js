import React from 'react';
import { contactInfo } from '../mock';

const PlanModal = ({ plan, isOpen, onClose, onContract }) => {
  if (!isOpen || !plan) return null;

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(plan.whatsapp_message);
    const whatsappUrl = `https://wa.me/${contactInfo.whatsapp.replace(/\s+/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleContractPlan = () => {
    onContract();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        
        <div className="plan-header">
          <h2 className="plan-title">{plan.title}</h2>
          <div className="plan-price">
            <span className="price-amount">R$ {(plan.price / 100).toFixed(0)}</span>
            <span className="price-period">{plan.period}</span>
          </div>
          {plan.premium_price && (
            <div className="plan-price" style={{ fontSize: '0.9em', opacity: 0.8 }}>
              <span className="price-amount" style={{ fontSize: '1.5rem' }}>
                R$ {(plan.premium_price / 100).toFixed(0)}
              </span>
              <span className="price-period">{plan.premium_text}</span>
            </div>
          )}
          {plan.subtitle && (
            <p className="body-small" style={{ marginTop: '0.5rem' }}>
              {plan.subtitle}
            </p>
          )}
          <p className="plan-commission">{plan.commission}</p>
        </div>

        <div>
          <h3 className="heading-2" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
            O que está incluído:
          </h3>
          <ul className="plan-features">
            {plan.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>

        {plan.premium_features && (
          <div style={{ marginTop: '2rem' }}>
            <h3 className="heading-2" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
              Premium inclui também:
            </h3>
            <ul className="plan-features">
              {plan.premium_features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-primary" onClick={handleContractPlan}>
            Contratar Plano
          </button>
          <button className="btn-secondary" onClick={handleWhatsAppContact}>
            Contato via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanModal;