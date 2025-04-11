import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FaHome, FaPlus, FaBook, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import '../styles/layout.css';

export default function Layout() {
  const user = auth.currentUser;
  const navigate = useNavigate();

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
      <aside className="sidebar">
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
          <NavLink to="/dashboard" className="nav-item">
            <FaHome className="nav-icon" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/add-book" className="nav-item">
            <FaPlus className="nav-icon" />
            <span>Adicionar Livro</span>
          </NavLink>
          <NavLink to="/collection" className="nav-item">
            <FaBook className="nav-icon" />
            <span>Coleção</span>
          </NavLink>
          <NavLink to="/profile" className="nav-item">
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