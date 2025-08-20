import React from 'react';
import { contactInfo } from '../mock';

const PlanModal = ({ plan, isOpen, onClose }) => {
  if (!isOpen || !plan) return null;

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(plan.whatsappMessage);
    const whatsappUrl = `https://wa.me/${contactInfo.whatsapp.replace(/\s+/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleContractPlan = () => {
    // Mock functionality for contracting plan
    alert('Funcionalidade de contratação em desenvolvimento. Por favor, use o botão Contato para mais informações.');
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
            <span className="price-amount">{plan.price}</span>
            <span className="price-period">{plan.period}</span>
          </div>
          {plan.premiumPrice && (
            <div className="plan-price" style={{ fontSize: '0.9em', opacity: 0.8 }}>
              <span className="price-amount" style={{ fontSize: '1.5rem' }}>
                {plan.premiumPrice}
              </span>
              <span className="price-period">{plan.premiumText}</span>
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

        {plan.premiumFeatures && (
          <div style={{ marginTop: '2rem' }}>
            <h3 className="heading-2" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
              Premium inclui também:
            </h3>
            <ul className="plan-features">
              {plan.premiumFeatures.map((feature, index) => (
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