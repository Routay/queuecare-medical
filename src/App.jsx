import { useState, useEffect, useCallback } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'
import LoginScreen from './components/LoginScreen'
import Sidebar from './components/Sidebar'
import StatCards from './components/StatCards'
import PatientQueue from './components/PatientQueue'
import PharmacyDirectory from './components/PharmacyDirectory'
import HistoryPanel from './components/HistoryPanel'
import StatsPanel from './components/StatsPanel'
import ConsultationModal from './components/ConsultationModal'
import AppointmentsPanel from './components/AppointmentsPanel'
import SettingsPanel from './components/SettingsPanel'
import DoctorsPanel from './components/DoctorsPanel'
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
  const [hospitalName, setHospitalName] = useState('Hôpital')

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
  const [activeConsultation, setActiveConsultation] = useState(null)
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // ═══════════════════════════════
  //  Auth handlers
  // ═══════════════════════════════
  const handleLogin = async (token, user) => {
    setAuthToken(token)
    setCurrentUser(user)
    setIsAuthenticated(true)
    
    try {
      const res = await fetch(`${API_URL}/hospitals/`)
      if (res.ok) {
        const data = await res.json()
        const h = data.data.find(h => h.id === user.hospital_id)
        if (h) setHospitalName(h.name)
      }
    } catch (e) {
      console.error('Failed to fetch hospitals', e)
    }

    setShowWelcomeScreen(true)
    setTimeout(() => {
      setShowWelcomeScreen(false)
    }, 4000)
  }

  const requestLogout = () => setShowLogoutConfirm(true)
  
  const confirmLogout = () => {
    setShowLogoutConfirm(false)
    try {
      fetch(`${API_URL}/auth/logout?token=${authToken}`, { method: 'POST' })
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
    if (!currentUser?.hospital_id) return
    try {
      const res = await fetch(`${API_URL}/queue/${currentUser.hospital_id}/departments/list`)
      if (!res.ok) throw new Error('Erreur serveur')
      const data = await res.json()
      
      // Filtrer pour les médecins : ils ne voient que leur département
      const filtered = currentUser.role === 'Agent Médical' 
        ? data 
        : data.filter(d => d.name === currentUser.department);

      setDepartments(filtered)
      
      // Sélectionner le premier département par défaut
      if (!selectedDept && filtered.length > 0) {
        setSelectedDept(filtered[0].name)
      } else if (filtered.length === 0) {
        setIsLoadingQueue(false)
      }
      setError(null)
    } catch (err) {
      setError('Impossible de se connecter au serveur.')
      console.error('Fetch departments error:', err)
    }
  }, [selectedDept, currentUser])

  // ═══════════════════════════════
  //  Fetch queue for selected dept
  // ═══════════════════════════════
  const fetchQueue = useCallback(async (dept) => {
    if (!dept || !currentUser?.hospital_id) return
    try {
      setIsLoadingQueue(true)
      const res = await fetch(`${API_URL}/queue/${currentUser.hospital_id}/${encodeURIComponent(dept)}`)
      if (!res.ok) throw new Error('Erreur serveur')
      const data = await res.json()
      setPatients(data.patients || [])
    } catch (err) {
      console.error('Fetch queue error:', err)
    } finally {
      setIsLoadingQueue(false)
    }
  }, [currentUser])

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
    if (!selectedDept || isCalling || !currentUser?.hospital_id) return
    setIsCalling(true)
    try {
      const doctorName = currentUser?.fullName || 'Médecin'
      const res = await fetch(
        `${API_URL}/queue/${currentUser.hospital_id}/${encodeURIComponent(selectedDept)}/next`,
        { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doctorName, hospital_id: currentUser.hospital_id })
        }
      )
      if (!res.ok) throw new Error('Erreur serveur')
      const data = await res.json()
      
      if (data.status === 'called') {
        showToast(`Patient appelé avec succès ! (${data.remainingPatients} restant${data.remainingPatients > 1 ? 's' : ''})`)
        setActiveConsultation(data.historyEntry)
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
  //  Complete Consultation
  // ═══════════════════════════════
  const handleCompleteConsultation = async (notes, medicines) => {
    if (!activeConsultation) return;
    try {
      const res = await fetch(`${API_URL}/consultations/prescribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: activeConsultation.id,
          doctorName: currentUser?.fullName || 'Médecin',
          notes,
          medicines
        })
      });
      if (!res.ok) throw new Error('Erreur lors de la création de l\'ordonnance');
      
      showToast('Consultation terminée et ordonnance envoyée !');
      setActiveConsultation(null);
    } catch (err) {
      setError(err.message);
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
          hospitalName={hospitalName}
          onLogout={requestLogout}
        />

      <main className="main-content">
        {/* Hospital & Department Header Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 24px', marginBottom: '8px',
          background: 'hsla(var(--color-primary)/0.06)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid hsla(var(--color-primary)/0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>
            <span style={{ fontWeight: '600', color: 'hsl(var(--text-primary))' }}>
              {hospitalName || currentUser?.hospital_id}
            </span>
            {currentUser?.department && (
              <>
                <span style={{ color: 'hsl(var(--text-muted))' }}>•</span>
                <span style={{ color: 'hsl(var(--color-primary))' }}>{currentUser.department}</span>
              </>
            )}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
            {currentUser?.fullName} — {currentUser?.role}
          </span>
        </div>

        {error && (
          <div className="error-banner" id="error-banner">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="dashboard-layout" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="main-column">
              <div className="page-header">
                <h2>Gestion des Files d'Attente</h2>
                <p>Visualisez et gérez les patients en attente dans chaque service.</p>
              </div>

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
              {isLoadingQueue && patients.length === 0 && departments.length > 0 ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <span>Chargement de la file...</span>
                </div>
              ) : (
                <PatientQueue
                  patients={patients}
                  department={selectedDept || "Aucun"}
                  onCallNext={handleCallNext}
                  isCalling={isCalling}
                />
              )}
            </div>

            <div className="side-column">
              <StatCards departments={departments} />
            </div>
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

        {activeTab === 'appointments' && currentUser?.role !== 'Agent Médical' && (
          <AppointmentsPanel user={currentUser} showToast={showToast} setError={setError} />
        )}

        {activeTab === 'history' && <HistoryPanel user={currentUser} />}

        {activeTab === 'stats' && <StatsPanel user={currentUser} hospitalName={hospitalName} />}

        {activeTab === 'settings' && <SettingsPanel user={currentUser} />}

        {activeTab === 'doctors' && currentUser?.role === 'Agent Médical' && (
          <DoctorsPanel user={currentUser} />
        )}
      </main>

      {/* Modals Globaux */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LogOut size={28} color="#ef4444" />
              </div>
            </div>
            <h3 style={{ marginBottom: '12px', fontSize: '1.25rem' }}>Déconnexion</h3>
            <p style={{ color: 'hsl(var(--text-muted))', marginBottom: '24px', lineHeight: 1.5 }}>
              Êtes-vous sûr de vouloir vous déconnecter de votre session ?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setShowLogoutConfirm(false)} style={{ flex: 1 }}>
                Annuler
              </button>
              <button className="btn btn-danger" onClick={confirmLogout} style={{ flex: 1 }}>
                Oui, me déconnecter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {toast && (
        <div className="toast" id="global-toast">
          <CheckCircle size={18} />
          {toast}
        </div>
      )}

      {/* Consultation Modal */}
      {activeConsultation && (
        <ConsultationModal 
          patient={activeConsultation}
          onClose={() => setActiveConsultation(null)}
          onComplete={handleCompleteConsultation}
        />
      )}

      {/* Welcome Screen Overlay */}
      {showWelcomeScreen && (
        <div className="welcome-overlay">
          <div className="welcome-content">
            <h1 className="welcome-title">Bienvenue, {currentUser?.fullName}</h1>
            <p className="welcome-subtitle">{hospitalName || currentUser?.hospital_id}</p>
            <div className="welcome-spinner"></div>
          </div>
        </div>
      )}
    </>
  )
}
