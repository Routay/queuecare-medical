import { useState, useEffect } from 'react'
import { CalendarDays, Clock, Trash2, Check, X, CheckCircle2, User, Phone } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export default function AppointmentsPanel({ user, showToast, setError }) {
  const [availabilities, setAvailabilities] = useState([])
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Formulaire d'ajout
  const [newDate, setNewDate] = useState('')
  const [newStartTime, setNewStartTime] = useState('')
  const [newEndTime, setNewEndTime] = useState('')

  // Reschedule state
  const [rescheduleApptId, setRescheduleApptId] = useState(null)
  const [selectedRescheduleAvailId, setSelectedRescheduleAvailId] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [availRes, apptRes] = await Promise.all([
        fetch(`${API_URL}/appointments/availabilities?doctorId=${user?.id || 'doc_1'}`),
        fetch(`${API_URL}/appointments/?doctorId=${user?.id || 'doc_1'}`)
      ])
      
      if (availRes.ok) {
        const data = await availRes.json()
        setAvailabilities(data.data || [])
      }
      if (apptRes.ok) {
        const data = await apptRes.json()
        setAppointments(data.data || [])
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Impossible de charger les données de rendez-vous.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddAvailability = async (e) => {
    e.preventDefault()
    if (!newDate || !newStartTime || !newEndTime) return

    try {
      const res = await fetch(`${API_URL}/appointments/availabilities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: user?.id || 'doc_1',
          date: newDate,
          startTime: newStartTime,
          endTime: newEndTime
        })
      })

      if (res.ok) {
        showToast('Créneau ajouté avec succès !')
        setNewDate('')
        setNewStartTime('')
        setNewEndTime('')
        fetchData()
      } else {
        const err = await res.json()
        setError(err.detail || 'Erreur lors de l\'ajout du créneau')
      }
    } catch (err) {
      setError('Erreur réseau.')
    }
  }

  const handleDeleteAvailability = async (id) => {
    try {
      const res = await fetch(`${API_URL}/appointments/availabilities/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        showToast('Créneau supprimé !')
        fetchData()
      } else {
        const err = await res.json()
        setError(err.detail || 'Erreur lors de la suppression')
      }
    } catch (err) {
      setError('Erreur réseau.')
    }
  }

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        showToast(`Rendez-vous marqué comme ${newStatus}.`)
        fetchData()
      } else {
        const err = await res.json()
        setError(err.detail || 'Erreur de mise à jour')
      }
    } catch (err) {
      setError('Erreur réseau.')
    }
  }

  const handleReschedule = async (appointmentId) => {
    if (!selectedRescheduleAvailId) {
      setError('Veuillez sélectionner un nouveau créneau.')
      return
    }
    
    try {
      const res = await fetch(`${API_URL}/appointments/${appointmentId}/reschedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newAvailabilityId: selectedRescheduleAvailId })
      })

      if (res.ok) {
        showToast('Rendez-vous reporté avec succès !')
        setRescheduleApptId(null)
        setSelectedRescheduleAvailId('')
        fetchData()
      } else {
        const err = await res.json()
        setError(err.detail || 'Erreur lors du report')
      }
    } catch (err) {
      setError('Erreur réseau.')
    }
  }

  // Grouper les rendez-vous par statut
  const pendingAppointments = appointments.filter(a => a.status === 'pending')
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed')
  const otherAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled')

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="page-header">
        <h2>Gestion des Rendez-vous</h2>
        <p>Gérez vos créneaux horaires et validez les demandes des patients.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Colonne de gauche : Disponibilités */}
        <div className="dashboard-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <CalendarDays size={24} color="#0D9488" />
            <h3 style={{ margin: 0, fontSize: '18px' }}>Mes Créneaux</h3>
          </div>

          <form onSubmit={handleAddAvailability} style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Date</label>
              <input 
                type="date" 
                value={newDate} 
                onChange={e => setNewDate(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>De</label>
              <input 
                type="time" 
                value={newStartTime} 
                onChange={e => setNewStartTime(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>À</label>
              <input 
                type="time" 
                value={newEndTime} 
                onChange={e => setNewEndTime(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                required
              />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '10px 16px', height: '42px' }}>
              Ajouter
            </button>
          </form>

          {isLoading ? (
            <div className="spinner" style={{ margin: 'auto' }}></div>
          ) : availabilities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>Aucun créneau défini.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {availabilities.sort((a,b) => new Date(a.date) - new Date(b.date)).map(avail => (
                <div key={avail.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: avail.isBooked ? '#F1F5F9' : '#F0FDFA',
                  border: `1px solid ${avail.isBooked ? '#E2E8F0' : '#CCFBF1'}`,
                  borderRadius: '12px'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CalendarDays size={16} /> {avail.date}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <Clock size={16} /> {avail.startTime} - {avail.endTime}
                    </div>
                  </div>
                  
                  {avail.isBooked ? (
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748B', backgroundColor: '#E2E8F0', padding: '4px 10px', borderRadius: '20px' }}>
                      Réservé
                    </span>
                  ) : (
                    <button 
                      onClick={() => handleDeleteAvailability(avail.id)}
                      style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
                      title="Supprimer le créneau"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Colonne de droite : Rendez-vous */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="dashboard-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Nouvelles Demandes <span className="badge" style={{ backgroundColor: '#F59E0B' }}>{pendingAppointments.length}</span>
            </h3>
            
            {pendingAppointments.length === 0 ? (
              <div style={{ color: '#64748B', fontSize: '14px' }}>Aucune demande en attente.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pendingAppointments.map(appt => (
                  <div key={appt.id} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ fontWeight: '600', color: '#0F172A' }}>{appt.patientName}</div>
                      <div style={{ fontSize: '14px', color: '#0D9488', fontWeight: '500' }}>
                        {appt.date} ({appt.startTime})
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <Phone size={14} /> {appt.patientPhone}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleUpdateStatus(appt.id, 'confirmed')}
                        style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', backgroundColor: '#10B981', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                      >
                        <Check size={16} /> Accepter
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(appt.id, 'cancelled')}
                        style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', backgroundColor: '#F1F5F9', color: '#EF4444', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                      >
                        <X size={16} /> Refuser
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Rendez-vous Confirmés <span className="badge" style={{ backgroundColor: '#10B981' }}>{confirmedAppointments.length}</span>
            </h3>

            {confirmedAppointments.length === 0 ? (
              <div style={{ color: '#64748B', fontSize: '14px' }}>Aucun rendez-vous à venir.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {confirmedAppointments.map(appt => (
                  <div key={appt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderLeft: '4px solid #10B981', backgroundColor: '#F8FAFC', borderRadius: '0 8px 8px 0' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{appt.patientName}</div>
                      <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{appt.date} • {appt.startTime}</div>
                    </div>
                    
                    {rescheduleApptId === appt.id ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select 
                          value={selectedRescheduleAvailId} 
                          onChange={(e) => setSelectedRescheduleAvailId(e.target.value)}
                          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}
                        >
                          <option value="">Choisir un créneau...</option>
                          {availabilities.filter(a => !a.isBooked).map(a => (
                            <option key={a.id} value={a.id}>{a.date} ({a.startTime})</option>
                          ))}
                        </select>
                        <button onClick={() => handleReschedule(appt.id)} className="btn-primary" style={{ padding: '6px 10px', fontSize: '12px' }}>
                          Valider
                        </button>
                        <button onClick={() => setRescheduleApptId(null)} style={{ padding: '6px 10px', fontSize: '12px', background: 'none', border: '1px solid #CBD5E1', borderRadius: '4px', cursor: 'pointer' }}>
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => setRescheduleApptId(appt.id)}
                          style={{ padding: '8px 12px', fontSize: '13px', backgroundColor: '#F1F5F9', color: '#0F172A', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                        >
                          Reporter
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(appt.id, 'completed')}
                          className="btn-primary" 
                          style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '6px' }}
                        >
                          Terminer
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
