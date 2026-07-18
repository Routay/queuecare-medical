import { Stethoscope, LayoutDashboard, Pill, Clock, BarChart3, LogOut, User, CalendarDays } from 'lucide-react'

export default function Sidebar({ activeTab, onTabChange, user, onLogout }) {
  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-logo">
        <Stethoscope size={28} />
        <div>
          <h1>QueueCare</h1>
          <span>Portail Médical</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          id="nav-queue"
          className={`nav-item ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => onTabChange('queue')}
        >
          <LayoutDashboard size={18} />
          <span>File d'Attente</span>
        </button>
        <button
          id="nav-pharmacies"
          className={`nav-item ${activeTab === 'pharmacies' ? 'active' : ''}`}
          onClick={() => onTabChange('pharmacies')}
        >
          <Pill size={18} />
          <span>Pharmacies</span>
        </button>
        {user?.role !== 'Agent Médical' && (
          <>
            <button
              id="nav-appointments"
              className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
              onClick={() => onTabChange('appointments')}
            >
              <CalendarDays size={18} />
              <span>Rendez-vous</span>
            </button>
            <button
              id="nav-history"
              className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => onTabChange('history')}
            >
              <Clock size={18} />
              <span>Historique</span>
            </button>
          </>
        )}
        <button
          id="nav-stats"
          className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => onTabChange('stats')}
        >
          <BarChart3 size={18} />
          <span>Statistiques</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        {/* Doctor Profile */}
        {user && (
          <div className="sidebar-profile" id="sidebar-profile">
            <div className="profile-avatar">{user.avatar || 'U'}</div>
            <div className="profile-info">
              <span className="profile-name">{user.fullName}</span>
              <span className="profile-role">{user.role}</span>
            </div>
          </div>
        )}

        <button className="nav-item" id="nav-logout" onClick={onLogout}>
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}
