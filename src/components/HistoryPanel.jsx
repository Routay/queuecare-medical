import { useState, useEffect, useCallback } from 'react'
import { Clock, Search, Filter, UserCheck, Calendar, ChevronDown, RefreshCw, Download } from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function HistoryPanel() {
  const [history, setHistory] = useState([])
  const [filteredHistory, setFilteredHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [departments, setDepartments] = useState([])

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`${API_URL}/queue/history/all`)
      if (!res.ok) throw new Error('Erreur serveur')
      const data = await res.json()
      setHistory(data)

      // Extraire les départements uniques
      const depts = [...new Set(data.map(h => h.department))]
      setDepartments(depts)
    } catch (err) {
      console.error('Fetch history error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // Filtrage dynamique
  useEffect(() => {
    let filtered = [...history]

    if (deptFilter !== 'all') {
      filtered = filtered.filter(h => h.department === deptFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(h =>
        h.ticketNumber?.toLowerCase().includes(q) ||
        h.treatedBy?.toLowerCase().includes(q) ||
        h.department?.toLowerCase().includes(q)
      )
    }

    setFilteredHistory(filtered)
  }, [history, deptFilter, search])

  const formatTime = (isoString) => {
    try {
      return new Date(isoString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return '--:--'
    }
  }

  const formatDate = (isoString) => {
    try {
      return new Date(isoString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    } catch {
      return '--'
    }
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(18)
    doc.setTextColor(33, 37, 41)
    doc.text('Historique des Consultations QueueCare', 14, 22)
    
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Généré le : ${new Date().toLocaleString('fr-FR')}`, 14, 30)

    const tableColumn = ["Ticket", "Service", "Arrivée", "Appelé", "Attente (min)", "Traité par"]
    const tableRows = []

    filteredHistory.forEach(entry => {
      const rowData = [
        entry.ticketNumber,
        entry.department,
        `${formatDate(entry.arrivalTime)} ${formatTime(entry.arrivalTime)}`,
        `${formatDate(entry.calledTime)} ${formatTime(entry.calledTime)}`,
        entry.waitMinutes?.toString() || '0',
        entry.treatedBy
      ]
      tableRows.push(rowData)
    })

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [43, 114, 219] },
      styles: { fontSize: 9 }
    })

    doc.save(`QueueCare_Historique_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Historique des Consultations</h2>
          <p>Retrouvez tous les patients traités avec les temps d'attente réels.</p>
        </div>
        <button className="call-next-btn" onClick={handleExportPDF} style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
          <Download size={18} />
          Exporter PDF
        </button>
      </div>

      {/* Filters bar */}
      <div className="history-filters" id="history-filters">
        <div className="search-bar">
          <Search size={16} />
          <input
            type="text"
            placeholder="Rechercher par ticket, médecin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="history-search"
          />
        </div>

        <div className="filter-group">
          <div className="select-wrapper">
            <Filter size={14} />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              id="history-dept-filter"
            >
              <option value="all">Tous les services</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <ChevronDown size={14} className="select-chevron" />
          </div>

          <button className="refresh-btn" onClick={fetchHistory} id="history-refresh">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="history-summary glass-panel">
        <div className="history-summary-item">
          <UserCheck size={18} />
          <div>
            <span className="summary-value">{history.length}</span>
            <span className="summary-label">Total traités</span>
          </div>
        </div>
        <div className="history-summary-divider"></div>
        <div className="history-summary-item">
          <Clock size={18} />
          <div>
            <span className="summary-value">
              {history.length > 0
                ? Math.round(history.reduce((sum, h) => sum + (h.waitMinutes || 0), 0) / history.length)
                : 0} min
            </span>
            <span className="summary-label">Attente moyenne</span>
          </div>
        </div>
        <div className="history-summary-divider"></div>
        <div className="history-summary-item">
          <Calendar size={18} />
          <div>
            <span className="summary-value">{filteredHistory.length}</span>
            <span className="summary-label">Résultats affichés</span>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Chargement de l'historique...</span>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="glass-panel empty-queue">
          <Clock size={48} />
          <h4>Aucun patient dans l'historique</h4>
          <p>
            {history.length === 0
              ? "Les patients traités apparaîtront ici après leur consultation."
              : "Aucun résultat pour les filtres sélectionnés."}
          </p>
        </div>
      ) : (
        <div className="history-table-wrapper glass-panel-solid">
          <table className="history-table" id="history-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Service</th>
                <th>Arrivée</th>
                <th>Appelé</th>
                <th>Attente</th>
                <th>Traité par</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((entry, index) => (
                <tr key={entry.id || index} style={{ animationDelay: `${index * 0.03}s` }}>
                  <td>
                    <span className="history-ticket">{entry.ticketNumber}</span>
                  </td>
                  <td>
                    <span className="history-dept-badge">{entry.department}</span>
                  </td>
                  <td className="history-time">
                    <span className="time-date">{formatDate(entry.arrivalTime)}</span>
                    <span className="time-hour">{formatTime(entry.arrivalTime)}</span>
                  </td>
                  <td className="history-time">
                    <span className="time-date">{formatDate(entry.calledTime)}</span>
                    <span className="time-hour">{formatTime(entry.calledTime)}</span>
                  </td>
                  <td>
                    <span className={`wait-badge ${entry.waitMinutes > 30 ? 'long' : entry.waitMinutes > 15 ? 'medium' : 'short'}`}>
                      {entry.waitMinutes} min
                    </span>
                  </td>
                  <td className="history-doctor">{entry.treatedBy}</td>
                  <td>
                    <span className="status-treated">Traité ✓</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
