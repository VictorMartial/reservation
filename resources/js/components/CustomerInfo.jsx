import React, { useState } from 'react';
import { ArrowLeft, Check, AlertCircle, CheckCircle } from 'lucide-react';

const CustomerInfo = ({
  customerInfo,
  setCustomerInfo,
  availability,
  loading,
  submitReservation,
  setCurrentStep,
  reservationType,
  calculateNights,
}) => {
  const [errors, setErrors] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    code_postal: '',
    commentaires: '',
  });

  const validateField = (name, value) => {
    // Simplification des regex
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    const phoneRegex = /^(\+33|0)[1-9](\d{2}){4}$/;
    
    switch (name) {
      case 'nom':
      case 'prenom':
        if (!value.trim()) return 'Ce champ est requis';
        if (value.length < 2) return '2 caractères minimum';
        if (value.length > 50) return '50 caractères maximum';
        if (!nameRegex.test(value)) return 'Caractères non autorisés';
        return '';
      case 'email':
        if (!value.trim()) return 'Ce champ est requis';
        if (!/^\S+@\S+\.\S+$/.test(value)) return 'Email invalide';
        return '';
      case 'telephone':
        if (!value.trim()) return 'Ce champ est requis';
        if (!phoneRegex.test(value.replace(/\s/g, ''))) 
          return 'Format: 0612345678 ou +33612345678';
        return '';
      case 'code_postal':
        if (value && !/^\d{5}$/.test(value)) return 'Code postal invalide';
        return '';
      case 'ville':
        if (value && value.length > 100) return 'Trop long';
        if (value && !/^[a-zA-ZÀ-ÿ\s\-']+$/.test(value)) return 'Caractères invalides';
        return '';
      case 'adresse':
        if (value && value.length > 255) return 'Trop long';
        return '';
      case 'commentaires':
        if (value && value.length > 1000) return 'Trop long';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Mise à jour immédiate de l'état parent
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
    
    // Validation différée pour éviter le blocage
    setTimeout(() => {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }, 300);
  };
  
  // Remplacer la validation complexe par une version simplifiée
  const isFormValid = () => {
    const requiredFields = ['nom', 'prenom', 'email', 'telephone'];
    return requiredFields.every(field => customerInfo[field]?.trim());
  };

  

  const handleSubmit = () => {
    const newErrors = {};
    Object.keys(customerInfo).forEach((field) => {
      newErrors[field] = validateField(field, customerInfo[field] || '');
    });
    setErrors(newErrors);

    const requiredFields = ['nom', 'prenom', 'email', 'telephone'];
    const missing = requiredFields.filter(f => !customerInfo[f]?.trim());

    if (missing.length > 0) {
      alert(`Champs requis manquants : ${missing.join(', ')}`);
      return;
    }

    if (Object.values(newErrors).every((e) => !e)) {
      submitReservation();
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h2 className="text-center mb-5">Vos informations</h2>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status" />
              <p>Vérification de la disponibilité...</p>
            </div>
          ) : availability ? (
            <>
              {availability.disponible ? (
                <div className="alert alert-success d-flex align-items-center mb-4">
                  <CheckCircle className="me-2" size={20} />
                  <div>
                    <strong>Disponible !</strong>
                    {reservationType === 'chambre' && availability.prix_total && (
                      <div className="mt-1">
                        Prix total : <strong>{availability.prix_total}€</strong> pour{' '}
                        {calculateNights()} nuit{calculateNights() > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="alert alert-danger d-flex align-items-center mb-4">
                  <AlertCircle className="me-2" size={20} />
                  <strong>Non disponible pour ces dates</strong>
                </div>
              )}

              {availability.disponible && (
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="prenom" className="form-label">Prénom *</label>
                      <input
                        id="prenom"
                        name="prenom"
                        autoComplete="given-name"
                        type="text"
                        className={`form-control ${errors.prenom ? 'is-invalid' : customerInfo.prenom ? 'is-valid' : ''}`}
                        value={customerInfo.prenom || ''}
                        onChange={handleChange}
                        required
                        maxLength={50}
                        placeholder="Votre prénom"
                      />
                      {errors.prenom && <div className="invalid-feedback">{errors.prenom}</div>}
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="nom" className="form-label">Nom *</label>
                      <input
                        id="nom"
                        name="nom"
                        autoComplete="family-name"
                        type="text"
                        className={`form-control ${errors.nom ? 'is-invalid' : customerInfo.nom ? 'is-valid' : ''}`}
                        value={customerInfo.nom || ''}
                        onChange={handleChange}
                        required
                        maxLength={50}
                        placeholder="Votre nom"
                      />
                      {errors.nom && <div className="invalid-feedback">{errors.nom}</div>}
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="email" className="form-label">Email *</label>
                      <input
                        id="email"
                        name="email"
                        autoComplete="email"
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : customerInfo.email ? 'is-valid' : ''}`}
                        value={customerInfo.email || ''}
                        onChange={handleChange}
                        required
                        maxLength={255}
                        placeholder="votre.email@exemple.com"
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="telephone" className="form-label">Téléphone *</label>
                      <input
                        id="telephone"
                        name="telephone"
                        autoComplete="tel"
                        type="tel"
                        className={`form-control ${errors.telephone ? 'is-invalid' : customerInfo.telephone ? 'is-valid' : ''}`}
                       value={customerInfo.telephone || ''}
  onChange={(e) => {
    // Formatage automatique
    let val = e.target.value;
    if (/^0[1-9]/.test(val) && val.length === 10 && !val.includes(' ')) {
      val = val.replace(/(\d{2})(?=\d)/g, '$1 ');
    }
    handleChange({ target: { name: 'telephone', value: val } });
  }}
                      />
                      {errors.telephone && <div className="invalid-feedback">{errors.telephone}</div>}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="adresse" className="form-label">Adresse</label>
                    <input
                      id="adresse"
                      name="adresse"
                      autoComplete="street-address"
                      type="text"
                      className={`form-control ${errors.adresse ? 'is-invalid' : ''}`}
                      value={customerInfo.adresse || ''}
                      onChange={handleChange}
                      maxLength={255}
                      placeholder="Votre adresse complète"
                    />
                    {errors.adresse && <div className="invalid-feedback">{errors.adresse}</div>}
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="ville" className="form-label">Ville</label>
                      <input
                        id="ville"
                        name="ville"
                        autoComplete="address-level2"
                        type="text"
                        className={`form-control ${errors.ville ? 'is-invalid' : ''}`}
                        value={customerInfo.ville || ''}
                        onChange={handleChange}
                        maxLength={100}
                        placeholder="Votre ville"
                      />
                      {errors.ville && <div className="invalid-feedback">{errors.ville}</div>}
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="code_postal" className="form-label">Code postal</label>
                      <input
                        id="code_postal"
                        name="code_postal"
                        autoComplete="postal-code"
                        type="text"
                        className={`form-control ${errors.code_postal ? 'is-invalid' : ''}`}
                        value={customerInfo.code_postal || ''}
                        onChange={handleChange}
                        maxLength={5}
                        placeholder="12345"
                      />
                      {errors.code_postal && <div className="invalid-feedback">{errors.code_postal}</div>}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="commentaires" className="form-label">Commentaires</label>
                    <textarea
                      id="commentaires"
                      name="commentaires"
                      autoComplete="off"
                      className={`form-control ${errors.commentaires ? 'is-invalid' : ''}`}
                      rows="3"
                      value={customerInfo.commentaires || ''}
                      onChange={handleChange}
                      maxLength={1000}
                      placeholder="Demandes spéciales..."
                    />
                    {errors.commentaires && <div className="invalid-feedback">{errors.commentaires}</div>}
                    <div className="form-text">{(customerInfo.commentaires || '').length}/1000 caractères</div>
                  </div>

                  <div className="d-flex gap-3 mt-4">
                    <button type="button" onClick={() => setCurrentStep(3)} className="btn btn-outline-secondary">
                      <ArrowLeft className="me-2" size={16} /> Retour
                    </button>
                    <button type="submit" disabled={loading || !isFormValid()} className="btn btn-success">
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                          Confirmation...
                        </>
                      ) : (
                        <>
                          Confirmer la réservation <Check className="ms-2" size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CustomerInfo;
