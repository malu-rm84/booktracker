import { useState, useRef } from 'react';
import { auth } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaUser, FaEdit, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import '../styles/profile.css';

export default function Profile() {
  const [newName, setNewName] = useState('');
  const [notification, setNotification] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef(null);
  const user = auth.currentUser;

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleNameChange = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      showNotification('error', 'O nome não pode estar vazio!');
      return;
    }
    
    try {
      setIsUpdating(true);
      await updateProfile(user, { displayName: newName.trim() });
      setNewName('');
      showNotification('success', 'Nome atualizado com sucesso!');
    } catch (error) {
      showNotification('error', `Erro ao atualizar nome: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUpdating(true);
      const storage = getStorage();
      const storageRef = ref(storage, `profilePhotos/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      
      await updateProfile(user, { photoURL });
      showNotification('success', 'Foto atualizada com sucesso!');
    } catch (error) {
      showNotification('error', `Erro ao atualizar foto: ${error.message}`);
    } finally {
      setIsUpdating(false);
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="profile-container">
      {notification && (
        <div className={`custom-alert ${notification.type}`}>
          <div className="alert-icon">
            {notification.type === 'success' ? 
              <FaCheckCircle /> : <FaTimesCircle />}
          </div>
          <span>{notification.message}</span>
        </div>
      )}

      <div className="profile-card">
        <h1>
          <FaUser className="header-icon" />
          Configurações do Perfil
        </h1>
        
        <div className="profile-section">
          <div className="photo-section">
            <img
              src={user?.photoURL || '/default-user.png'}
              alt="Foto do usuário"
              className="profile-photo"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              hidden
            />
            <button 
              className="change-photo-btn"
              onClick={() => fileInputRef.current.click()}
              disabled={isUpdating}
            >
              <FaEdit className="btn-icon" />
              {isUpdating ? 'Atualizando...' : 'Alterar Foto'}
            </button>
          </div>

          <div className="info-section">
            <form onSubmit={handleNameChange} className="name-form">
              <label>
                Nome:
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Digite seu novo nome"
                  disabled={isUpdating}
                />
              </label>
              <button 
                type="submit" 
                className="update-btn"
                disabled={isUpdating || !newName.trim()}
              >
                {isUpdating ? 'Atualizando...' : 'Atualizar Nome'}
              </button>
            </form>

            <div className="user-info">
              <h3><strong>Email:</strong> {user?.email}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}