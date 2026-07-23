import { useState, useEffect } from 'react';
import { Building2, Pill, Users, Plus, Trash2, Shield, Edit2, X, Check, Eye, EyeOff, Save } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function AdminPanel({ user, showToast, setError, activeTab }) {
  // States
  const [hospitals, setHospitals] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Forms
  const [showForm, setShowForm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Edit mode
  const [editItem, setEditItem] = useState(null); // { type: 'hospital'|'pharmacy'|'agent', data: {...} }
  
  const [hospForm, setHospForm] = useState({ name: '', address: '' });
  const [pharmForm, setPharmForm] = useState({ name: '', address: '' });
  const [agentForm, setAgentForm] = useState({ username: '', password: '', fullName: '', hospital_id: '' });

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setShowForm(false);
    setEditItem(null);
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [hospRes, pharmRes, agentsRes] = await Promise.all([
        fetch(`${API_URL}/hospitals/`),
        fetch(`${API_URL}/pharmacies/`),
        fetch(`${API_URL}/auth/users?role=Agent Médical`)
      ]);
      
      if (hospRes.ok) { const d = await hospRes.json(); setHospitals(d.data || []); }
      if (pharmRes.ok) { const d = await pharmRes.json(); setPharmacies(d || []); }
      if (agentsRes.ok) { const d = await agentsRes.json(); setAgents(d.data || []); }
    } catch (e) {
      setError("Erreur de chargement des données.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Edit Handlers ──────────────────────
  const handleEdit = (type, item) => {
    setShowForm(true);
    if (type === 'hospital') {
      setEditItem({ type, data: item });
      setHospForm({ name: item.name, address: item.address });
    } else if (type === 'pharmacy') {
      setEditItem({ type, data: item });
      setPharmForm({ name: item.name, address: item.address });
    } else if (type === 'agent') {
      setEditItem({ type, data: item });
      setAgentForm({ username: item.username, password: '', fullName: item.fullName, hospital_id: item.hospital_id || '' });
    }
  };

  const cancelEdit = () => {
    setEditItem(null);
    setShowForm(false);
    setHospForm({ name: '', address: '' });
    setPharmForm({ name: '', address: '' });
    setAgentForm({ username: '', password: '', fullName: '', hospital_id: '' });
    setShowPassword(false);
  };

  // ─── Update Handlers ──────────────────────
  const handleUpdateHospital = async (e) => {
    e.preventDefault();
    if (!editItem) return;
    try {
      const res = await fetch(`${API_URL}/hospitals/${editItem.data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hospForm)
      });
      if (res.ok) {
        showToast("Hôpital modifié avec succès !");
        cancelEdit();
        fetchData();
      } else {
        const err = await res.json();
        setError(err.detail || "Erreur de modification.");
      }
    } catch (e) { setError("Erreur réseau."); }
  };

  const handleUpdatePharmacy = async (e) => {
    e.preventDefault();
    if (!editItem) return;
    try {
      const res = await fetch(`${API_URL}/pharmacies/${editItem.data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pharmForm)
      });
      if (res.ok) {
        showToast("Pharmacie modifiée avec succès !");
        cancelEdit();
        fetchData();
      } else {
        const err = await res.json();
        setError(err.detail || "Erreur de modification.");
      }
    } catch (e) { setError("Erreur réseau."); }
  };

  const handleUpdateAgent = async (e) => {
    e.preventDefault();
    if (!editItem) return;
    const payload = {
      username: agentForm.username,
      fullName: agentForm.fullName,
      hospital_id: agentForm.hospital_id
    };
    // Only include password if user typed a new one
    if (agentForm.password.trim()) {
      payload.password = agentForm.password;
    }
    try {
      const res = await fetch(`${API_URL}/auth/users/${editItem.data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast("Agent modifié avec succès !");
        cancelEdit();
        fetchData();
      } else {
        const err = await res.json();
        setError(err.detail || "Erreur de modification.");
      }
    } catch (e) { setError("Erreur réseau."); }
  };

  // ─── Delete Handlers ──────────────────────
  const handleDelete = (type, id, name) => {
    setItemToDelete({ type, id, name });
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { type, id } = itemToDelete;
    setItemToDelete(null);
    try {
      let endpoint = '';
      if (type === 'hospital') endpoint = `/hospitals/${id}`;
      if (type === 'pharmacy') endpoint = `/pharmacies/${id}`;
      if (type === 'agent') endpoint = `/auth/users/${id}`;

      const res = await fetch(`${API_URL}${endpoint}`, { method: 'DELETE' });
      if (res.ok) {
        showToast("Élément supprimé avec succès.");
        fetchData();
      } else {
        const err = await res.json();
        setError(err.detail || "Erreur de suppression.");
      }
    } catch (e) {
      setError("Erreur réseau.");
    }
  };

  // ─── Create Handlers ──────────────────────
  const handleAddHospital = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/hospitals/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hospForm)
      });
      if (res.ok) {
        showToast("Hôpital ajouté !");
        cancelEdit();
        fetchData();
      } else {
        const err = await res.json();
        setError(err.detail || "Erreur d'ajout.");
      }
    } catch (e) { setError("Erreur réseau."); }
  };

  const handleAddPharmacy = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/pharmacies/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pharmForm)
      });
      if (res.ok) {
        showToast("Pharmacie ajoutée !");
        cancelEdit();
        fetchData();
      } else {
        const err = await res.json();
        setError(err.detail || "Erreur d'ajout.");
      }
    } catch (e) { setError("Erreur réseau."); }
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...agentForm,
          role: 'Agent Médical',
          department: 'Tous',
          avatar: agentForm.fullName.substring(0, 2).toUpperCase()
        })
      });
      if (res.ok) {
        showToast("Agent créé avec succès !");
        cancelEdit();
        fetchData();
      } else {
        const err = await res.json();
        setError(err.detail || "Erreur d'ajout.");
      }
    } catch (e) { setError("Erreur réseau."); }
  };

  const isEditing = editItem !== null;
  const formTitle = (type) => {
    if (isEditing) {
      if (type === 'hospitals') return 'Modifier l\'Hôpital';
      if (type === 'pharmacies') return 'Modifier la Pharmacie';
      if (type === 'agents') return 'Modifier l\'Agent Médical';
    }
    if (type === 'hospitals') return 'Ajouter un Hôpital';
    if (type === 'pharmacies') return 'Ajouter une Pharmacie';
    if (type === 'agents') return 'Créer un Agent Médical';
  };

  if (isLoading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2><Shield size={28} style={{ verticalAlign: 'middle', marginRight: 8, color: 'hsl(var(--color-primary))' }}/> 
          Administration Système</h2>
          <p>Gérez les hôpitaux, pharmacies et agents du réseau QueueCare.</p>
        </div>
        <button className="call-next-btn" onClick={() => { if (isEditing) { cancelEdit(); } else { setShowForm(!showForm); } }}>
          {showForm ? <><X size={16} /> Annuler</> : <><Plus size={16} /> Ajouter</>}
        </button>
      </div>

      {/* ═══ Hospital Form ═══ */}
      {showForm && activeTab === 'hospitals' && (
        <form onSubmit={isEditing ? handleUpdateHospital : handleAddHospital} className="glass-panel" style={{ padding: '24px', marginBottom: '24px', animation: 'slideDown 0.25s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isEditing ? <Edit2 size={18} style={{ color: 'hsl(var(--color-primary))' }} /> : <Plus size={18} style={{ color: 'hsl(var(--color-primary))' }} />}
              {formTitle('hospitals')}
            </h3>
            {isEditing && <span className="badge" style={{ background: 'hsl(var(--color-primary) / 0.15)', color: 'hsl(var(--color-primary))', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>Mode édition</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group"><label className="form-label">Nom *</label><input type="text" className="form-input" required value={hospForm.name} onChange={e => setHospForm({...hospForm, name: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Adresse *</label><input type="text" className="form-input" required value={hospForm.address} onChange={e => setHospForm({...hospForm, address: e.target.value})} /></div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {isEditing ? <><Save size={16} /> Enregistrer les modifications</> : <><Check size={16} /> Enregistrer</>}
            </button>
            {isEditing && <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Annuler</button>}
          </div>
        </form>
      )}

      {/* ═══ Pharmacy Form ═══ */}
      {showForm && activeTab === 'pharmacies' && (
        <form onSubmit={isEditing ? handleUpdatePharmacy : handleAddPharmacy} className="glass-panel" style={{ padding: '24px', marginBottom: '24px', animation: 'slideDown 0.25s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isEditing ? <Edit2 size={18} style={{ color: 'hsl(var(--color-primary))' }} /> : <Plus size={18} style={{ color: 'hsl(var(--color-primary))' }} />}
              {formTitle('pharmacies')}
            </h3>
            {isEditing && <span className="badge" style={{ background: 'hsl(var(--color-primary) / 0.15)', color: 'hsl(var(--color-primary))', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>Mode édition</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group"><label className="form-label">Nom *</label><input type="text" className="form-input" required value={pharmForm.name} onChange={e => setPharmForm({...pharmForm, name: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Adresse *</label><input type="text" className="form-input" required value={pharmForm.address} onChange={e => setPharmForm({...pharmForm, address: e.target.value})} /></div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {isEditing ? <><Save size={16} /> Enregistrer les modifications</> : <><Check size={16} /> Enregistrer</>}
            </button>
            {isEditing && <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Annuler</button>}
          </div>
        </form>
      )}

      {/* ═══ Agent Form ═══ */}
      {showForm && activeTab === 'agents' && (
        <form onSubmit={isEditing ? handleUpdateAgent : handleAddAgent} className="glass-panel" style={{ padding: '24px', marginBottom: '24px', animation: 'slideDown 0.25s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isEditing ? <Edit2 size={18} style={{ color: 'hsl(var(--color-primary))' }} /> : <Plus size={18} style={{ color: 'hsl(var(--color-primary))' }} />}
              {formTitle('agents')}
            </h3>
            {isEditing && <span className="badge" style={{ background: 'hsl(var(--color-primary) / 0.15)', color: 'hsl(var(--color-primary))', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>Mode édition</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group"><label className="form-label">Nom complet *</label><input type="text" className="form-input" required value={agentForm.fullName} onChange={e => setAgentForm({...agentForm, fullName: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Nom d'utilisateur *</label><input type="text" className="form-input" required value={agentForm.username} onChange={e => setAgentForm({...agentForm, username: e.target.value})} /></div>
            <div className="form-group">
              <label className="form-label">{isEditing ? 'Nouveau mot de passe (laisser vide pour garder)' : 'Mot de passe *'}</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-input" 
                  required={!isEditing}
                  placeholder={isEditing ? "Laisser vide pour ne pas changer" : ""}
                  value={agentForm.password} 
                  onChange={e => setAgentForm({...agentForm, password: e.target.value})} 
                  style={{ paddingRight: '44px' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center',
                    padding: '4px', borderRadius: '6px', transition: 'color 0.2s'
                  }}
                  onMouseEnter={e => e.target.style.color = 'hsl(var(--color-primary))'}
                  onMouseLeave={e => e.target.style.color = 'hsl(var(--text-muted))'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Hôpital rattaché *</label>
              <select className="form-input" required value={agentForm.hospital_id} onChange={e => setAgentForm({...agentForm, hospital_id: e.target.value})}>
                <option value="">Sélectionnez un hôpital</option>
                {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {isEditing ? <><Save size={16} /> Enregistrer les modifications</> : <><Check size={16} /> Créer Agent</>}
            </button>
            {isEditing && <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Annuler</button>}
          </div>
        </form>
      )}

      {/* ═══ Data Tables ═══ */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {activeTab === 'hospitals' && (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid hsl(var(--border-color))' }}>
                <th style={{ padding: '12px' }}>Nom</th>
                <th style={{ padding: '12px' }}>Adresse</th>
                <th style={{ padding: '12px', width: '120px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map(h => (
                <tr key={h.id} style={{ borderBottom: '1px solid hsl(var(--border-color))', transition: 'background 0.15s', ...(editItem?.data?.id === h.id ? { background: 'hsl(var(--color-primary) / 0.06)' } : {}) }} onMouseEnter={e => { if (!editItem || editItem.data.id !== h.id) e.currentTarget.style.background = 'hsl(var(--bg-secondary))'; }} onMouseLeave={e => { if (!editItem || editItem.data.id !== h.id) e.currentTarget.style.background = 'transparent'; }}>
                  <td style={{ padding: '12px' }}>{h.name}</td>
                  <td style={{ padding: '12px' }}>{h.address}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <button onClick={() => handleEdit('hospital', h)} title="Modifier" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'hsl(var(--color-primary))', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'hsl(var(--color-primary) / 0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><Edit2 size={17}/></button>
                      <button onClick={() => handleDelete('hospital', h.id, h.name)} title="Supprimer" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'hsl(var(--color-danger))', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'hsl(var(--color-danger) / 0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><Trash2 size={17}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {hospitals.length === 0 && <tr><td colSpan="3" style={{ padding: '16px', textAlign: 'center' }}>Aucun hôpital trouvé</td></tr>}
            </tbody>
          </table>
        )}
        
        {activeTab === 'pharmacies' && (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid hsl(var(--border-color))' }}>
                <th style={{ padding: '12px' }}>Nom</th>
                <th style={{ padding: '12px' }}>Adresse</th>
                <th style={{ padding: '12px', width: '120px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pharmacies.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid hsl(var(--border-color))', transition: 'background 0.15s', ...(editItem?.data?.id === p.id ? { background: 'hsl(var(--color-primary) / 0.06)' } : {}) }} onMouseEnter={e => { if (!editItem || editItem.data.id !== p.id) e.currentTarget.style.background = 'hsl(var(--bg-secondary))'; }} onMouseLeave={e => { if (!editItem || editItem.data.id !== p.id) e.currentTarget.style.background = 'transparent'; }}>
                  <td style={{ padding: '12px' }}>{p.name}</td>
                  <td style={{ padding: '12px' }}>{p.address}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <button onClick={() => handleEdit('pharmacy', p)} title="Modifier" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'hsl(var(--color-primary))', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'hsl(var(--color-primary) / 0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><Edit2 size={17}/></button>
                      <button onClick={() => handleDelete('pharmacy', p.id, p.name)} title="Supprimer" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'hsl(var(--color-danger))', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'hsl(var(--color-danger) / 0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><Trash2 size={17}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {pharmacies.length === 0 && <tr><td colSpan="3" style={{ padding: '16px', textAlign: 'center' }}>Aucune pharmacie trouvée</td></tr>}
            </tbody>
          </table>
        )}

        {activeTab === 'agents' && (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid hsl(var(--border-color))' }}>
                <th style={{ padding: '12px' }}>Agent</th>
                <th style={{ padding: '12px' }}>Identifiant</th>
                <th style={{ padding: '12px' }}>Hôpital</th>
                <th style={{ padding: '12px', width: '120px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid hsl(var(--border-color))', transition: 'background 0.15s', ...(editItem?.data?.id === a.id ? { background: 'hsl(var(--color-primary) / 0.06)' } : {}) }} onMouseEnter={e => { if (!editItem || editItem.data.id !== a.id) e.currentTarget.style.background = 'hsl(var(--bg-secondary))'; }} onMouseLeave={e => { if (!editItem || editItem.data.id !== a.id) e.currentTarget.style.background = 'transparent'; }}>
                  <td style={{ padding: '12px' }}>{a.fullName}</td>
                  <td style={{ padding: '12px' }}>{a.username}</td>
                  <td style={{ padding: '12px' }}>{hospitals.find(h => h.id === a.hospital_id)?.name || a.hospital_id}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <button onClick={() => handleEdit('agent', a)} title="Modifier" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'hsl(var(--color-primary))', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'hsl(var(--color-primary) / 0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><Edit2 size={17}/></button>
                      <button onClick={() => handleDelete('agent', a.id, a.fullName)} title="Supprimer" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'hsl(var(--color-danger))', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'hsl(var(--color-danger) / 0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><Trash2 size={17}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {agents.length === 0 && <tr><td colSpan="4" style={{ padding: '16px', textAlign: 'center' }}>Aucun agent trouvé</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* ═══ Delete Confirmation Dialog ═══ */}
      {itemToDelete && (
        <div className="modal-overlay" onClick={() => setItemToDelete(null)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center', animation: 'modalIn 0.25s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={28} color="#ef4444" />
              </div>
            </div>
            <h3 style={{ marginBottom: '12px', fontSize: '1.25rem' }}>Confirmer la suppression</h3>
            <p style={{ color: 'hsl(var(--text-muted))', marginBottom: '24px', lineHeight: 1.5 }}>
              Êtes-vous sûr de vouloir supprimer <strong>{itemToDelete.name || 'cet élément'}</strong> ? Cette action est irréversible.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setItemToDelete(null)} style={{ flex: 1 }}>
                Annuler
              </button>
              <button className="btn btn-danger" onClick={confirmDelete} style={{ flex: 1 }}>
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
