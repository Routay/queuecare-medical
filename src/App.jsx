import { useState, useEffect, useCallback } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'
import LoginScreen from './components/LoginScreen'
import Sidebar from './components/Sidebar'
import StatCards from './components/StatCards'
import PatientQueue from './components/PatientQueue'
import PharmacyDirectory from './components/PharmacyDirectory'
import HistoryPanel from './components/HistoryPanel'
import StatsPanel from './components/StatsPanel'

// Configuration centralisée
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Intervalle de rafraîchissement automatique (5 secondes)
const REFRESH_INTERVAL = 5000

export default function App() {
  // ═══════════════════════════════
  //  Auth state
  // ═══════════════════════════════
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authToken, setAuthToken] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)

  const [activeTab, setActiveTab] = useState('queue')
  const [departments, setDepartments] = useState([])
  const [selectedDept, setSelectedDept] = useState(null)
  const [patients, setPatients] = useState([])
  const [pharmacies, setPharmacies] = useState([])
  const [isLoadingQueue, setIsLoadingQueue] = useState(true)
  const [isLoadingPharmacies, setIsLoadingPharmacies] = useState(true)
  const [isCalling, setIsCalling] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  // ═══════════════════════════════
  //  Auth handlers
  // ═══════════════════════════════
  const handleLogin = (token, user) => {
    setAuthToken(token)
    setCurrentUser(user)
    setIsAuthenticated(true)
  }

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout?token=${authToken}`, { method: 'POST' })
    } catch (err) {
      console.error('Logout error:', err)
    }
    setAuthToken(null)
    setCurrentUser(null)
    setIsAuthenticated(false)
    setActiveTab('queue')
    setSelectedDept(null)
    setPatients([])
  }

  // ═══════════════════════════════
  //  Fetch departments
  // ═══════════════════════════════
  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/queue/departments/list`)
      if (!res.ok) throw new Error('Erreur serveur')
      const data = await res.json()
      setDepartments(data)
      
      // Sélectionner le premier département par défaut
      if (!selectedDept && data.length > 0) {
        setSelectedDept(data[0].name)
      }
      setError(null)
    } catch (err) {
      setError('Impossible de se connecter au serveur. Vérifiez que le backend est lancé sur le port 8000.')
      console.error('Fetch departments error:', err)
    }
  }, [selectedDept])

  // ═══════════════════════════════
  //  Fetch queue for selected dept
  // ═══════════════════════════════
  const fetchQueue = useCallback(async (dept) => {
    if (!dept) return
    try {
      setIsLoadingQueue(true)
      const res = await fetch(`${API_URL}/queue/${encodeURIComponent(dept)}`)
      if (!res.ok) throw new Error('Erreur serveur')
      const data = await res.json()
      setPatients(data.patients || [])
    } catch (err) {
      console.error('Fetch queue error:', err)
    } finally {
      setIsLoadingQueue(false)
    }
  }, [])

  // ═══════════════════════════════
  //  Fetch pharmacies
  // ═══════════════════════════════
  const fetchPharmacies = useCallback(async () => {
    try {
      setIsLoadingPharmacies(true)
      const res = await fetch(`${API_URL}/pharmacies/`)
      if (!res.ok) throw new Error('Erreur serveur')
      const data = await res.json()
      setPharmacies(data)
    } catch (err) {
      console.error('Fetch pharmacies error:', err)
    } finally {
      setIsLoadingPharmacies(false)
    }
  }, [])

  // ═══════════════════════════════
  //  Call next patient
  // ═══════════════════════════════
  const handleCallNext = async () => {
    if (!selectedDept || isCalling) return
    setIsCalling(true)
    try {
      const doctorName = currentUser?.fullName || 'Médecin'
      const res = await fetch(
        `${API_URL}/queue/${encodeURIComponent(selectedDept)}/next?doctorName=${encodeURIComponent(doctorName)}`,
        { method: 'POST' }
      )
      if (!res.ok) throw new Error('Erreur serveur')
      const data = await res.json()
      
      if (data.status === 'called') {
        showToast(`Patient appelé avec succès ! (${data.remainingPatients} restant${data.remainingPatients > 1 ? 's' : ''})`)
      } else {
        showToast('Aucun patient en attente.')
      }

      // Rafraîchir immédiatement
      await fetchQueue(selectedDept)
      await fetchDepartments()
    } catch (err) {
      setError('Erreur lors de l\'appel du patient suivant.')
      console.error('Call next error:', err)
    } finally {
      setIsCalling(false)
    }
  }

  // ═══════════════════════════════
  //  Toast notification
  // ═══════════════════════════════
  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 4000)
  }

  // ═══════════════════════════════
  //  Effects: Initial load + WebSockets
  // ═══════════════════════════════
  useEffect(() => {
    if (!isAuthenticated) return
    fetchDepartments()
    fetchPharmacies()
  }, [isAuthenticated, fetchDepartments, fetchPharmacies])

  // WebSocket pour les mises à jour en temps réel
  useEffect(() => {
    if (!isAuthenticated) return

    // Connexion au WebSocket global (dériver ws:// ou wss:// depuis API_URL)
    const wsProtocol = API_URL.startsWith('https') ? 'wss' : 'ws';
    const wsHost = API_URL.replace(/^https?:\/\//, '');
    const ws = new WebSocket(`${wsProtocol}://${wsHost}/queue/ws/dashboard`)
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'queue_update') {
          // Si une mise à jour arrive, on rafraîchit les listes
          fetchDepartments()
          if (activeTab === 'queue' && selectedDept) {
            fetchQueue(selectedDept)
          }
        }
      } catch (err) {
        console.error('WebSocket parse error:', err)
      }
    }

    ws.onclose = () => {
      console.log('WebSocket dashboard déconnecté')
    }

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [isAuthenticated, activeTab, selectedDept, fetchQueue, fetchDepartments])

  // Charger la file quand on change de département ou d'onglet
  useEffect(() => {
    if (isAuthenticated && activeTab === 'queue' && selectedDept) {
      fetchQueue(selectedDept)
    }
  }, [isAuthenticated, activeTab, selectedDept, fetchQueue])

  // Rafraîchir les pharmacies quand on va sur l'onglet
  useEffect(() => {
    if (isAuthenticated && activeTab === 'pharmacies') {
      fetchPharmacies()
    }
  }, [isAuthenticated, activeTab, fetchPharmacies])

  // ═══════════════════════════════
  //  If not authenticated → Login
  // ═══════════════════════════════
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />
  }

  // ═══════════════════════════════
  //  Authenticated → Dashboard
  // ═══════════════════════════════
  return (
    <>
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={currentUser}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {error && (
          <div className="error-banner" id="error-banner">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {activeTab === 'queue' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="page-header">
              <h2>Gestion des Files d'Attente</h2>
              <p>Visualisez et gérez les patients en attente dans chaque service.</p>
            </div>

            <StatCards departments={departments} />

            {/* Department tabs */}
            <div className="department-tabs" id="dept-tabs">
              {departments.map((dept) => (
                <button
                  key={dept.name}
                  className={`dept-tab ${selectedDept === dept.name ? 'active' : ''}`}
                  onClick={() => setSelectedDept(dept.name)}
                  id={`dept-tab-${dept.name.replace(/\s+/g, '-')}`}
                >
                  {dept.name}
                  <span className="badge">{dept.waitingCount}</span>
                </button>
              ))}
            </div>

            {/* Patient queue */}
            {isLoadingQueue && patients.length === 0 ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <span>Chargement de la file...</span>
              </div>
            ) : (
              <PatientQueue
                patients={patients}
                department={selectedDept || '—'}
                onCallNext={handleCallNext}
                isCalling={isCalling}
              />
            )}
          </div>
        )}

        {activeTab === 'pharmacies' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="page-header">
              <h2>Répertoire Pharmaceutique</h2>
              <p>Consultez la disponibilité des médicaments dans toutes les pharmacies partenaires.</p>
            </div>

            <PharmacyDirectory pharmacies={pharmacies} isLoading={isLoadingPharmacies} />
          </div>
        )}

        {activeTab === 'history' && <HistoryPanel />}

        {activeTab === 'stats' && <StatsPanel />}
      </main>

      {/* Success Toast */}
      {toast && (
        <div className="success-toast" id="toast-notification">
          <CheckCircle size={18} />
          {toast}
        </div>
      )}
    </>
  )
}
