import React, { useState, useEffect } from 'react';
import './App.css';
import { plansData, contactInfo } from './mock';
import PlanModal from './components/PlanModal';

const App = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const openModal = (planKey) => {
    setSelectedPlan(plansData[planKey]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent('Olá! Gostaria de mais informações sobre os serviços da Vertex Investimentos.');
    const whatsappUrl = `https://wa.me/${contactInfo.whatsapp.replace(/\s+/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleInstagramClick = () => {
    window.open(contactInfo.instagram, '_blank');
  };

  return (
    <div className="App">
      {/* Navigation */}
      <header className="navigation-header">
        <nav className="container">
          <div className="navigation-content">
            <a href="#home" className="navigation-logo">
              Vertex Investimentos
            </a>
            <ul className="navigation-menu">
              <li><a href="#home" className="navigation-link">Início</a></li>
              <li><a href="#plans" className="navigation-link">Planos</a></li>
              <li><a href="#contact" className="navigation-link">Contato</a></li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className={`hero-large ${isLoaded ? 'animate-fade-in-up' : ''}`}>
              Exclusividade e Crescimento
            </h1>
            <p className={`hero-medium hero-subtitle ${isLoaded ? 'animate-fade-in-up animate-delay-1' : ''}`}>
              Com a Vertex Investimentos, você descobre uma forma elegante e segura de investir. 
              Nosso foco é maximizar seu patrimônio com sofisticação e discrição.
            </p>
            <div className={`hero-cta ${isLoaded ? 'animate-fade-in-up animate-delay-2' : ''}`}>
              <button className="btn-primary" onClick={handleWhatsAppContact}>
                Começar Agora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="plans-section section-padding">
        <div className="container">
          <div className="text-center">
            <h2 className="heading-1" style={{ marginBottom: '1rem' }}>
              Nossos Planos
            </h2>
            <p className="body-large" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Escolha o plano ideal para suas necessidades de investimento. 
              Cada plano foi desenvolvido para oferecer o máximo retorno com segurança.
            </p>
          </div>

          <div className="plans-grid">
            {/* Pessoa Física Plan */}
            <div className="plan-card">
              <div className="plan-header">
                <h3 className="plan-title">Pessoa Física</h3>
                <div className="plan-price">
                  <span className="price-amount">R$ 35</span>
                  <span className="price-period">/mês</span>
                </div>
                <div className="plan-price" style={{ fontSize: '0.9em', opacity: 0.8, marginTop: '0.5rem' }}>
                  <span className="price-amount" style={{ fontSize: '1.5rem' }}>R$ 45</span>
                  <span className="price-period">com acompanhamento Premium</span>
                </div>
                <p className="plan-commission">
                  {plansData.pessoaFisica.commission}
                </p>
              </div>

              <ul className="plan-features">
                {plansData.pessoaFisica.features.slice(0, 4).map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
                <li style={{ fontStyle: 'italic', opacity: 0.8 }}>E muito mais...</li>
              </ul>

              <div style={{ textAlign: 'center' }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => openModal('pessoaFisica')}
                  style={{ width: '100%' }}
                >
                  Saiba Mais
                </button>
              </div>
            </div>

            {/* Empresa Plan */}
            <div className="plan-card">
              <div className="plan-header">
                <h3 className="plan-title">Empresa</h3>
                <div className="plan-price">
                  <span className="price-amount">R$ 100</span>
                  <span className="price-period">/mês</span>
                </div>
                <p className="body-small" style={{ margin: '0.5rem 0' }}>
                  {plansData.empresa.subtitle}
                </p>
                <p className="plan-commission">
                  {plansData.empresa.commission}
                </p>
              </div>

              <ul className="plan-features">
                {plansData.empresa.features.slice(0, 4).map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
                <li style={{ fontStyle: 'italic', opacity: 0.8 }}>E muito mais...</li>
              </ul>

              <div style={{ textAlign: 'center' }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => openModal('empresa')}
                  style={{ width: '100%' }}
                >
                  Saiba Mais
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-links">
              <a href="#" className="footer-link" onClick={handleWhatsAppContact}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.531 3.304"/>
                </svg>
                WhatsApp: {contactInfo.whatsapp}
              </a>
              <a href="#" className="footer-link" onClick={handleInstagramClick}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </a>
            </div>
            <p className="footer-copyright">
              © 2025 Vertex Investimentos. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Plan Modal */}
      <PlanModal 
        plan={selectedPlan}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default App;