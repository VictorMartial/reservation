import React, { useState, useEffect } from 'react';
import {
  User, UserPlus, Search, Eye, Edit, Trash2, Mail, Phone, Shield, X, AlertCircle, Loader
} from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Assurez-vous que le chemin est correct

const AdminPage = () => {
  const { user: currentUser, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', role: 'client'
  });

  const isAdmin = () => currentUser?.role === 'admin';
  const canViewUser = () => true;
  const canEditUser = (user) => isAdmin() || currentUser?.id === user.id;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await fetch('http://localhost:8000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        throw new Error(`Erreur ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      setError(error.message || 'Erreur lors de la récupération des utilisateurs');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'receptionist': return 'bg-blue-100 text-blue-800';
      case 'client': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'receptionist': return 'Réceptionniste';
      case 'client': return 'Client';
      default: return role;
    }
  };

  const openModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);
    setError('');
    
    if (type === 'create') {
      setFormData({ name: '', email: '', password: '', phone: '', role: 'client' });
    } else if (type === 'edit' && user) {
      setFormData({ 
        name: user.name, 
        email: user.email, 
        password: '', 
        phone: user.phone || '', 
        role: user.role 
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setError('');
    setFormData({ name: '', email: '', password: '', phone: '', role: 'client' });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      const method = modalType === 'create' ? 'POST' : 'PUT';
      const url = modalType === 'create'
        ? 'http://localhost:8000/api/users'
        : `http://localhost:8000/api/users/${selectedUser.id}`;

      // Préparer les données à envoyer
      const dataToSend = { ...formData };
      
      // Ne pas envoyer le mot de passe vide lors de la modification
      if (modalType === 'edit' && !dataToSend.password) {
        delete dataToSend.password;
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${res.status}: ${res.statusText}`);
      }

      await fetchUsers(); // Recharger la liste des utilisateurs
      closeModal();
    } catch (err) {
      console.error('Erreur lors de l\'envoi des données:', err);
      setError(err.message || 'Erreur lors de l\'envoi des données');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`http://localhost:8000/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${res.status}: ${res.statusText}`);
      }
      
      await fetchUsers(); // Recharger la liste des utilisateurs
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError(err.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Vérifier si l'utilisateur est connecté
  if (!currentUser || !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Non authentifié</h3>
          <p className="mt-1 text-sm text-gray-500">
            Vous devez être connecté pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <User className="w-8 h-8 text-blue-600" />
                Gestion des Utilisateurs
              </h1>
              <p className="text-gray-600 mt-2">
                Gérez les utilisateurs et leurs rôles 
                {users.length > 0 && `(${users.length} utilisateurs)`}
              </p>
            </div>
            {isAdmin() && (
              <button
                onClick={() => openModal('create')}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                Nouvel utilisateur
              </button>
            )}
          </div>
        </div>

        {/* Statistiques */}
        {users.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Administrateurs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Réceptionnistes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.role === 'receptionist').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Clients</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.role === 'client').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Affichage des erreurs */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Recherche */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Liste utilisateurs */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="flex items-center space-x-2">
                <Loader className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-sm text-gray-600">Chargement...</span>
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Créé le
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 mb-1">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {user.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        {canViewUser(user) && (
                          <button 
                            onClick={() => openModal('view', user)} 
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {canEditUser(user) && (
                          <button 
                            onClick={() => openModal('edit', user)} 
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {isAdmin() && user.id !== currentUser.id && (
                          <button 
                            onClick={() => handleDelete(user.id)} 
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Supprimer"
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {!loading && filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {users.length === 0 ? 'Aucun utilisateur trouvé' : 'Aucun résultat'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Essayez de modifier votre recherche.' : 'Les utilisateurs apparaîtront ici une fois chargés.'}
                </p>
                {users.length === 0 && (
                  <button
                    onClick={fetchUsers}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Recharger
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-y-auto max-h-[90vh]">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {modalType === 'create' && 'Créer un utilisateur'}
                    {modalType === 'edit' && 'Modifier l\'utilisateur'}
                    {modalType === 'view' && 'Détails utilisateur'}
                  </h3>
                  <button 
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Affichage des erreurs dans le modal */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                )}

                {modalType === 'view' ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{selectedUser?.name}</h4>
                        <p className="text-sm text-gray-500">ID: {selectedUser?.id}</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-sm text-gray-900">{selectedUser?.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Téléphone</label>
                        <p className="text-sm text-gray-900">{selectedUser?.phone || 'Non renseigné'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Rôle</label>
                        <p className="text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(selectedUser?.role)}`}>
                            <Shield className="w-3 h-3 mr-1" />
                            {getRoleLabel(selectedUser?.role)}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Date de création</label>
                        <p className="text-sm text-gray-900">
                          {selectedUser?.created_at ? new Date(selectedUser.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                      <input
                        type="text"
                        placeholder="Nom complet"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="adresse@example.com"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mot de passe {modalType === 'edit' && '(laisser vide pour ne pas modifier)'}
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        required={modalType === 'create'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone (optionnel)</label>
                      <input
                        type="tel"
                        placeholder="+33 6 12 34 56 78"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading}
                      />
                    </div>
                    
                    {(isAdmin() || modalType === 'create') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={loading}
                        >
                          <option value="client">Client</option>
                          <option value="receptionist">Réceptionniste</option>
                          <option value="admin">Administrateur</option>
                        </select>
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <button 
                        type="button" 
                        onClick={closeModal} 
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                        disabled={loading}
                      >
                        Annuler
                      </button>
                      <button 
                        type="submit" 
                        disabled={loading} 
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        {loading && <Loader className="w-4 h-4 animate-spin" />}
                        {loading ? 'En cours...' : (modalType === 'create' ? 'Créer' : 'Modifier')}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;