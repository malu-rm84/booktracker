import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaArrowLeft } from 'react-icons/fa';
import { auth } from '../firebase';
import { addBook } from '../services/firestore';
import BookForm from '../components/BookForm';
import '../styles/addbook.css';

export default function AddBook() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (bookData) => {
    setLoading(true);
    try {
      await addBook(auth.currentUser.uid, bookData);
      navigate('/dashboard');
    } catch (error) {
      alert('Erro ao salvar livro: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="add-book-container">
      <div className="form-card">
        <div className="header-section">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft /> Voltar
          </button>
          <h1 className="form-title">
            <FaPlus /> Adicionar Novo Livro
          </h1>
        </div>
        <BookForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}