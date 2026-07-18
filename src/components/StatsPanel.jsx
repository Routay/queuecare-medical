import { useState, useEffect, useCallback } from 'react'
import { BarChart3, Users, Clock, TrendingUp, Activity, Zap, RefreshCw } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function StatsPanel({ user }) {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      if (!user?.hospital_id) return;
      setIsLoading(true)
      const res = await fetch(`${API_URL}/queue/statistics/overview?hospital_id=${user.hospital_id}`)
      if (!res.ok) throw new Error('Erreur serveur')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error('Fetch stats error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 10000) // Refresh every 10s
    return () => clearInterval(interval)
  }, [fetchStats])

  if (isLoading && !stats) {
    return (
      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <div className="page-header">
          <h2>Statistiques en Temps Réel</h2>
          <p>Analyse des performances de l'écosystème QueueCare.</p>
        </div>
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Chargement des statistiques...</span>
        </div>
      </div>
    )
  }

  if (!stats) return null

  // Calculate max for bar chart scaling
  const maxDeptTotal = Math.max(...stats.departmentStats.map(d => d.total), 1)

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Statistiques en Temps Réel</h2>
          <p>Analyse des performances de l'écosystème QueueCare.</p>
        </div>
        <button className="refresh-btn" onClick={fetchStats} id="stats-refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stats-kpi-grid">
        <div className="kpi-card glass-panel" id="kpi-tickets">
          <div className="kpi-icon primary">
            <Zap size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.totalTicketsCreated}</span>
            <span className="kpi-label">Tickets Créés</span>
          </div>
          <div className="kpi-trend up">
            <TrendingUp size={14} />
          </div>
        </div>

        <div className="kpi-card glass-panel" id="kpi-treated">
          <div className="kpi-icon accent">
            <Users size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.totalPatientsTreated}</span>
            <span className="kpi-label">Patients Traités</span>
          </div>
          <div className="kpi-trend up">
            <TrendingUp size={14} />
          </div>
        </div>

        <div className="kpi-card glass-panel" id="kpi-waiting">
          <div className="kpi-icon warning">
            <Clock size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.totalWaiting}</span>
            <span className="kpi-label">En Attente</span>
          </div>
        </div>

        <div className="kpi-card glass-panel" id="kpi-avgwait">
          <div className="kpi-icon purple">
            <Activity size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.averageWaitMinutes} <small>min</small></span>
            <span className="kpi-label">Temps Moyen</span>
          </div>
        </div>
      </div>

      {/* Busiest Department Highlight */}
      <div className="stats-highlight glass-panel" id="busiest-dept">
        <BarChart3 size={20} />
        <span>
          Service le plus sollicité : <strong>{stats.busiestDepartment}</strong>
        </span>
      </div>

      {/* Department Bar Chart */}
      <div className="stats-chart-section">
        <h3 className="stats-section-title">
          <BarChart3 size={18} />
          Répartition par Service
        </h3>

        <div className="stats-chart glass-panel-solid" id="dept-chart">
          {stats.departmentStats.map((dept, index) => (
            <div
              className="chart-row"
              key={dept.name}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="chart-label">
                <span className="chart-dept-name">{dept.name}</span>
                <span className="chart-dept-total">{dept.total} patients</span>
              </div>

              <div className="chart-bars">
                {/* Treated bar */}
                <div className="chart-bar-track">
                  <div
                    className="chart-bar treated"
                    style={{ width: `${(dept.treated / maxDeptTotal) * 100}%` }}
                  >
                    {dept.treated > 0 && <span>{dept.treated}</span>}
                  </div>
                </div>
                {/* Waiting bar */}
                <div className="chart-bar-track">
                  <div
                    className="chart-bar waiting"
                    style={{ width: `${(dept.waiting / maxDeptTotal) * 100}%` }}
                  >
                    {dept.waiting > 0 && <span>{dept.waiting}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-dot treated"></span>
              Traités
            </div>
            <div className="legend-item">
              <span className="legend-dot waiting"></span>
              En attente
            </div>
          </div>
        </div>
      </div>

      {/* Activity indicator */}
      <div className="stats-live-indicator">
        <span className="live-dot"></span>
        Données en temps réel — Dernière mise à jour : {new Date(stats.timestamp).toLocaleTimeString('fr-FR')}
      </div>
    </div>
  )
}
