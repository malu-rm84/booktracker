import { Link } from 'react-router-dom';
import '../styles/landing.css';

export default function LandingPage() {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <h1>📚 BookTracker</h1>
        <p>Sua biblioteca pessoal digital</p>
      </header>

      <section className="features">
        <div className="feature-card">
          <h2>Organize sua coleção</h2>
          <p>Acompanhe todos os seus livros em um único lugar</p>
        </div>
        
        <div className="feature-card">
          <h2>Estatísticas detalhadas</h2>
          <p>Veja seus hábitos de leitura em gráficos</p>
        </div>

        <div className="feature-card">
          <h2>Acesso em qualquer lugar</h2>
          <p>Sincronização automática entre dispositivos</p>
        </div>
      </section>

      <div className="cta-section">
        <Link to="/login" className="cta-button">
          Começar Agora
        </Link>
      </div>
    </div>
  );
}