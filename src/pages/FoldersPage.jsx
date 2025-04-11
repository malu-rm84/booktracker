import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FaFolder, FaEdit, FaTrash, FaPlus, FaBook, FaTimes } from 'react-icons/fa';
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
    books: []
  });

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
      setFormData({ name: '', description: '', books: [] });
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
      books: folder.books || []
    });
    setShowForm(true);
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
      <div className="delete-modal-content">
        <h3>Confirmar Exclusão</h3>
        <p>Tem certeza que deseja excluir esta pasta permanentemente?</p>
        <div className="modal-actions">
          <button className="btn-confirm" onClick={handleDelete}>
            Confirmar
          </button>
          <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </button>
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
                  setFormData({ name: '', description: '', books: [] });
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
                    setFormData({ name: '', description: '', books: [] });
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
          <div key={folder.id} className="folder-card">
            <div className="folder-header">
              <FaFolder className="folder-icon" />
              <h3>{folder.name} ({folder.books?.length || 0})</h3>
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
                onClick={() => handleEdit(folder)} 
                className="btn-primary"
              >
                <FaEdit /> Editar
              </button>
              <button 
                onClick={() => {
                setSelectedFolderId(folder.id);
                setShowDeleteModal(true);
                    }} 
                    className="btn-primary"
                    title="Remover"
                >
                <FaTrash /> Excluir
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
    </div>
  );
}