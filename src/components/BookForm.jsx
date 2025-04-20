import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { FaSearch, FaBook, FaStar, FaSpinner, FaPlus, FaStarHalfAlt } from 'react-icons/fa';
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
    averageRating: 0,
    startDate: '',
    endDate: '',
    progress: 0
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
          const secureImages = data.images?.map(url => 
            url.replace('http://', 'https://')
               .replace('http:', 'https:')
          ) || [];
          
          setFormData(prev => ({
            ...prev,
            title: data.title || prev.title,
            author: data.authors || prev.author,
            genre: data.genres || prev.genre,
            synopsis: data.description || 'Sem descrição disponível',
            pages: data.pageCount || 0,
            cover: secureImages[0] || prev.cover,
            averageRating: data.averageRating || 0
          }));
          setSearchResults(secureImages);
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
      userId: auth.currentUser?.uid,
      pages: Number(formData.pages),
      progress: Number(formData.progress)
    });
  };

  const renderRatingStars = (value) => {
    const sanitizedValue = Math.min(Math.max(Number(value) || 0, 0), 5);
    const fullStars = Math.floor(sanitizedValue);
    const hasHalfStar = sanitizedValue % 1 >= 0.5;
    const emptyStars = Math.max(5 - fullStars - (hasHalfStar ? 1 : 0), 0);

    return (
      <div className="rating-container">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="rating-star filled" />
        ))}
        {hasHalfStar && <FaStarHalfAlt className="rating-star half-filled" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaStar key={`empty-${i}`} className="rating-star empty" />
        ))}
      </div>
    );
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
                      onClick={() => setFormData({ ...formData, cover })}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="book-details">
            <div className="input-group">
              <label className="input-label">Título
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="text-input"
                  required
                />
              </label>
            </div>

            <div className="input-group">
              <label className="input-label">Autor
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="text-input"
                />
              </label>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Gênero
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="text-input"
                  />
                </label>
              </div>
              <div className="input-group">
                <label className="input-label">Páginas
                  <input
                    type="number"
                    value={formData.pages || ''}
                    onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) || 0 })}
                    className="number-input"
                  />
                </label>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Sinopse
                <textarea
                  value={formData.synopsis}
                  onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                  className="synopsis-textarea"
                  rows="5"
                />
              </label>
            </div>

            <div className="input-group">
              <label className="input-label">Nota Média
                {renderRatingStars(formData.averageRating)}
              </label>
            </div>
          </div>
        </div>

        <div className="form-controls">
          <div className="status-rating-container">
            <div className="input-group">
              <label className="input-label">Status
              <select
                value={formData.status}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  const updates = { status: newStatus };
                  
                  if (newStatus === 'Concluído') {
                    updates.progress = formData.pages;
                  }
                  
                  setFormData({ ...formData, ...updates });
                }}
                className="status-select"
              >
                  <option value="Não iniciado">Não Iniciado</option>
                  <option value="Em andamento">Em Andamento</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Abandonado">Abandonado</option>
                </select>
              </label>
            </div>

            {(formData.status === 'Em andamento' || formData.status === 'Abandonado' || formData.status === 'Concluído') && (
              <div className="input-group">
                <label className="input-label">Página Atual
                  <div className="progress-input-container">
                    <input
                      type="number"
                      min="0"
                      max={formData.pages}
                      value={formData.progress}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        progress: Math.min(parseInt(e.target.value) || 0, formData.pages)
                      })}
                      className="progress-input"
                      placeholder="Página atual"
                    />
                    <span className="pages-total">/ {formData.pages}</span>
                  </div>
                </label>
                <div className="progress-container">
                  {(formData.progress / (formData.pages || 1)) * 100 > 0 && (
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${Math.round((formData.progress / (formData.pages || 1)) * 100)}%` 
                      }}
                    ></div>
                  )}
                </div>

                <div className="progress-info">
                  Progresso: {Math.round((formData.progress / (formData.pages || 1)) * 100) || 0}%
                </div>
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Data de Início
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="text-input"
                />
              </label>
            </div>

            {formData.status === 'Concluído' && (
              <div className="input-group">
                <label className="input-label">Data de Término
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="text-input"
                  />
                </label>
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Sua Avaliação
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  className="number-input"
                />
                {renderRatingStars(formData.rating)}
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