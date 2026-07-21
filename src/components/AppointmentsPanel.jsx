import { useState, useEffect } from 'react'
import { CalendarDays, Clock, Trash2, Check, X, Phone, RefreshCw, Plus, Calendar, CheckCircle, XCircle } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export default function AppointmentsPanel({ user, showToast, setError }) {
  const [availabilities, setAvailabilities] = useState([])
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Formulaire créneau
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newStartTime, setNewStartTime] = useState('')
  const [newEndTime, setNewEndTime] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [availRes, apptRes] = await Promise.all([
        fetch(`${API_URL}/appointments/availabilities?doctorId=${user?.id || 'doc_1'}`),
        fetch(`${API_URL}/appointments/?doctorId=${user?.id || 'doc_1'}`)
      ])
      if (availRes.ok) { const d = await availRes.json(); setAvailabilities(d.data || []) }
      if (apptRes.ok)  { const d = await apptRes.json();  setAppointments(d.data || []) }
    } catch {
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
        body: JSON.stringify({ doctorId: user?.id || 'doc_1', date: newDate, startTime: newStartTime, endTime: newEndTime })
      })
      if (res.ok) {
        showToast('Créneau ajouté avec succès !')
        setNewDate(''); setNewStartTime(''); setNewEndTime('')
        setShowAddForm(false)
        fetchData()
      } else {
        const err = await res.json()
        setError(err.detail || 'Erreur lors de l\'ajout du créneau')
      }
    } catch { setError('Erreur réseau.') }
  }

  const handleDeleteAvailability = async (id) => {
    try {
      const res = await fetch(`${API_URL}/appointments/availabilities/${id}`, { method: 'DELETE' })
      if (res.ok) { showToast('Créneau supprimé !'); fetchData() }
      else { const err = await res.json(); setError(err.detail || 'Erreur lors de la suppression') }
    } catch { setError('Erreur réseau.') }
  }

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) { showToast(`Rendez-vous marqué comme ${newStatus}.`); fetchData() }
      else { const err = await res.json(); setError(err.detail || 'Erreur de mise à jour') }
    } catch { setError('Erreur réseau.') }
  }

  // Aggrégation des données par date
  // On regroupe les créneaux libres (availabilities non bookés) et les rendez-vous
  const datesSet = new Set([
    ...availabilities.map(a => a.date),
    ...appointments.map(a => a.date)
  ])
  const sortedDates = Array.from(datesSet).sort((a, b) => new Date(a) - new Date(b))

  const groupedData = sortedDates.map(date => {
    // Créneaux libres pour cette date
    const freeAvails = availabilities.filter(a => a.date === date && !a.isBooked).map(a => ({
      type: 'free',
      id: a.id,
      startTime: a.startTime,
      endTime: a.endTime,
      obj: a
    }))
    
    // Rendez-vous pour cette date
    const appts = appointments.filter(a => a.date === date).map(a => ({
      type: 'appointment',
      id: a.id,
      startTime: a.startTime,
      endTime: a.endTime || `${parseInt(a.startTime.split(':')[0])+1}:00`, // Approximation
      status: a.status,
      obj: a
    }))

    // Trier les slots de la journée par heure de début
    const slots = [...freeAvails, ...appts].sort((a, b) => a.startTime.localeCompare(b.startTime))

    return { date, slots }
  })

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span>Chargement de l'emploi du temps...</span>
      </div>
    )
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Emploi du Temps</h2>
          <p>Gérez vos créneaux horaires et validez les demandes des patients.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="call-next-btn" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? <X size={16} /> : <Plus size={16} />}
            {showAddForm ? 'Fermer' : 'Nouveau Créneau'}
          </button>
          <button className="refresh-btn" onClick={fetchData} title="Actualiser">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Formulaire ajout créneau */}
      {showAddForm && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', animation: 'fadeIn 0.2s ease-out' }}>
          <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarDays size={18} color="hsl(160, 84%, 40%)" />
            Définir une disponibilité
          </h3>
          <form onSubmit={handleAddAvailability} className="appt-form" style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={newDate} onChange={e => setNewDate(e.target.value)} required />
            </div>
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              <label className="form-label">Heure de début</label>
              <input type="time" className="form-input" value={newStartTime} onChange={e => setNewStartTime(e.target.value)} required />
            </div>
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              <label className="form-label">Heure de fin</label>
              <input type="time" className="form-input" value={newEndTime} onChange={e => setNewEndTime(e.target.value)} required />
            </div>
            <button type="submit" className="call-next-btn" style={{ padding: '10px 24px', height: '42px' }}>
              Ajouter
            </button>
          </form>
        </div>
      )}

      {groupedData.length === 0 ? (
        <div className="empty-queue glass-panel" style={{ padding: '48px 0' }}>
          <Calendar size={48} color="hsl(var(--text-muted))" />
          <p style={{ fontSize: '1.1rem', marginTop: '16px' }}>Votre emploi du temps est vide.</p>
          <span style={{ color: 'hsl(var(--text-muted))' }}>Ajoutez des créneaux pour permettre la prise de rendez-vous.</span>
        </div>
      ) : (
        <div className="timetable-container">
          {groupedData.map(day => (
            <div key={day.date} className="timetable-day-card">
              <div className="timetable-day-header">
                <CalendarDays size={20} color="hsl(var(--color-primary))" />
                {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              
              <div className="timetable-slots-grid">
                {day.slots.map(slot => {
                  const isFree = slot.type === 'free';
                  const isPending = slot.type === 'appointment' && slot.status === 'pending';
                  const isConfirmed = slot.type === 'appointment' && slot.status === 'confirmed';
                  
                  return (
                    <div 
                      key={slot.id} 
                      className={`timetable-slot status-${isFree ? 'free' : isPending ? 'pending' : 'confirmed'}`}
                    >
                      <div className={`slot-badge-top badge-${isFree ? 'free' : isPending ? 'pending' : 'confirmed'}`}>
                        {isFree ? 'Libre' : isPending ? 'À Valider' : 'Confirmé'}
                      </div>
                      
                      <div className="slot-time">
                        <Clock size={16} /> 
                        {slot.startTime} {slot.endTime ? `— ${slot.endTime}` : ''}
                      </div>
                      
                      {isFree ? (
                        <div className="slot-details" style={{ display: 'flex', alignItems: 'center', color: 'hsl(var(--text-muted))' }}>
                          Créneau disponible pour réservation
                        </div>
                      ) : (
                        <div className="slot-details">
                          <div className="slot-patient">{slot.obj.patientName}</div>
                          <div className="slot-phone"><Phone size={14} /> {slot.obj.patientPhone}</div>
                          {slot.obj.reason && <div className="slot-reason">"{slot.obj.reason}"</div>}
                        </div>
                      )}
                      
                      <div className="slot-actions">
                        {isFree && (
                          <button onClick={() => handleDeleteAvailability(slot.id)} className="icon-btn danger" style={{ flex: 'none', width: '100%' }}>
                            <Trash2 size={16} /> Supprimer le créneau
                          </button>
                        )}
                        {isPending && (
                          <>
                            <button onClick={() => handleUpdateStatus(slot.id, 'confirmed')} className="appt-btn confirm" style={{ flex: 1, padding: '8px' }}>
                              <CheckCircle size={16} /> Accepter
                            </button>
                            <button onClick={() => handleUpdateStatus(slot.id, 'cancelled')} className="appt-btn cancel" style={{ flex: 1, padding: '8px' }}>
                              <XCircle size={16} /> Refuser
                            </button>
                          </>
                        )}
                        {isConfirmed && (
                          <button onClick={() => handleUpdateStatus(slot.id, 'completed')} className="call-next-btn" style={{ flex: 1, padding: '8px' }}>
                            <Check size={16} /> Terminer
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
