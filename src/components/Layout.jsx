import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FaHome, FaPlus, FaBook, FaUser, FaSignOutAlt, FaFolder, FaBars, FaTimes } from 'react-icons/fa';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import '../styles/layout.css';

export default function Layout() {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 968);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 968);
      if (window.innerWidth > 968) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close menu when clicking on a navigation link on mobile
  const handleNavClick = () => {
    if (isMobile) {
      setMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao sair da conta! Tente novamente.');
    }
  };

  return (
    <div className="app-container">
      {isMobile && (
        <button 
          className="menu-toggle" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      )}
  
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="user-info">
          <img 
            src={user?.photoURL || '/default-user.png'} 
            alt="Foto do usuário" 
            className="user-photo"
          />
          <div className="user-details">
            <span className="user-name">{user?.displayName || 'Usuário'}</span>
            <button onClick={handleLogout} className="logout-button">
              <FaSignOutAlt /> Sair
            </button>
          </div>
        </div>

        <nav className="nav-menu">
          <NavLink to="/dashboard" className="nav-item" onClick={handleNavClick}>
            <FaHome className="nav-icon" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/add-book" className="nav-item" onClick={handleNavClick}>
            <FaPlus className="nav-icon" />
            <span>Adicionar Livro</span>
          </NavLink>
          <NavLink to="/collection" className="nav-item" onClick={handleNavClick}>
            <FaBook className="nav-icon" />
            <span>Coleção</span>
          </NavLink>
          <NavLink to="/folders" className="nav-item" onClick={handleNavClick}>
            <FaFolder className="nav-icon" />
            <span>Pastas</span>
          </NavLink>
          <NavLink to="/profile" className="nav-item" onClick={handleNavClick}>
            <FaUser className="nav-icon" />
            <span>Perfil</span>
          </NavLink>
        </nav>
      </aside>
      
      <main className="main-content">
      <Outlet />
    </main>
  </div>
  );
}