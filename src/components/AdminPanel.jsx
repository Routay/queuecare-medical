import { useState, useEffect } from 'react';
import { Building2, Pill, Users, Plus, Trash2, Shield } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function AdminPanel({ user, showToast, setError }) {
  const [activeTab, setActiveTab] = useState('hospitals');
  
  // States
  const [hospitals, setHospitals] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Forms
  const [showForm, setShowForm] = useState(false);
  
  const [hospForm, setHospForm] = useState({ name: '', address: '' });
  const [pharmForm, setPharmForm] = useState({ name: '', address: '' });
  const [agentForm, setAgentForm] = useState({ username: '', password: '', fullName: '', hospital_id: '' });

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleDelete = async (type, id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) return;
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
        setHospForm({ name: '', address: '' });
        setShowForm(false);
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
        setPharmForm({ name: '', address: '' });
        setShowForm(false);
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
        setAgentForm({ username: '', password: '', fullName: '', hospital_id: '' });
        setShowForm(false);
        fetchData();
      } else {
        const err = await res.json();
        setError(err.detail || "Erreur d'ajout.");
      }
    } catch (e) { setError("Erreur réseau."); }
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
        <button className="call-next-btn" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> {showForm ? 'Annuler' : 'Ajouter'}
        </button>
      </div>

      <div className="department-tabs">
        <button onClick={() => { setActiveTab('hospitals'); setShowForm(false); }} className={`dept-tab ${activeTab === 'hospitals' ? 'active' : ''}`}>
          <Building2 size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }}/> Hôpitaux
        </button>
        <button onClick={() => { setActiveTab('pharmacies'); setShowForm(false); }} className={`dept-tab ${activeTab === 'pharmacies' ? 'active' : ''}`}>
          <Pill size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }}/> Pharmacies
        </button>
        <button onClick={() => { setActiveTab('agents'); setShowForm(false); }} className={`dept-tab ${activeTab === 'agents' ? 'active' : ''}`}>
          <Users size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }}/> Agents Médicaux
        </button>
      </div>

      {showForm && activeTab === 'hospitals' && (
        <form onSubmit={handleAddHospital} className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3>Ajouter un Hôpital</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: 16 }}>
            <div className="form-group"><label className="form-label">Nom *</label><input type="text" className="form-input" required value={hospForm.name} onChange={e => setHospForm({...hospForm, name: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Adresse *</label><input type="text" className="form-input" required value={hospForm.address} onChange={e => setHospForm({...hospForm, address: e.target.value})} /></div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 16 }}>Enregistrer</button>
        </form>
      )}

      {showForm && activeTab === 'pharmacies' && (
        <form onSubmit={handleAddPharmacy} className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3>Ajouter une Pharmacie</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: 16 }}>
            <div className="form-group"><label className="form-label">Nom *</label><input type="text" className="form-input" required value={pharmForm.name} onChange={e => setPharmForm({...pharmForm, name: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Adresse *</label><input type="text" className="form-input" required value={pharmForm.address} onChange={e => setPharmForm({...pharmForm, address: e.target.value})} /></div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 16 }}>Enregistrer</button>
        </form>
      )}

      {showForm && activeTab === 'agents' && (
        <form onSubmit={handleAddAgent} className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3>Créer un Agent Médical</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: 16 }}>
            <div className="form-group"><label className="form-label">Nom complet *</label><input type="text" className="form-input" required value={agentForm.fullName} onChange={e => setAgentForm({...agentForm, fullName: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Nom d'utilisateur *</label><input type="text" className="form-input" required value={agentForm.username} onChange={e => setAgentForm({...agentForm, username: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Mot de passe *</label><input type="password" className="form-input" required value={agentForm.password} onChange={e => setAgentForm({...agentForm, password: e.target.value})} /></div>
            <div className="form-group">
              <label className="form-label">Hôpital rattaché *</label>
              <select className="form-input" required value={agentForm.hospital_id} onChange={e => setAgentForm({...agentForm, hospital_id: e.target.value})}>
                <option value="">Sélectionnez un hôpital</option>
                {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 16 }}>Créer Agent</button>
        </form>
      )}

      {/* Listes */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {activeTab === 'hospitals' && (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid hsl(var(--border-color))' }}>
                <th style={{ padding: '12px' }}>Nom</th>
                <th style={{ padding: '12px' }}>Adresse</th>
                <th style={{ padding: '12px', width: '80px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map(h => (
                <tr key={h.id} style={{ borderBottom: '1px solid hsl(var(--border-color))' }}>
                  <td style={{ padding: '12px' }}>{h.name}</td>
                  <td style={{ padding: '12px' }}>{h.address}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button onClick={() => handleDelete('hospital', h.id)} className="icon-btn danger" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'hsl(var(--color-danger))' }}><Trash2 size={18}/></button>
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
                <th style={{ padding: '12px', width: '80px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pharmacies.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid hsl(var(--border-color))' }}>
                  <td style={{ padding: '12px' }}>{p.name}</td>
                  <td style={{ padding: '12px' }}>{p.address}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button onClick={() => handleDelete('pharmacy', p.id)} className="icon-btn danger" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'hsl(var(--color-danger))' }}><Trash2 size={18}/></button>
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
                <th style={{ padding: '12px', width: '80px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {agents.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid hsl(var(--border-color))' }}>
                  <td style={{ padding: '12px' }}>{a.fullName}</td>
                  <td style={{ padding: '12px' }}>{a.username}</td>
                  <td style={{ padding: '12px' }}>{hospitals.find(h => h.id === a.hospital_id)?.name || a.hospital_id}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button onClick={() => handleDelete('agent', a.id)} className="icon-btn danger" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'hsl(var(--color-danger))' }}><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
              {agents.length === 0 && <tr><td colSpan="4" style={{ padding: '16px', textAlign: 'center' }}>Aucun agent trouvé</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
