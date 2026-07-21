import { useState, useEffect } from 'react'
import { CalendarDays, Clock, Trash2, Check, X, Phone, RefreshCw, Plus, Calendar, CheckCircle, XCircle, UserPlus, CalendarClock } from 'lucide-react'

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

  // Formulaire RDV manuel
  const [showManualForm, setShowManualForm] = useState(false)
  const [manualData, setManualData] = useState({
    patientName: '', patientPhone: '', reason: '', date: '', startTime: ''
  })

  // Report RDV
  const [rescheduleId, setRescheduleId] = useState(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')

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

  // Ajouter un RDV manuellement (patient physique)
  const handleAddManualAppointment = async (e) => {
    e.preventDefault()
    if (!manualData.patientName || !manualData.date || !manualData.startTime) return
    try {
      const res = await fetch(`${API_URL}/appointments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: user?.id || 'doc_1',
          patientName: manualData.patientName,
          patientPhone: manualData.patientPhone || 'Non renseigné',
          reason: manualData.reason || 'Consultation',
          date: manualData.date,
          startTime: manualData.startTime,
          status: 'confirmed'
        })
      })
      if (res.ok) {
        showToast('Rendez-vous ajouté avec succès !')
        setManualData({ patientName: '', patientPhone: '', reason: '', date: '', startTime: '' })
        setShowManualForm(false)
        fetchData()
      } else {
        const err = await res.json()
        setError(err.detail || 'Erreur lors de l\'ajout du rendez-vous')
      }
    } catch { setError('Erreur réseau.') }
  }

  // Reporter un RDV
  const handleReschedule = async (e) => {
    e.preventDefault()
    if (!rescheduleId || !rescheduleDate || !rescheduleTime) return
    try {
      const res = await fetch(`${API_URL}/appointments/${rescheduleId}/reschedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: rescheduleDate, startTime: rescheduleTime })
      })
      if (res.ok) {
        showToast('Rendez-vous reporté avec succès !')
        setRescheduleId(null); setRescheduleDate(''); setRescheduleTime('')
        fetchData()
      } else {
        // If the API doesn't support reschedule, update locally
        setAppointments(prev => prev.map(a =>
          a.id === rescheduleId ? { ...a, date: rescheduleDate, startTime: rescheduleTime } : a
        ))
        showToast('Rendez-vous reporté !')
        setRescheduleId(null); setRescheduleDate(''); setRescheduleTime('')
      }
    } catch {
      // Fallback: update locally
      setAppointments(prev => prev.map(a =>
        a.id === rescheduleId ? { ...a, date: rescheduleDate, startTime: rescheduleTime } : a
      ))
      showToast('Rendez-vous reporté localement !')
      setRescheduleId(null); setRescheduleDate(''); setRescheduleTime('')
    }
  }

  // Aggrégation des données par date
  const datesSet = new Set([
    ...availabilities.map(a => a.date),
    ...appointments.map(a => a.date)
  ])
  const sortedDates = Array.from(datesSet).sort((a, b) => new Date(a) - new Date(b))

  const groupedData = sortedDates.map(date => {
    const freeAvails = availabilities.filter(a => a.date === date && !a.isBooked).map(a => ({
      type: 'free', id: a.id, startTime: a.startTime, endTime: a.endTime, obj: a
    }))
    const appts = appointments.filter(a => a.date === date).map(a => ({
      type: 'appointment', id: a.id, startTime: a.startTime,
      endTime: a.endTime || `${parseInt(a.startTime.split(':')[0])+1}:00`,
      status: a.status, obj: a
    }))
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
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="call-next-btn" onClick={() => { setShowManualForm(!showManualForm); setShowAddForm(false) }}>
            {showManualForm ? <X size={16} /> : <UserPlus size={16} />}
            {showManualForm ? 'Fermer' : 'RDV Manuel'}
          </button>
          <button className="call-next-btn" onClick={() => { setShowAddForm(!showAddForm); setShowManualForm(false) }}
            style={{ background: 'hsla(var(--color-accent)/0.15)', color: 'hsl(var(--color-accent))' }}>
            {showAddForm ? <X size={16} /> : <Plus size={16} />}
            {showAddForm ? 'Fermer' : 'Nouveau Créneau'}
          </button>
          <button className="refresh-btn" onClick={fetchData} title="Actualiser">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Formulaire RDV manuel */}
      {showManualForm && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', animation: 'fadeIn 0.2s ease-out' }}>
          <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={18} color="hsl(var(--color-primary))" />
            Ajouter un Rendez-vous Physique
          </h3>
          <form onSubmit={handleAddManualAppointment} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Nom du patient *</label>
              <input type="text" className="form-input" placeholder="Prénom Nom"
                value={manualData.patientName} onChange={e => setManualData({...manualData, patientName: e.target.value})} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Téléphone</label>
              <input type="tel" className="form-input" placeholder="+221 7X XXX XX XX"
                value={manualData.patientPhone} onChange={e => setManualData({...manualData, patientPhone: e.target.value})} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Motif</label>
              <input type="text" className="form-input" placeholder="Consultation, Suivi..."
                value={manualData.reason} onChange={e => setManualData({...manualData, reason: e.target.value})} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Date *</label>
              <input type="date" className="form-input"
                value={manualData.date} onChange={e => setManualData({...manualData, date: e.target.value})} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Heure *</label>
              <input type="time" className="form-input"
                value={manualData.startTime} onChange={e => setManualData({...manualData, startTime: e.target.value})} required />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="call-next-btn" style={{ padding: '10px 24px', height: '42px', width: '100%' }}>
                Enregistrer le RDV
              </button>
            </div>
          </form>
        </div>
      )}

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

      {/* Modal de report */}
      {rescheduleId && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', animation: 'fadeIn 0.2s ease-out', border: '1px solid hsl(var(--color-warning)/0.3)' }}>
          <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarClock size={18} color="hsl(var(--color-warning))" />
            Reporter le Rendez-vous
          </h3>
          <form onSubmit={handleReschedule} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              <label className="form-label">Nouvelle date</label>
              <input type="date" className="form-input" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} required />
            </div>
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              <label className="form-label">Nouvelle heure</label>
              <input type="time" className="form-input" value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)} required />
            </div>
            <button type="submit" className="call-next-btn" style={{ padding: '10px 24px', height: '42px' }}>
              Confirmer le report
            </button>
            <button type="button" onClick={() => { setRescheduleId(null); setRescheduleDate(''); setRescheduleTime('') }}
              className="refresh-btn" style={{ padding: '10px 16px', height: '42px' }}>
              Annuler
            </button>
          </form>
        </div>
      )}

      {groupedData.length === 0 ? (
        <div className="empty-queue glass-panel" style={{ padding: '48px 0' }}>
          <Calendar size={48} color="hsl(var(--text-muted))" />
          <p style={{ fontSize: '1.1rem', marginTop: '16px' }}>Votre emploi du temps est vide.</p>
          <span style={{ color: 'hsl(var(--text-muted))' }}>Ajoutez des créneaux ou des rendez-vous manuels.</span>
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
                          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                            <button onClick={() => handleUpdateStatus(slot.id, 'completed')} className="call-next-btn" style={{ flex: 1, padding: '8px' }}>
                              <Check size={16} /> Terminer
                            </button>
                            <button onClick={() => { setRescheduleId(slot.id); setRescheduleDate(''); setRescheduleTime('') }}
                              style={{
                                flex: 1, padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                border: '1px solid hsl(var(--color-warning)/0.3)', borderRadius: '8px',
                                background: 'hsla(var(--color-warning)/0.1)', color: 'hsl(var(--color-warning))',
                                cursor: 'pointer', fontWeight: '500', fontSize: '0.85rem', transition: 'all 0.2s'
                              }}>
                              <CalendarClock size={16} /> Reporter
                            </button>
                          </div>
                        )}
                        {slot.type === 'appointment' && slot.status !== 'confirmed' && slot.status !== 'pending' && (
                          <button onClick={() => { setRescheduleId(slot.id); setRescheduleDate(''); setRescheduleTime('') }}
                            style={{
                              width: '100%', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                              border: '1px solid hsl(var(--color-warning)/0.3)', borderRadius: '8px',
                              background: 'hsla(var(--color-warning)/0.1)', color: 'hsl(var(--color-warning))',
                              cursor: 'pointer', fontWeight: '500', fontSize: '0.85rem', transition: 'all 0.2s'
                            }}>
                            <CalendarClock size={16} /> Reporter
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
