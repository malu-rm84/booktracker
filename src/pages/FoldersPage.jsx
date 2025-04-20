import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FaFolder, FaEdit, FaTrash, FaPlus, FaBook, FaTimes, FaStar } from 'react-icons/fa';
import '../styles/folders.css';

export default function FoldersPage() {
  const [folders, setFolders] = useState([]);
  const [books, setBooks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    books: [],
    notes: ''
  });
  const [viewingFolder, setViewingFolder] = useState(null);
  const [folderNotes, setFolderNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userDocRef = doc(db, 'users', user.uid);
        
        // Carregar pastas
        const foldersRef = collection(userDocRef, 'folders');
        const foldersSnapshot = await getDocs(foldersRef);
        setFolders(foldersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Carregar livros
        const booksRef = collection(userDocRef, 'books');
        const booksSnapshot = await getDocs(booksRef);
        setBooks(booksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          cover: doc.data().cover || '',
          title: doc.data().title || 'Livro sem título'
        })));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !formData.name) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const foldersRef = collection(userDocRef, 'folders');

      if (editingFolder) {
        const folderRef = doc(foldersRef, editingFolder.id);
        await updateDoc(folderRef, formData);
        setFolders(folders.map(f => f.id === editingFolder.id ? { ...formData, id: f.id } : f));
      } else {
        const newFolder = await addDoc(foldersRef, {
          ...formData,
          createdAt: new Date()
        });
        setFolders([...folders, { id: newFolder.id, ...formData }]);
      }

      setShowForm(false);
      setEditingFolder(null);
      setFormData({ name: '', description: '', books: [], notes: '' });
    } catch (error) {
      console.error('Erro ao salvar pasta:', error);
      alert('Erro ao salvar! Verifique suas permissões e conexão.');
    }
  };

  const handleDelete = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const folderRef = doc(db, 'users', user.uid, 'folders', selectedFolderId);
      await deleteDoc(folderRef);
      setFolders(folders.filter(f => f.id !== selectedFolderId));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Erro ao excluir pasta:', error);
      setShowDeleteModal(false);
    }
  };

  const handleEdit = (folder) => {
    setEditingFolder(folder);
    setFormData({
      name: folder.name,
      description: folder.description,
      books: folder.books || [],
      notes: folder.notes || ''
    });
    setShowForm(true);
  };

  const handleViewFolder = (folder) => {
    setViewingFolder(folder);
    setFolderNotes(folder.notes || '');
  };

  const handleSaveNotes = async () => {
    if (!viewingFolder) return;
    
    setIsSavingNotes(true);
    try {
      const user = auth.currentUser;
      const folderRef = doc(db, 'users', user.uid, 'folders', viewingFolder.id);
      await updateDoc(folderRef, { notes: folderNotes });
      
      setFolders(folders.map(f => 
        f.id === viewingFolder.id ? { ...f, notes: folderNotes } : f
      ));
      setViewingFolder({ ...viewingFolder, notes: folderNotes });
    } catch (error) {
      console.error('Erro ao salvar anotações:', error);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const toggleBookSelection = (bookId) => {
    setFormData(prev => ({
      ...prev,
      books: prev.books.includes(bookId)
        ? prev.books.filter(id => id !== bookId)
        : [...prev.books, bookId]
    }));
  };

  const DeleteConfirmationModal = () => (
    <div className="delete-modal">
      <div className="modal-content">
        <h3>Confirmar Exclusão</h3>
        <p>Tem certeza que deseja excluir esta pasta permanentemente?</p>
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

  const FolderViewModal = () => (
    <div className="folder-view-modal">
      <div className="folder-view-content">
        <div className="folder-view-header">
          <div className="folder-view-title">
            <FaFolder size={24} />
            <h2>{viewingFolder?.name}</h2>
          </div>
          <button 
            onClick={() => setViewingFolder(null)} 
            className="close-btn"
            aria-label="Fechar"
          >
            <FaTimes />
          </button>
        </div>
        
        {viewingFolder?.description && (
          <div className="folder-view-description">
            {viewingFolder.description}
          </div>
        )}
        
        <h3>Livros nesta pasta ({viewingFolder?.books?.length || 0})</h3>
        <div className="folder-view-books">
          {books
            .filter(book => viewingFolder?.books?.includes(book.id))
            .map(book => (
              <div 
                key={book.id} 
                className="folder-view-book"
                onClick={() => navigate(`/collection?editBook=${book.id}`)}
                style={{ cursor: 'pointer' }}
              >
                {book.cover ? (
                  <img 
                    src={book.cover} 
                    alt={book.title} 
                    className="folder-view-book-cover"
                  />
                ) : (
                  <div className="thumbnail-placeholder">
                    <FaBook size={32} />
                  </div>
                )}
                <h4 className="folder-view-book-title">{book.title}</h4>
                {book.status && (
                  <span className={`status-badge ${book.status.toLowerCase().replace(' ', '-')} folder-view-book-status`}>
                    {book.status}
                  </span>
                )}
                {book.rating > 0 && (
                  <div className="folder-view-book-rating">
                    {[...Array(5)].map((_, i) => (
                      <FaStar 
                        key={i} 
                        color={i < Math.round(book.rating) ? '#ffd700' : '#e0e0e0'} 
                        size={14} 
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
        
        <div className="folder-view-notes">
          <h3>Anotações da Pasta</h3>
          <textarea
            value={folderNotes}
            onChange={(e) => setFolderNotes(e.target.value)}
            placeholder="Adicione suas anotações sobre esta pasta..."
          />
          <div className="form-actions" style={{ marginTop: '1rem' }}>
            <button 
              type="button" 
              className="btn-cancel"
              onClick={() => setViewingFolder(null)}
            >
              Fechar
            </button>
            <button 
              type="button" 
              className="btn-confirm"
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
            >
              {isSavingNotes ? 'Salvando...' : 'Salvar Anotações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="folders-container">
      <div className="folders-header">
        <h1><FaFolder /> Minhas Pastas</h1>
        <button 
          onClick={() => setShowForm(true)} 
          className="btn-primary"
          aria-label="Criar nova pasta"
        >
          <FaPlus /> Nova Pasta
        </button>
      </div>

      {showForm && (
        <div className="folder-form-modal">
          <div className="folder-form-content">
            <div className="form-header">
              <h2>{editingFolder ? 'Editar Pasta' : 'Nova Pasta'}</h2>
              <button 
                onClick={() => {
                  setShowForm(false);
                  setEditingFolder(null);
                  setFormData({ name: '', description: '', books: [], notes: '' });
                }} 
                className="close-btn"
                aria-label="Fechar"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="folder-name">Nome da Pasta *</label>
                <input
                  id="folder-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  maxLength="50"
                  placeholder="Digite o nome da pasta"
                />
              </div>

              <div className="form-group">
                <label htmlFor="folder-description">Descrição</label>
                <textarea
                  id="folder-description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  maxLength="200"
                  placeholder="Adicione uma descrição para a pasta"
                />
              </div>

              <div className="form-group">
                <label>Selecionar Livros</label>
                <div className="books-selection">
                  {books.length > 0 ? books.map(book => (
                    <label key={book.id} className="book-selection-item">
                      <input
                        type="checkbox"
                        checked={formData.books.includes(book.id)}
                        onChange={() => toggleBookSelection(book.id)}
                        className="hidden-checkbox"
                      />
                      <div className="book-select-card">
                        {book.cover ? (
                          <img 
                            src={book.cover} 
                            alt={book.title} 
                            className="book-select-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="cover-placeholder">
                            <FaBook className="placeholder-icon" />
                          </div>
                        )}
                        <span className="book-select-title">{book.title}</span>
                      </div>
                    </label>
                  )) : (
                    <p>Nenhum livro disponível para adicionar à pasta.</p>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => {
                    setShowForm(false);
                    setEditingFolder(null);
                    setFormData({ name: '', description: '', books: [], notes: '' });
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-confirm"
                >
                  {editingFolder ? 'Salvar Alterações' : 'Criar Pasta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="folders-grid">
        {folders.map(folder => (
          <div 
            key={folder.id} 
            className="folder-card"
            data-book-count={folder.books?.length || 0}
          >
            <div className="folder-header">
              <FaFolder className="folder-icon" />
              <h3>{folder.name}</h3>
            </div>
            
            {folder.description && (
              <p className="folder-description">{folder.description}</p>
            )}

            <div className="folder-books">
              <div className="books-list">
                {books
                  .filter(book => folder.books?.includes(book.id))
                  .map(book => (
                    <div key={book.id} className="book-item">
                      {book.cover ? (
                        <img 
                          src={book.cover} 
                          alt={book.title} 
                          className="book-thumbnail"
                        />
                      ) : (
                        <div className="thumbnail-placeholder">
                          <FaBook />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            <div className="folder-actions">
              <button 
                onClick={() => handleViewFolder(folder)} 
                title="Visualizar"
                aria-label="Visualizar pasta"
              >
                <FaBook className="icon" />
              </button>
              <button 
                onClick={() => handleEdit(folder)} 
                title="Editar"
                aria-label="Editar pasta"
              >
                <FaEdit className="icon" />
              </button>
              <button 
                onClick={() => {
                  setSelectedFolderId(folder.id);
                  setShowDeleteModal(true);
                }} 
                title="Excluir"
                aria-label="Excluir pasta"
              >
                <FaTrash className="icon" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {folders.length === 0 && !showForm && (
        <div className="empty-state">
          <FaFolder size={64} />
          <p>Nenhuma pasta criada ainda</p>
        </div>
      )}

      {showDeleteModal && <DeleteConfirmationModal />}
      {viewingFolder && <FolderViewModal />}
    </div>
  );
}