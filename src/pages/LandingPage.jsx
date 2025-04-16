import { Link } from 'react-router-dom';
import '../styles/landing.css';
import { FaBook, FaChartBar, FaMobileAlt } from 'react-icons/fa';

export default function LandingPage() {
  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="logo">
          <span className="book-icon">📚</span> BookTracker
        </div>
        <div className="nav-links">
          <Link to="/login" className="login-link">Login</Link>
        </div>
      </nav>

      <header className="landing-header">
        <div className="header-content">
          <h1>BookTracker</h1>
          <p className="tagline">Organize, acompanhe e descubra sua jornada literária</p>
          <Link to="/login" className="cta-button">
            Começar Agora
          </Link>
        </div>
        <div className="header-image">
          <div className="book-stack-image"></div>
        </div>
      </header>

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">
            <FaBook />
          </div>
          <h2>Organize sua coleção</h2>
          <p>Cadastre todos os seus livros em um só lugar e acompanhe seu progresso de leitura com facilidade.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">
            <FaChartBar />
          </div>
          <h2>Estatísticas detalhadas</h2>
          <p>Visualize seus hábitos de leitura com gráficos interativos e descubra padrões interessantes.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <FaMobileAlt />
          </div>
          <h2>Acesso em qualquer lugar</h2>
          <p>Use em qualquer dispositivo com sincronização automática para nunca perder seus dados.</p>
        </div>
      </section>

      <section className="testimonials">
        <h2>O que nossos usuários dizem</h2>
        <div className="testimonial-grid">
          <div className="testimonial-card">
            <p>"BookTracker revolucionou minha forma de gerenciar livros. Agora sei exatamente quanto tempo levo para terminar cada leitura!"</p>
            <div className="testimonial-author">Maria S.</div>
          </div>
          <div className="testimonial-card">
            <p>"As estatísticas me ajudaram a estabelecer metas de leitura realistas. Já li 30% mais livros este ano!"</p>
            <div className="testimonial-author">João P.</div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="cta-section">
          <h2>Pronto para organizar sua biblioteca?</h2>
          <Link to="/login" className="cta-button">
            Criar conta grátis
          </Link>
        </div>
        <div className="footer-info">
          <p>&copy; 2025 BookTracker. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}