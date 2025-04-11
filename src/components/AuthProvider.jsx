import { useEffect, useState } from 'react';
import { auth } from '../firebase';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {loading ? (
        <div className="loading-screen">Carregando...</div>
      ) : (
        children
      )}
    </div>
  );
}