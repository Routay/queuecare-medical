import { Users, UserCheck, Clock, Wifi } from 'lucide-react'

export default function StatCards({ departments, connectedCount }) {
  const totalWaiting = departments.reduce((sum, d) => sum + d.waitingCount, 0)
  const activeDepts = departments.filter(d => d.waitingCount > 0).length

  return (
    <div className="stats-grid">
      <div className="stat-card glass-panel primary" id="stat-total-waiting">
        <div className="stat-icon primary">
          <Users size={20} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{totalWaiting}</div>
          <div className="stat-label">Patients en attente</div>
        </div>
      </div>

      <div className="stat-card glass-panel accent" id="stat-active-depts">
        <div className="stat-icon accent">
          <UserCheck size={20} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{activeDepts}</div>
          <div className="stat-label">Services actifs</div>
        </div>
      </div>

      <div className="stat-card glass-panel warning" id="stat-avg-wait">
        <div className="stat-icon warning">
          <Clock size={20} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{totalWaiting > 0 ? `${Math.round(totalWaiting * 15 / Math.max(activeDepts, 1))}m` : '0m'}</div>
          <div className="stat-label">Attente moy.</div>
        </div>
      </div>

      <div className="stat-card glass-panel purple" id="stat-connections">
        <div className="stat-icon purple">
          <Wifi size={20} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{departments.length}</div>
          <div className="stat-label">Départements</div>
        </div>
      </div>
    </div>
  )
}
