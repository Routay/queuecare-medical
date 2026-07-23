import { Stethoscope, LayoutDashboard, Pill, Clock, BarChart3, LogOut, CalendarDays, Settings, Users, Building2, Shield } from 'lucide-react'

export default function Sidebar({ activeTab, onTabChange, user, hospitalName, onLogout }) {
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
        {user?.role === 'Agent Médical' && (
          <button
            id="nav-doctors"
            className={`nav-item ${activeTab === 'doctors' ? 'active' : ''}`}
            onClick={() => onTabChange('doctors')}
          >
            <Users size={18} />
            <span>Médecins</span>
          </button>
        )}
        <button
          id="nav-stats"
          className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => onTabChange('stats')}
        >
          <BarChart3 size={18} />
          <span>Statistiques</span>
        </button>
        {user?.role === 'Admin' && (
          <button
            id="nav-admin"
            className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => onTabChange('admin')}
          >
            <Shield size={18} />
            <span>Administration</span>
          </button>
        )}
        <button
          id="nav-settings"
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => onTabChange('settings')}
        >
          <Settings size={18} />
          <span>Paramètres</span>
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

        {/* Hospital & Department badge */}
        {user && (
          <div style={{
            padding: '10px 14px', margin: '8px 12px', borderRadius: '8px',
            background: 'hsla(var(--color-primary)/0.08)',
            border: '1px solid hsla(var(--color-primary)/0.15)',
            fontSize: '0.78rem', color: 'hsl(var(--text-muted))',
            display: 'flex', flexDirection: 'column', gap: '4px'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={12} /> {hospitalName || user.hospital_id || 'Hôpital'}
            </span>
            {user.department && (
              <span style={{ color: 'hsl(var(--color-primary))', fontWeight: '500' }}>
                {user.department}
              </span>
            )}
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
