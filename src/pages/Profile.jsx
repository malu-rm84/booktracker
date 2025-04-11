import { useState } from 'react';
import { auth } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { FaUser, FaEdit } from 'react-icons/fa';
import '../styles/profile.css';

export default function Profile() {
  const [newName, setNewName] = useState('');
  const user = auth.currentUser;

  const handleNameChange = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(user, {
        displayName: newName
      });
      setNewName('');
      alert('Nome atualizado com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar nome: ' + error.message);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>
          <FaUser style={{ marginRight: '0.5rem' }} />
          Configurações do Perfil
        </h1>
        
        <div className="profile-section">
          <div className="photo-section">
            <img
              src={user?.photoURL || '/default-user.png'}
              alt="Foto do usuário"
              className="profile-photo"
            />
            <button className="change-photo-btn">
              <FaEdit style={{ marginRight: '0.5rem' }} />
              Alterar Foto
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
                  placeholder="Novo nome"
                />
              </label>
              <button type="submit">Atualizar Nome</button>
            </form>

            <div className="user-info">
              <p><strong>Email:</strong> {user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}