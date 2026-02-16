import React, { useState, useEffect } from 'react';
import { User, UserPlus, Edit, Trash2, Eye, Shield, Phone, Mail, Search, X } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState({ role: 'admin' }); // Simuler un utilisateur connecté
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'view'
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'client'
  });

  // Simulation de données utilisateurs
  useEffect(() => {
    setUsers([
      { id: 1, name: 'Jean Dupont', email: 'jean@example.com', phone: '+33123456789', role: 'admin' },
      { id: 2, name: 'Marie Martin', email: 'marie@example.com', phone: '+33987654321', role: 'receptionist' },
      { id: 3, name: 'Pierre Durand', email: 'pierre@example.com', phone: '+33456789123', role: 'client' },
      { id: 4, name: 'Sophie Bernard', email: 'sophie@example.com', phone: '+33789123456', role: 'client' }
    ]);
  }, []);

  const isAdmin = () => currentUser.role === 'admin';
  const canViewUser = (user) => isAdmin() || currentUser.id === user.id;
  const canEditUser = (user) => isAdmin() || currentUser.id === user.id;

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    setFormData({ name: '', email: '', password: '', phone: '', role: 'client' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (modalType === 'create') {
        const newUser = {
          id: users.length + 1,
          ...formData
        };
        setUsers([...users, newUser]);
      } else if (modalType === 'edit') {
        setUsers(users.map(user => 
          user.id === selectedUser.id 
            ? { ...user, ...formData }
            : user
        ));
      }
      
      closeModal();
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

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
              <p className="text-gray-600 mt-2">Gérez les utilisateurs et leurs permissions</p>
            </div>
            {isAdmin() && (
              <button
                onClick={() => openModal('create')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                Nouvel utilisateur
              </button>
            )}
          </div>
        </div>

        {/* Barre de recherche */}
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

        {/* Liste des utilisateurs */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {canViewUser(user) && (
                          <button
                            onClick={() => openModal('view', user)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Voir"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {canEditUser(user) && (
                          <button
                            onClick={() => openModal('edit', user)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {isAdmin() && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Supprimer"
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
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {modalType === 'create' && 'Créer un utilisateur'}
                    {modalType === 'edit' && 'Modifier l\'utilisateur'}
                    {modalType === 'view' && 'Détails de l\'utilisateur'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {modalType === 'view' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                      <p className="text-sm text-gray-900">{selectedUser?.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-sm text-gray-900">{selectedUser?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                      <p className="text-sm text-gray-900">{selectedUser?.phone || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(selectedUser?.role)}`}>
                        {getRoleLabel(selectedUser?.role)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {modalType === 'create' ? 'Mot de passe *' : 'Nouveau mot de passe'}
                        </label>
                        <input
                          type="password"
                          required={modalType === 'create'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Téléphone
                        </label>
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {(isAdmin() || modalType === 'create') && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rôle *
                          </label>
                          <select
                            required
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="client">Client</option>
                            <option value="receptionist">Réceptionniste</option>
                            <option value="admin">Administrateur</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {loading ? 'En cours...' : (modalType === 'create' ? 'Créer' : 'Modifier')}
                      </button>
                    </div>
                                      </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;