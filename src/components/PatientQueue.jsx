import { PhoneCall, Clock, UserCheck, Users as UsersIcon } from 'lucide-react'

export default function PatientQueue({ patients, department, onCallNext, isCalling }) {
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

  return (
    <div className="queue-section">
      <div className="queue-section-header">
        <h3>Patients — {department} ({patients.length})</h3>
        <button
          id="btn-call-next"
          className={`call-next-btn ${isCalling ? 'calling' : ''}`}
          onClick={onCallNext}
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
