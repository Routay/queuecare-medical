import { useState, useEffect } from 'react'
import { UserPlus, Users, Search, Shield, Trash2, Edit3, X, Check, Building2, Stethoscope, Phone, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react'

// Generate a random password
const generatePassword = () => {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let pwd = ''
  for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)]
  return pwd
}

export default function DoctorsPanel({ user }) {
  const [doctors, setDoctors] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  const [formData, setFormData] = useState({
    fullName: '', username: '', role: 'Médecin', department: '',
    status: 'Actif', phone: '', email: '', password: generatePassword()
  })

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/users?hospital_id=${user.hospital_id}`)
      if (res.ok) {
        const data = await res.json()
        const hospitalStaff = data.data.filter(u => u.role !== 'Agent Médical' && u.role !== 'Admin')
        setDoctors(hospitalStaff)
      }
    } catch (e) {
      setError("Erreur de chargement des médecins.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      fullName: '', username: '', role: 'Médecin', department: '',
      status: 'Actif', phone: '', email: '', password: generatePassword()
    })
    setShowAddForm(false)
    setEditingId(null)
    setShowPassword(false)
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.fullName || !formData.username || !formData.department) return

    if (editingId) {
      try {
        const payload = {
          username: formData.username,
          fullName: formData.fullName,
          department: formData.department,
          hospital_id: user.hospital_id
        }
        if (formData.password.trim()) {
          payload.password = formData.password
        }
        const res = await fetch(`${API_URL}/auth/users/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (res.ok) {
          fetchDoctors()
          resetForm()
        } else {
          const err = await res.json()
          setError(err.detail || "Erreur lors de la modification.")
        }
      } catch (e) {
        setError("Erreur réseau.")
      }
    } else {
      try {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
            fullName: formData.fullName,
            role: formData.role,
            department: formData.department,
            avatar: formData.fullName.substring(0, 2).toUpperCase(),
            hospital_id: user.hospital_id
          })
        })
        if (res.ok) {
          fetchDoctors()
          resetForm()
        } else {
          const err = await res.json()
          setError(err.detail || "Erreur lors de la création.")
        }
      } catch (e) {
        setError("Erreur réseau.")
      }
    }
  }

  const handleEdit = (doctor) => {
    setFormData({ ...doctor, password: generatePassword(), status: doctor.status || 'Actif' })
    setEditingId(doctor.id)
    setShowAddForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce médecin ?')) {
      try {
        const res = await fetch(`${API_URL}/auth/users/${id}`, { method: 'DELETE' })
        if (res.ok) {
          fetchDoctors()
        } else {
          const err = await res.json()
          setError(err.detail || "Erreur de suppression.")
        }
      } catch (e) {
        setError("Erreur réseau.")
      }
    }
  }

  const filteredDoctors = doctors.filter(d =>
    d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statusColor = (status) => {
    if (status === 'Actif') return '--color-accent'
    if (status === 'En congé') return '--color-warning'
    return '--color-danger'
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Users size={24} /> Gestion du Personnel Médical</h2>
          <p style={{ color: 'hsl(var(--text-muted))' }}>Ajoutez, modifiez et gérez les médecins de votre établissement.</p>
        </div>
        <button className="call-next-btn" onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) resetForm() }}>
          {showAddForm ? <X size={16} /> : <UserPlus size={16} />}
          {showAddForm ? 'Fermer' : 'Ajouter un Médecin'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px', animation: 'fadeIn 0.2s ease-out' }}>
          <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={18} color="hsl(var(--color-primary))" />
            {editingId ? 'Modifier le Médecin' : 'Nouveau Médecin'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Nom complet *</label>
                <input type="text" className="form-input" placeholder="Dr. Prénom Nom"
                  value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Nom d'utilisateur *</label>
                <input type="text" className="form-input" placeholder="dr.nom"
                  value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Rôle</label>
                <select className="form-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="Médecin">Médecin</option>
                  <option value="Chirurgien">Chirurgien</option>
                  <option value="Spécialiste">Spécialiste</option>
                  <option value="Interne">Interne</option>
                  <option value="Agent Médical">Agent Médical</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Département *</label>
                <input type="text" className="form-input" placeholder="ex: Cardiologie"
                  value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Statut</label>
                <select className="form-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Actif">Actif</option>
                  <option value="En congé">En congé</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Téléphone</label>
                <input type="tel" className="form-input" placeholder="+221 7X XXX XX XX"
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email</label>
                <input type="email" className="form-input" placeholder="medecin@queuecare.sn"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Mot de passe généré
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-muted))', padding: 0 }}>
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type={showPassword ? 'text' : 'password'} className="form-input" value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})} style={{ flex: 1 }} />
                  <button type="button" onClick={() => setFormData({...formData, password: generatePassword()})}
                    className="refresh-btn" style={{ padding: '8px 16px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    Régénérer
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid hsl(var(--border-color)/0.3)' }}>
              <button type="button" onClick={resetForm} className="refresh-btn" style={{ padding: '10px 24px' }}>Annuler</button>
              <button type="submit" className="call-next-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}>
                <Check size={16} /> {editingId ? 'Mettre à jour' : 'Créer le compte'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search bar */}
      {error && (
        <div className="error-banner" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'hsla(var(--color-danger)/0.1)', color: 'hsl(var(--color-danger))', borderRadius: '8px', marginBottom: '16px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={18} color="hsl(var(--text-muted))" />
        <input type="text" className="form-input" placeholder="Rechercher un médecin par nom, département ou rôle..."
          value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          style={{ border: 'none', background: 'transparent', flex: 1, padding: '8px 0' }} />
      </div>

      {/* Doctors list */}
      {isLoading ? (
        <div className="loading-container"><div className="spinner"></div></div>
      ) : filteredDoctors.length === 0 ? (
        <div className="empty-queue glass-panel" style={{ padding: '48px 0' }}>
          <Users size={48} color="hsl(var(--text-muted))" style={{ opacity: 0.3 }} />
          <p style={{ fontSize: '1.1rem', marginTop: '16px' }}>Aucun médecin trouvé.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {filteredDoctors.map(doctor => (
            <div key={doctor.id} className="glass-panel" style={{
              padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px',
              transition: 'all 0.2s', cursor: 'default'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, hsl(var(--color-primary)), hsl(var(--color-accent)))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.9rem', fontWeight: '700', color: 'white', flexShrink: 0
                  }}>
                    {doctor.fullName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '1rem' }}>{doctor.fullName}</div>
                    <div style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>@{doctor.username}</div>
                  </div>
                </div>
                <span style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600',
                  background: `hsla(var(${statusColor(doctor.status)})/0.15)`,
                  color: `hsl(var(${statusColor(doctor.status)}))`
                }}>
                  {doctor.status}
                </span>
              </div>

              {/* Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Stethoscope size={14} /> {doctor.role} — {doctor.department}</span>
                {doctor.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} /> {doctor.phone}</span>}
                {doctor.email && <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14} /> {doctor.email}</span>}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', borderTop: '1px solid hsl(var(--border-color)/0.3)', paddingTop: '12px' }}>
                <button onClick={() => handleEdit(doctor)} className="refresh-btn"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px' }}>
                  <Edit3 size={14} /> Modifier
                </button>
                <button onClick={() => handleDelete(doctor.id)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '8px', border: '1px solid hsl(var(--color-danger)/0.3)', borderRadius: '8px',
                    background: 'hsla(var(--color-danger)/0.1)', color: 'hsl(var(--color-danger))',
                    cursor: 'pointer', fontWeight: '500', fontSize: '0.85rem', transition: 'all 0.2s'
                  }}>
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div style={{ marginTop: '20px', padding: '12px 20px', borderRadius: '8px', background: 'hsl(var(--bg-elevated))', color: 'hsl(var(--text-muted))', fontSize: '0.85rem', display: 'flex', gap: '20px' }}>
        <span>Total : <strong style={{ color: 'hsl(var(--text-primary))' }}>{doctors.length}</strong> médecins</span>
        <span>Actifs : <strong style={{ color: 'hsl(var(--color-accent))' }}>{doctors.filter(d => d.status === 'Actif').length}</strong></span>
        <span>En congé : <strong style={{ color: 'hsl(var(--color-warning))' }}>{doctors.filter(d => d.status === 'En congé').length}</strong></span>
      </div>
    </div>
  )
}
