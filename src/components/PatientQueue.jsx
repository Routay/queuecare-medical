import { PhoneCall, Clock, UserCheck, Users as UsersIcon, AlertCircle, X, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export default function PatientQueue({ patients, department, onCallNext, isCalling }) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleCallNextClick = () => {
    if (patients.length > 0) {
      setShowConfirm(true)
    }
  }

  const handleConfirm = () => {
    setShowConfirm(false)
    onCallNext()
  }

  if (patients.length === 0) {
    return (
      <div className="queue-section">
        <div className="queue-section-header">
          <h3>Patients — {department}</h3>
        </div>
        <div className="glass-panel empty-queue">
          <UsersIcon size={48} />
          <h4>Aucun patient en attente</h4>
          <p>La file d'attente pour {department} est vide.</p>
        </div>
      </div>
    )
  }

  const nextPatient = patients[0]

  return (
    <>
      <div className="queue-section">
        <div className="queue-section-header">
          <h3>Patients — {department} ({patients.length})</h3>
          <button
            id="btn-call-next"
            className={`call-next-btn ${isCalling ? 'calling' : ''}`}
            onClick={handleCallNextClick}
            disabled={isCalling || patients.length === 0}
          >
            <PhoneCall size={18} />
            {isCalling ? 'Appel en cours...' : 'Appeler le suivant'}
          </button>
        </div>

        <div className="patient-list">
          {patients.map((patient, index) => (
            <div
              key={patient.id}
              className={`patient-card glass-panel ${index === 0 ? 'first' : ''}`}
              style={{ animationDelay: `${index * 0.05}s` }}
              id={`patient-${patient.id}`}
            >
              <div className="patient-position">
                {index + 1}
              </div>
              <div className="patient-avatar">
                <UserCheck size={16} />
              </div>
              <div className="patient-info">
                <div className="patient-ticket">{patient.ticketNumber}</div>
                <div className="patient-meta">
                  <Clock size={12} />
                  <span>{formatTimestamp(patient.timestamp)}</span>
                  <span>•</span>
                  <span>~{(index + 1) * 15} min</span>
                </div>
              </div>
              <div className={`patient-status ${index === 0 ? 'next' : 'waiting'}`}>
                {index === 0 ? '→ Suivant' : 'En attente'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div
            className="modal-content glass-panel"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '440px' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: 'rgba(236, 72, 153, 0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <PhoneCall size={22} color="hsl(160, 84%, 55%)" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Confirmer l'appel</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'hsl(220, 13%, 55%)' }}>Service : {department}</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfirm(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(220, 13%, 55%)', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Patient preview */}
            <div style={{
              background: 'hsl(222, 47%, 11%)',
              border: '1px solid hsl(220, 20%, 22%)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'rgba(160, 232, 160, 0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <UserCheck size={18} color="hsl(160, 84%, 55%)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{nextPatient.ticketNumber}</div>
                  <div style={{ fontSize: '0.8rem', color: 'hsl(220, 13%, 55%)' }}>
                    En attente depuis {formatTimestamp(nextPatient.timestamp)}
                  </div>
                </div>
                <span className="patient-status next" style={{ marginLeft: 'auto' }}>→ Suivant</span>
              </div>
            </div>

            <p style={{ color: 'hsl(220, 13%, 65%)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
              Êtes-vous prêt à recevoir ce patient ? Il sera retiré de la file d'attente et marqué comme appelé.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirm(false)}
                style={{ flex: 1 }}
              >
                <X size={16} /> Annuler
              </button>
              <button
                className="call-next-btn"
                onClick={handleConfirm}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <CheckCircle size={18} />
                Confirmer l'appel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function formatTimestamp(isoString) {
  try {
    const date = new Date(isoString)
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '--:--'
  }
}
