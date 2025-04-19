import { useNavigate, Link } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import '../styles/login.css';
import { FaGoogle, FaArrowLeft } from 'react-icons/fa';

export default function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (error) {
      console.error("Erro no login:", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="app-logo">
          <span className="book-icon">📚</span>
          <h1>BookTracker</h1>
        </div>
        
        <h2>Bem-vindo de volta</h2>
        <p className="login-subtitle">Continue sua jornada literária</p>
        
        <button className="google-login-btn" onClick={handleGoogleLogin}>
          <FaGoogle className="google-icon" />
          <span>Entrar com Google</span>
        </button>
        
        <Link to="/" className="back-link">
          <FaArrowLeft /> Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
}