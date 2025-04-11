import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import '../styles/login.css';

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
        <h2>Faça login para continuar</h2>
        <button className="google-login-btn" onClick={handleGoogleLogin}>
          <img src="google-icon.svg" alt="Google" />
          Entrar com Google
        </button>
        <p className="back-link">
          <a href="/">← Voltar para a página inicial</a>
        </p>
      </div>
    </div>
  );
}