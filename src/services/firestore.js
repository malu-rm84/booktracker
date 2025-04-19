import { db } from '../firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

export const addBook = async (userId, bookData) => {
  try {
    // Cria a subcoleção 'books' dentro do documento do usuário
    const userRef = doc(db, 'users', userId);
    const booksRef = collection(userRef, 'books');
    
    // Adiciona o livro e cria a coleção automaticamente
    const docRef = await addDoc(booksRef, {
      ...bookData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return docRef.id; // Retorna o ID do documento criado
  } catch (error) {
    console.error('Erro ao adicionar livro:', error);
    throw error;
  }
};

// Cria a estrutura inicial do usuário se não existir
export const initUserCollection = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { 
      initialized: true,
      createdAt: new Date()
    }, { merge: true });
    
    console.log('Coleção do usuário inicializada com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar usuário:', error);
    throw error;
  }
};