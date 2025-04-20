import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { collection, doc, getDocs, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { FaHeart, FaRegHeart, FaStar, FaTrash, FaSort, FaFilter, FaBook, FaEdit, FaStarHalfAlt } from 'react-icons/fa';
import '../styles/collection.css';
import { fetchBookData } from '../services/bookApi';

export default function Collection() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [genres, setGenres] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showCoverSelector, setShowCoverSelector] = useState(false);
  const [coverSearchResults, setCoverSearchResults] = useState([]);
  const [isSearchingCovers, setIsSearchingCovers] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    status: '',
    rating: 0,
    averageRating: 0,
    notes: '',
    cover: '',
    synopsis: '',
    pages: 0,
    progress: 0,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('Usuário não autenticado');

        const userRef = doc(db, 'users', user.uid);
        const booksRef = collection(userRef, 'books');
        const q = query(booksRef);
        const querySnapshot = await getDocs(q);

        const booksData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setBooks(booksData);
        extractGenres(booksData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const extractGenres = (books) => {
      const uniqueGenres = [...new Set(books.map(book => book.genre))];
      setGenres(uniqueGenres.filter(genre => genre && genre !== ''));
    };

    fetchBooks();
  }, []);

  const handleCoverSearch = async () => {
    try {
      setIsSearchingCovers(true);
      const data = await fetchBookData(formData.title);
      
      const validCovers = data?.images?.map(url => 
        url.replace('http://', 'https://') // Forçar HTTPS
           .replace('http:', 'https:') // Extra replace para garantir
      ).filter(url => 
        url.startsWith('https://') && 
        (url.includes('googleapis') || 
        url.includes('openlibrary.org'))
      ) || [];
      
      setCoverSearchResults(validCovers);
    } catch (error) {
      console.error('Erro na busca de capas:', error);
      setCoverSearchResults([]);
    } finally {
      setIsSearchingCovers(false);
    }
  };
  
  const handleCoverChange = (newCover) => {
    setFormData(prev => ({ ...prev, cover: newCover }));
    setShowCoverSelector(false);
  };

  const handleFavorite = async (bookId) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const bookRef = doc(db, 'users', user.uid, 'books', bookId);
      const book = books.find(b => b.id === bookId);
      await updateDoc(bookRef, { favorite: !book.favorite });

      setBooks(books.map(book =>
        book.id === bookId ? { ...book, favorite: !book.favorite } : book
      ));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const bookRef = doc(db, 'users', user.uid, 'books', selectedBookId);
      const foldersRef = collection(db, 'users', user.uid, 'folders');
      const foldersSnapshot = await getDocs(foldersRef);
      
      const updatePromises = foldersSnapshot.docs.map(async (folderDoc) => {
        const folderData = folderDoc.data();
        if (folderData.books?.includes(selectedBookId)) {
          const updatedBooks = folderData.books.filter(id => id !== selectedBookId);
          await updateDoc(folderDoc.ref, { books: updatedBooks });
        }
      });

      await Promise.all(updatePromises);
      await deleteDoc(bookRef);
      setBooks(books.filter(book => book.id !== selectedBookId));
      setShowDeleteModal(false);
    } catch (error) {
      setError(error.message);
      setShowDeleteModal(false);
    }
  };

  const handleEditClick = (book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      genre: book.genre,
      status: book.status,
      rating: book.rating || 0,
      averageRating: book.averageRating || 0,
      notes: book.notes || '',
      cover: book.cover || '',
      synopsis: book.synopsis || '',
      pages: book.pages || 0,
      progress: book.progress || 0,
      startDate: book.startDate || '',
      endDate: book.endDate || ''  
    });
    setShowEditModal(true);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRatingChange = (newRating) => {
    setFormData({ ...formData, rating: newRating });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user || !selectedBook) return;

      const bookRef = doc(db, 'users', user.uid, 'books', selectedBook.id);
      await updateDoc(bookRef, {
        ...formData,
        cover: formData.cover,
        pages: Number(formData.pages),
        progress: Number(formData.progress)
      });

      setBooks(books.map(book =>
        book.id === selectedBook.id ? { ...book, ...formData } : book
      ));
      setShowEditModal(false);
    } catch (error) {
      setError(error.message);
      setShowEditModal(false);
    }
  };

  const renderRatingStars = (value) => {
    const sanitizedValue = Math.min(Math.max(Number(value) || 0, 0), 5);
    const fullStars = Math.floor(sanitizedValue);
    const hasHalfStar = sanitizedValue % 1 >= 0.5 && sanitizedValue < 5;
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

  const filteredBooks = books
    .filter(book =>
      (statusFilter === 'all' || book.status === statusFilter) &&
      (genreFilter === 'all' || book.genre === genreFilter)
    )
    .sort((a, b) => {
      if (sortBy === 'title') return sortOrder === 'asc'
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
      if (sortBy === 'rating') return sortOrder === 'asc'
        ? a.rating - b.rating
        : b.rating - a.rating;
      return 0;
    });

  const deleteConfirmationModal = () => (
    <div className="delete-modal">
      <div className="modal-content">
        <h3>Confirmar exclusão</h3>
        <p>Tem certeza que deseja remover este livro da sua coleção?</p>
        <div className="modal-actions">
          <button className="modal-button confirm" onClick={handleDelete}>
            Confirmar
          </button>
          <button className="modal-button cancel" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );

  const editModal = () => (
    <div className="edit-modal">
      <div className="edit-form">
        <h3 className="edit-form-title">Editar Livro</h3>

        <div className="book-info-header">
          {formData.cover ? (
            <img src={formData.cover} alt="Capa" className="book-info-cover" />
          ) : (
            <div className="cover-placeholder book-info-cover">
              <FaBook size={24} />
            </div>
          )}
          <div className="book-info-text">
            <h4 className="book-title">{formData.title}</h4>
            <p className="book-author">por {formData.author}</p>
            <div className="book-meta-info">
              <p className="book-genre">Gênero: {formData.genre || 'Não informado'}</p>
              <div className="book-rating">
                <span>Nota Média:</span> 
                {renderRatingStars(formData.averageRating)}
                <span className="rating-value">
                  ({parseFloat(formData.averageRating).toFixed(1)})
                </span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleEditSubmit}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Capa do Livro</label>
              <div className="cover-preview-container">
                {formData.cover ? (
                  <img src={formData.cover} alt="Capa atual" className="current-cover" />
                ) : (
                  <div className="cover-placeholder">
                    <FaBook />
                  </div>
                )}
                
                <button
                  type="button"
                  className="change-cover-button"
                  onClick={() => {
                    setShowCoverSelector(!showCoverSelector);
                    if (!showCoverSelector) handleCoverSearch();
                  }}
                >
                  {showCoverSelector ? 'Fechar Opções' : 'Alterar Capa'}
                </button>
              </div>

              {showCoverSelector && (
                <div className="cover-selector-modal">
                  {isSearchingCovers ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <>
                      <h4>Selecione uma nova capa:</h4>
                      <div className="cover-options-grid">
                        {coverSearchResults.map((cover, index) => (
                          <img
                            key={index}
                            src={cover}
                            alt={`Opção de capa ${index + 1}`}
                            className={`cover-option ${formData.cover === cover ? 'selected' : ''}`}
                            onClick={() => handleCoverChange(cover)}
                          />
                        ))}
                      </div>
                      {coverSearchResults.length === 0 && (
                        <p>Nenhuma capa alternativa encontrada.</p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Título</label>
              <input 
                type="text" 
                name="title"
                value={formData.title} 
                onChange={handleFormChange}
                className="form-input" 
              />
            </div>
            <div className="form-group">
              <label>Autor</label>
              <input 
                type="text" 
                name="author"
                value={formData.author} 
                onChange={handleFormChange}
                className="form-input" 
              />
            </div>
            <div className="form-group">
              <label>Gênero</label>
              <input 
                type="text" 
                name="genre"
                value={formData.genre} 
                onChange={handleFormChange}
                className="form-input" 
              />
            </div>
            <div className="form-group">
              <label>Total de Páginas</label>
              <input
                type="number"
                name="pages"
                value={formData.pages}
                onChange={handleFormChange}
                className="form-input"
                min="0"
              />
            </div>

            <div className="form-group full-width">
              <label>Sinopse</label>
              <div className="synopsis-display">
                {formData.synopsis || 'Nenhuma sinopse disponível'}
              </div>
            </div>
            <div className="form-group">
              <label>Status</label>
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
            </div>

            <div className="form-group">
              <label>Data de Início</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleFormChange}
                className="form-input"
                placeholder="dd/mm/aaaa"
              />
            </div>

            {formData.status === 'Concluído' && (
              <div className="form-group">
                <label>Data de Término</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleFormChange}
                  className="form-input"
                  placeholder="dd/mm/aaaa"
                />
              </div>
            )}

            {(formData.status === 'Em andamento' || formData.status === 'Abandonado' || formData.status === 'Concluído') && (
              <div className="form-group">
                <label>Página Atual</label>
                <div className="progress-input-container">
                <input
                  type="number"
                  value={formData.pages || ''}
                  onChange={(e) => {
                    const newPages = parseInt(e.target.value) || 0;
                    const updates = { pages: newPages };
                    
                    if (formData.status === 'Concluído') {
                      updates.progress = newPages;
                    }
                    
                    setFormData({ ...formData, ...updates });
                  }}
                  className="number-input"
                />
                  <span className="pages-total">/ {formData.pages}</span>
                </div>
                <div className="progress-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${Math.round((formData.progress / formData.pages) * 100) || 0}%` }}
                  ></div>
                </div>
                <div className="progress-info">
                  Progresso: {Math.round((formData.progress / formData.pages) * 100 || 0)}%
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Avaliação</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.5"
                value={formData.rating}
                onChange={(e) => {
                  const rawValue = parseFloat(e.target.value);
                  const validatedValue = Math.min(Math.max(isNaN(rawValue) ? 0 : rawValue, 0), 5);
                  handleRatingChange(validatedValue);
                }}
                className="rating-input"
              />
              <div className="rating-display">
                {renderRatingStars(formData.rating)}
              </div>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Anotações</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleFormChange}
              className="form-input form-textarea"
              placeholder="Adicione suas anotações..."
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="modal-button cancel" onClick={() => setShowEditModal(false)}>
              Cancelar
            </button>
            <button type="submit" className="modal-button confirm">
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (loading) return <div className="loading-screen">Carregando...</div>;
  if (error) return (
    <div className="error-screen">
      <h2>Erro ao carregar dados</h2>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="collection-container">
      <h1 className="collection-title">📚 Sua Coleção</h1>

      <div className="controls">
        <div className="filter-group">
          <FaFilter className="filter-icon" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
            <option value="all">Todos os Status</option>
            <option value="Não iniciado">Não Iniciado</option>
            <option value="Em andamento">Em Andamento</option>
            <option value="Concluído">Concluído</option>
            <option value="Abandonado">Abandonado</option>
          </select>

          <select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)} className="filter-select">
            <option value="all">Todos os Gêneros</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>

        <div className="sort-group">
          <FaSort className="sort-icon" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="title">Ordenar por Título</option>
            <option value="rating">Ordenar por Avaliação</option>
          </select>
          <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="sort-order">
            {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </button>
        </div>
      </div>

      <div className="books-table">
        <table>
          <thead>
            <tr>
              <th>Capa</th>
              <th>Título</th>
              <th>Autor</th>
              <th>Status</th>
              <th>Avaliação</th>
              <th>Progresso</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.length > 0 ? (
              filteredBooks.map(book => (
                <tr key={book.id}>
                  <td>
                    {book.cover ? (
                      <img src={book.cover} alt={book.title} className="book-cover" />
                    ) : (
                      <div className="cover-placeholder">
                        <FaBook />
                      </div>
                    )}
                  </td>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>
                    <span className={`status-badge ${book.status.toLowerCase().replace(' ', '-')}`}>
                      {book.status}
                    </span>
                  </td>
                  <td>{renderRatingStars(book.rating)}</td>
                  <td>
                    {(book.status === 'Em andamento' || book.status === 'Abandonado' || book.status === 'Concluído') && (
                      <>
                        <div className="progress-container">
                          <div 
                            className="progress-bar" 
                            style={{ width: `${Math.round((book.progress / book.pages) * 100) || 0}%` }}
                          ></div>
                        </div>
                        <div className="progress-info">
                          {Math.round((book.progress / book.pages) * 100) || 0}%
                        </div>
                      </>
                    )}
                  </td>
                  <td className="actions-cell">
                    <button onClick={() => handleFavorite(book.id)} className="icon-button" title="Favoritar">
                      {book.favorite ? <FaHeart /> : <FaRegHeart />}
                    </button>
                    <button onClick={() => handleEditClick(book)} className="icon-button" title="Editar">
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBookId(book.id);
                        setShowDeleteModal(true);
                      }}
                      className="icon-button"
                      title="Remover"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-books-message">
                  Nenhum livro encontrado com os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showDeleteModal && deleteConfirmationModal()}
      {showEditModal && editModal()}
    </div>
  );
}