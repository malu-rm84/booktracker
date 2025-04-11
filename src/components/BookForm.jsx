import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { FaSearch, FaBook, FaStar, FaSpinner, FaPlus } from 'react-icons/fa';
import { auth } from '../firebase';
import '../styles/bookform.css';

export default function BookForm({ onSubmit, loading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    pages: 0,
    synopsis: '',
    cover: '',
    status: 'Não iniciado',
    rating: 0
  });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchBookData = async () => {
      if (!debouncedSearchTerm) return;
      
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(debouncedSearchTerm)}&maxResults=1&orderBy=relevance`
        );
        
        if (!response.ok) throw new Error('Livro não encontrado');
        
        const data = await response.json();
        const firstResult = data.items?.[0]?.volumeInfo;

        if (firstResult) {
          setFormData(prev => ({
            ...prev,
            title: firstResult.title || '',
            author: firstResult.authors?.join(', ') || 'Autor desconhecido',
            genre: firstResult.categories?.[10] || 'Gênero não especificado',
            pages: firstResult.pageCount || 0,
            synopsis: firstResult.synopsis || 'Sem descrição disponível',
            cover: firstResult.imageLinks?.thumbnail || ''
          }));
        }
      } catch (error) {
        console.error('Erro na busca:', error);
        alert('Nenhum livro encontrado. Preencha os dados manualmente.');
      }
      setIsSearching(false);
    };

    fetchBookData();
  }, [debouncedSearchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) {
      alert('Por favor, insira pelo menos o título do livro');
      return;
    }
    onSubmit({
      ...formData,
      userId: auth.currentUser?.uid
    });
  };

  return (
    <form onSubmit={handleSubmit} className="book-form">
      <div className="search-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Digite o nome do livro"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {isSearching ? (
            <div className="loading-spinner"></div>
          ) : (
            <FaSearch className="search-icon" />
          )}
        </div>
      </div>

      <div className="form-container">
        <div className="book-preview">
          <div className="cover-container">
            {formData.cover ? (
              <img src={formData.cover} alt="Capa do livro" className="book-cover" />
            ) : (
              <div className="cover-placeholder">
                <FaBook className="placeholder-icon" />
              </div>
            )}
          </div>
          
          <div className="book-details">
            <div className="input-group">
              <label className="input-label">
                Título
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="text-input"
                  required
                />
              </label>
            </div>

            <div className="input-group">
              <label className="input-label">
                Autor
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                  className="text-input"
                />
              </label>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="input-label">
                  Gênero
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData({...formData, genre: e.target.value})}
                    className="text-input"
                  />
                </label>
              </div>

              <div className="input-group">
                <label className="input-label">
                  Páginas
                  <input
                    type="number"
                    value={formData.pages || ''}
                    onChange={(e) => setFormData({...formData, pages: parseInt(e.target.value) || 0})}
                    className="number-input"
                  />
                </label>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">
                Sinopse
                <textarea
                  value={formData.synopsis}
                  onChange={(e) => setFormData({...formData, synopsis: e.target.value})}
                  className="synopsis-textarea"
                  rows="5"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="form-controls">
          <div className="status-rating-container">
            <div className="input-group">
              <label className="input-label">
                Status
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="status-select"
                >
                  <option value="Não iniciado">Não Iniciado</option>
                  <option value="Em andamento">Em Andamento</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Abandonado">Abandonado</option>
                </select>
              </label>
            </div>

            <div className="input-group">
              <label className="input-label">
                Avaliação
                <div className="rating-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                      key={star}
                      className={`rating-star ${star <= formData.rating ? 'filled' : 'empty'}`}
                      onClick={() => setFormData({...formData, rating: star})}
                  />
                  ))}
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={loading || isSearching}
          >
            {loading ? (
              <>
                <FaSpinner className="button-spinner" />
                Salvando...
              </>
            ) : (
              <>
                <FaPlus className="button-icon" />
                Adicionar à Coleção
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}