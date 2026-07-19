import { useState, useEffect, useCallback } from 'react'
import { Building2, Plus, MapPin, Activity, Users, Clock, Loader2 } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function HospitalsPanel() {
  const [hospitals, setHospitals] = useState([])
  const [hospitalStats, setHospitalStats] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newHospital, setNewHospital] = useState({ name: '', address: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const fetchHospitals = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`${API_URL}/hospitals/`)
      if (!res.ok) throw new Error('Erreur lors de la récupération des hôpitaux')
      const data = await res.json()
      setHospitals(data.data)
      
      // Fetch stats for each hospital
      const statsObj = {}
      for (const hosp of data.data) {
        try {
          const statRes = await fetch(`${API_URL}/hospitals/${hosp.id}/stats`)
          if (statRes.ok) {
            statsObj[hosp.id] = await statRes.json()
          }
        } catch (err) {
          console.error(`Erreur stats pour ${hosp.name}:`, err)
        }
      }
      setHospitalStats(statsObj)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHospitals()
  }, [fetchHospitals])

  const handleAddHospital = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/hospitals/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHospital)
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Erreur lors de la création')
      }
      
      await fetchHospitals()
      setIsModalOpen(false)
      setNewHospital({ name: '', address: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading && hospitals.length === 0) {
    return (
      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <div className="page-header">
          <h2>Réseau Hospitalier</h2>
          <p>Gestion des hôpitaux et centres de santé affiliés à QueueCare.</p>
        </div>
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Chargement du réseau...</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Réseau Hospitalier</h2>
          <p>Gestion des hôpitaux et centres de santé affiliés à QueueCare.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} />
          Ajouter un Hôpital
        </button>
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className="hospitals-grid">
        {hospitals.map((hosp) => {
          const stats = hospitalStats[hosp.id]
          return (
            <div key={hosp.id} className="hospital-card glass-panel-solid">
              <div className="hospital-card-header">
                <div className="hospital-icon">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="hospital-name">{hosp.name}</h3>
                  <div className="hospital-address">
                    <MapPin size={14} />
                    <span>{hosp.address}</span>
                  </div>
                </div>
              </div>

              {stats ? (
                <div className="hospital-stats-grid">
                  <div className="h-stat-box">
                    <span className="h-stat-icon purple"><Activity size={16} /></span>
                    <div>
                      <div className="h-stat-val">{stats.totalWaiting}</div>
                      <div className="h-stat-label">En attente</div>
                    </div>
                  </div>
                  <div className="h-stat-box">
                    <span className="h-stat-icon accent"><Users size={16} /></span>
                    <div>
                      <div className="h-stat-val">{stats.totalTreated}</div>
                      <div className="h-stat-label">Traités</div>
                    </div>
                  </div>
                  <div className="h-stat-box">
                    <span className="h-stat-icon warning"><Clock size={16} /></span>
                    <div>
                      <div className="h-stat-val">{stats.averageWaitMinutes}m</div>
                      <div className="h-stat-label">Temps Moyen</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hospital-stats-loading">
                  <Loader2 className="spin" size={20} />
                  <span>Chargement des métriques...</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal d'ajout */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Ajouter un Hôpital</h3>
              <p>Inscrire un nouveau centre dans le réseau QueueCare.</p>
            </div>
            
            <form onSubmit={handleAddHospital} className="consultation-form">
              <div className="form-group">
                <label>Nom de l'établissement</label>
                <input 
                  type="text" 
                  value={newHospital.name}
                  onChange={(e) => setNewHospital({...newHospital, name: e.target.value})}
                  placeholder="Ex: Hôpital Principal"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Adresse physique</label>
                <input 
                  type="text" 
                  value={newHospital.address}
                  onChange={(e) => setNewHospital({...newHospital, address: e.target.value})}
                  placeholder="Ex: Avenue Nelson Mandela, Dakar"
                  required 
                />
              </div>
              
              <div className="modal-actions" style={{ marginTop: '24px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Création...' : 'Ajouter l\'hôpital'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
