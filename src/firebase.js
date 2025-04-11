import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider,
  setPersistence, 
  browserLocalPersistence 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDU9EPsYVmpwNWzQWifSdZIxJcpMo6Pk-I",
    authDomain: "booktracker-e1be7.firebaseapp.com",
    projectId: "booktracker-e1be7",
    storageBucket: "booktracker-e1be7.firebasestorage.app",
    messagingSenderId: "683431497366",
    appId: "1:683431497366:web:ea521a8fcd6b1eb83bbcb7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Crie o provedor do Google
const googleProvider = new GoogleAuthProvider();

// Configurar persistência
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Erro na persistência:", error);
  });

// Exporte o googleProvider
export { auth, db, googleProvider };