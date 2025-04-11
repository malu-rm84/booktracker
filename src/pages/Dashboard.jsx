import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { collection, doc, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { FaBook, FaStar, FaHeart, FaPlus, FaBookOpen } from 'react-icons/fa';
import '../styles/dashboard.css';

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    read: 0,
    favoriteGenre: 'Nenhum',
    avgRating: 0
  });

  useEffect(() => {
    const fetchBooks = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const booksRef = collection(userRef, 'books');
        const q = query(booksRef);
        const querySnapshot = await getDocs(q);
        const booksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBooks(booksData);
        calculateStats(booksData);
      }
    };

    fetchBooks();
  }, []);

  const calculateStats = (books) => {
    const readBooks = books.filter(book => book.status === 'Concluído');
    const ratings = books.map(book => book.rating).filter(r => r > 0);
    
    const genreCounts = books.reduce((acc, book) => {
      acc[book.genre] = (acc[book.genre] || 0) + 1;
      return acc;
    }, {});

    setStats({
      total: books.length,
      read: readBooks.length,
      favoriteGenre: Object.keys(genreCounts).reduce((a, b) => genreCounts[a] > genreCounts[b] ? a : b, 'Nenhum'),
      avgRating: ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0
    });
  };

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
      </div>

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
  )
}