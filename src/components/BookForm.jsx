import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { FaSearch, FaBook, FaStar, FaSpinner, FaPlus } from 'react-icons/fa';
import { auth } from '../firebase';
import { fetchBookData } from '../services/bookApi';
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
    rating: 0,
    startDate: '',
    endDate: ''
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchBook = async () => {
      if (!debouncedSearchTerm) return;
      setIsSearching(true);
      try {
        const data = await fetchBookData(debouncedSearchTerm);
        if (data) {
          setFormData(prev => ({
            ...prev,
            title: data.title || prev.title,
            author: data.authors || prev.author,
            genre: data.genres || prev.genre,
            synopsis: data.description || 'Sem descrição disponível',
            pages: data.pageCount || 0,
            cover: data.images?.[0] || prev.cover
          }));
          setSearchResults(data.images || []);
        }
      } catch (error) {
        console.error('Erro na busca:', error);
      }
      setIsSearching(false);
    };

    fetchBook();
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
            placeholder="Digite o nome do livro para buscar"
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

            {searchResults.length > 0 && (
              <div className="cover-options-grid">
                <h4>Selecione uma capa:</h4>
                <div className="cover-options">
                  {searchResults.map((cover, index) => (
                    <img
                      key={index}
                      src={cover}
                      alt={`Opção de capa ${index + 1}`}
                      className={`cover-option ${formData.cover === cover ? 'selected' : ''}`}
                      onClick={() => setFormData({...formData, cover})}
                    />
                  ))}
                </div>
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
                  {formData.pages === 0 && (
                    <p style={{ color: 'orange' }}>⚠️ Número de páginas não disponível.</p>
                  )}
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
                Data de Início
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="text-input"
                />
              </label>
            </div>

            {formData.status === 'Concluído' && (
              <div className="input-group">
                <label className="input-label">
                  Data de Término
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="text-input"
                  />
                </label>
              </div>
            )}

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
                <FaSpinner className="button-spinner" /> Salvando...
              </>
            ) : (
              <>
                <FaPlus className="button-icon" /> Adicionar à Coleção
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
