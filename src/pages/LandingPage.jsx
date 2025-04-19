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
          <div className="header-image">
            <div className="book-shelf">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
                {/* Estante */}
                <path fill="#5f6c7b" d="M20 280h360v20H20z"/>
                
                {/* Livros */}
                <g transform="translate(50 80)">
                  {/* Livro 1 */}
                  <path fill="#4361ee" d="M0 0h40v200H0z"/>
                  <path fill="#3f37c9" d="M0 0h40v20H0z"/>
                  
                  {/* Livro 2 */}
                  <path fill="#4cc9f0" transform="translate(60)" d="M0 0h35v180H0z"/>
                  <path fill="#3a86ff" d="M60 0h35v15H60z"/>
                  
                  {/* Livro 3 */}
                  <path fill="#ff6b6b" transform="translate(110)" d="M0 0h30v220H0z"/>
                  <path fill="#d62828" d="M110 0h30v18H110z"/>
                  
                  {/* Livro 4 (inclinado) */}
                  <g transform="rotate(-5 280 100)">
                    <path fill="#94d2bd" d="M180 20h40v190h-40z"/>
                    <path fill="#0a9396" d="M180 20h40v15h-40z"/>
                  </g>
                  
                  {/* Livro 5 (aberto) */}
                  <g transform="translate(240 30)">
                    <path fill="#f4a261" d="M0 0h50v160H0z"/>
                    <path fill="#e76f51" d="M0 0h50v20H0z"/>
                    <path fill="#e9c46a" d="M25 0h25v160H25z"/>
                  </g>
                </g>
                
                {/* Detalhes */}
                <path fill="#4a4e69" d="M50 260h300v10H50z" opacity="0.5"/>
                <circle cx="380" cy="270" r="8" fill="#4cc9f0"/>
              </svg>
            </div>
          </div>
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

      {/* <section className="testimonials">
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
      </section> */}

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