import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { collection, doc, getDocs, query, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { 
  FaBook, FaStar, FaHeart, FaPlus, FaBookOpen, FaChartBar, 
  FaSpinner, FaBullseye, FaEdit, FaTrash 
} from 'react-icons/fa';
import '../styles/dashboard.css';

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    read: 0,
    favoriteGenre: 'Nenhum',
    avgRating: 0,
    fastestBook: 'Nenhum',
    mostReadAuthor: 'Nenhum',
    booksThisYear: 0,
    bestReadingMonth: 'Nenhum',
    totalPages: 0,
    booksThisMonth: 0
  });
  const [dynamicStat, setDynamicStat] = useState({ title: '', value: '' });
  const [statIndex, setStatIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({
    type: 'annual',
    target: '',
    progress: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          
          // Carregar livros
          const booksRef = collection(userRef, 'books');
          const booksSnapshot = await getDocs(query(booksRef));
          const booksData = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setBooks(booksData);
          calculateStats(booksData);

          // Carregar metas
          const goalsRef = collection(userRef, 'goals');
          const goalsSnapshot = await getDocs(query(goalsRef));
          const goalsData = goalsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              endDate: data.endDate?.toDate?.().toISOString().split('T')[0] || '',
              createdAt: data.createdAt?.toDate?.().toISOString().split('T')[0] || ''
            };
          });
          setGoals(goalsData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const statsList = [
      { title: 'Livro Mais Rápido', value: stats.fastestBook },
      { title: 'Autor Mais Lido', value: stats.mostReadAuthor },
      { title: 'Livros Lidos Este Ano', value: stats.booksThisYear },
      { title: 'Mês de Maior Leitura', value: stats.bestReadingMonth },
      { title: 'Páginas Lidas Total', value: `${stats.totalPages} páginas` }
    ];

    const interval = setInterval(() => {
      setStatIndex((prev) => (prev + 1) % statsList.length);
      setDynamicStat(statsList[statIndex]);
    }, 5000);

    return () => clearInterval(interval);
  }, [statIndex, stats]);

  const calculateStats = (books) => {
    const readBooks = books.filter(book => book.status === 'Concluído');
    const ratings = books.map(book => book.rating).filter(r => r > 0);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const genreCounts = books.reduce((acc, book) => {
      acc[book.genre] = (acc[book.genre] || 0) + 1;
      return acc;
    }, {});

    const fastestBook = readBooks.reduce((fastest, book) => {
      if (book.startDate && book.endDate && book.pages) {
        const start = new Date(book.startDate);
        const end = new Date(book.endDate);
        const days = Math.max(1, (end - start) / (1000 * 3600 * 24));
        const speed = Math.round(book.pages / days);
        return speed > fastest.speed ? { title: book.title, speed } : fastest;
      }
      return fastest;
    }, { title: 'Nenhum', speed: 0 });

    const authorCounts = readBooks.reduce((acc, book) => {
      acc[book.author] = (acc[book.author] || 0) + 1;
      return acc;
    }, {});

    const monthCounts = readBooks.reduce((acc, book) => {
      if (book.endDate) {
        const month = new Date(book.endDate).toLocaleString('pt-BR', { month: 'long' });
        acc[month] = (acc[month] || 0) + 1;
      }
      return acc;
    }, {});

    setStats({
      total: books.length,
      read: readBooks.length,
      favoriteGenre: Object.keys(genreCounts).reduce((a, b) => genreCounts[a] > genreCounts[b] ? a : b, 'Nenhum'),
      avgRating: ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0,
      fastestBook: fastestBook.title !== 'Nenhum' ? `${fastestBook.title} (${fastestBook.speed} pgs/dia)` : 'Nenhum',
      mostReadAuthor: Object.keys(authorCounts).reduce((a, b) => authorCounts[a] > authorCounts[b] ? a : b, 'Nenhum'),
      booksThisYear: readBooks.filter(book => 
        book.endDate && new Date(book.endDate).getFullYear() === currentYear
      ).length,
      bestReadingMonth: Object.keys(monthCounts).reduce((a, b) => monthCounts[a] > monthCounts[b] ? a : b, 'Nenhum'),
      totalPages: readBooks.reduce((sum, book) => sum + (book.pages || 0), 0),
      booksThisMonth: readBooks.filter(book => 
        book.endDate && new Date(book.endDate).getMonth() + 1 === currentMonth
      ).length
    });
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      const userRef = doc(db, 'users', user.uid);
      const goalsRef = collection(userRef, 'goals');
      
      const goalData = {
        ...newGoal,
        target: Number(newGoal.target),
        progress: Number(newGoal.progress),
        endDate: Timestamp.fromDate(new Date(newGoal.endDate)),
        createdAt: editingGoal 
          ? Timestamp.fromDate(new Date(editingGoal.createdAt))
          : Timestamp.now(),
        description: newGoal.description
      };

      if (editingGoal) {
        const goalRef = doc(goalsRef, editingGoal.id);
        await updateDoc(goalRef, goalData);
      } else {
        await addDoc(goalsRef, goalData);
      }

      const goalsSnapshot = await getDocs(query(goalsRef));
      const updatedGoals = goalsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          endDate: data.endDate?.toDate?.().toISOString().split('T')[0] || '',
          createdAt: data.createdAt?.toDate?.().toISOString().split('T')[0] || ''
        };
      });
      
      setGoals(updatedGoals);
      setShowGoalModal(false);
      setEditingGoal(null);
      setNewGoal({
        type: 'annual',
        target: '',
        progress: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        description: ''
      });

    } catch (error) {
      console.error('Erro ao salvar meta:', error);
      alert(`Erro: ${error.message}`);
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setNewGoal({
      type: goal.type,
      target: goal.target,
      progress: goal.progress,
      startDate: goal.startDate,
      endDate: goal.endDate,
      description: goal.description
    });
    setShowGoalModal(true);
  };

  const handleDeleteGoal = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      const userRef = doc(db, 'users', user.uid);
      const goalRef = doc(collection(userRef, 'goals'), selectedGoalId);
      
      await deleteDoc(goalRef);
      setGoals(prev => prev.filter(g => g.id !== selectedGoalId));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      alert(`Erro: ${error.message}`);
    }
  };

  const calculateGoalProgress = (goal) => {
    switch(goal.type) {
      case 'annual':
        return Math.min((stats.booksThisYear / goal.target * 100), 100).toFixed(0);
      case 'monthly':
        return Math.min((stats.booksThisMonth / goal.target * 100), 100).toFixed(0);
      default:
        return Math.min((goal.progress / goal.target * 100), 100).toFixed(0);
    }
  };

  const DeleteConfirmationModal = () => (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Confirmar Exclusão</h3>
        <p>Tem certeza que deseja excluir esta meta permanentemente?</p>
        <div className="modal-actions">
          <button 
            className="modal-button cancel"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancelar
          </button>
          <button 
            className="modal-button confirm"
            onClick={handleDeleteGoal}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="loading-container">
        <FaSpinner className="loading-spinner" />
        <p>Carregando estatísticas...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Bem-vindo, {auth.currentUser?.displayName || 'Leitor'}!</h1>
        <div className="quick-actions">
          <Link to="/add-book" className="action-button">
            <FaPlus /> Adicionar Livro
          </Link>
          <Link to="/collection" className="action-button">
            <FaBook /> Minha Coleção
          </Link>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card purple">
          <FaBook className="stat-icon" />
          <h3>Total de Livros</h3>
          <p>{stats.total}</p>
        </div>

        <div className="stat-card dark-purple">
          <FaBookOpen className="stat-icon" />
          <h3>Livros Lidos</h3>
          <p>{stats.read}</p>
        </div>

        <div className="stat-card purple">
          <FaHeart className="stat-icon" />
          <h3>Gênero Favorito</h3>
          <p>{stats.favoriteGenre}</p>
        </div>

        <div className="stat-card dark-purple">
          <FaStar className="stat-icon" />
          <h3>Nota Média</h3>
          <p>{stats.avgRating}/5</p>
        </div>

        <div className="stat-card animated-card">
          <FaChartBar className="stat-icon" />
          <h3>{dynamicStat.title}</h3>
          <p>{dynamicStat.value}</p>
        </div>
      </div>

      <div className="goals-section">
        <div className="section-header">
          <h2>Metas de Leitura</h2>
          <button 
            className="add-goal-button"
            onClick={() => setShowGoalModal(true)}
          >
            <FaPlus /> Nova Meta
          </button>
        </div>

        <div className="goals-grid">
          {goals.map(goal => (
            <div key={goal.id} className="goal-card">
              <div className="goal-header">
                <FaBullseye className="goal-icon" />
                <h3>{goal.description || `Meta ${goal.type}`}</h3>
                <span className="goal-type">{goal.type}</span>
                <div className="goal-actions">
                  <button 
                    className="icon-button edit"
                    onClick={() => handleEditGoal(goal)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="icon-button delete"
                    onClick={() => {
                      setSelectedGoalId(goal.id);
                      setShowDeleteModal(true);
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${calculateGoalProgress(goal)}%` }}
                >
                  {calculateGoalProgress(goal)}%
                </div>
              </div>

              <div className="goal-details">
                <div>
                  <span>Progresso: </span>
                  <strong>
                    {Math.min(
                      goal.type === 'annual' 
                        ? stats.booksThisYear 
                        : goal.type === 'monthly' 
                          ? stats.booksThisMonth 
                          : goal.progress,
                      goal.target
                    )}
                  </strong>
                  <span>/{goal.target}</span>
                </div>
                <div>
                  <span>Prazo: </span>
                  {goal.endDate && new Date(goal.endDate).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showGoalModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingGoal ? 'Editar Meta' : 'Criar Nova Meta'}</h3>
            <form onSubmit={handleGoalSubmit}>
              <div className="form-group">
                <label>Tipo de Meta</label>
                <select
                  value={newGoal.type}
                  onChange={(e) => setNewGoal({...newGoal, type: e.target.value})}
                  className="form-input"
                  required
                >
                  <option value="annual">Anual</option>
                  <option value="monthly">Mensal</option>
                  <option value="custom">Personalizada</option>
                </select>
              </div>

              <div className="form-group">
                <label>Descrição (opcional)</label>
                <input
                  type="text"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  className="form-input"
                  placeholder="Ex.: Meta de Verão 2025"
                />
              </div>

              <div className="form-group">
                <label>Objetivo (número de livros)</label>
                <input
                  type="number"
                  min="1"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Prazo Final</label>
                <input
                  type="date"
                  value={newGoal.endDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setNewGoal({...newGoal, endDate: e.target.value})}
                  className="form-input"
                  required
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="modal-button cancel"
                  onClick={() => {
                    setShowGoalModal(false);
                    setEditingGoal(null);
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="modal-button confirm"
                >
                  {editingGoal ? 'Salvar Alterações' : 'Criar Meta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && <DeleteConfirmationModal />}

      <div className="recent-books">
        <h2>Últimas Adições</h2>
        {books.slice(0, 3).map(book => (
          <div key={book.id} className="book-item">
            <img src={book.cover || 'default-book.png'} alt={book.title} />
            <div>
              <h4>{book.title}</h4>
              <p>{book.author}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}