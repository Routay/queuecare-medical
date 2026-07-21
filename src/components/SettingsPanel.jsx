import { useState } from 'react'
import { Save, Shield, Bell, Key, User, Building2, Mail, Phone } from 'lucide-react'

export default function SettingsPanel({ user }) {
  const [activeSection, setActiveSection] = useState('profile')
  const [saved, setSaved] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || 'medecin@queuecare.sn',
    phone: user?.phone || '+221 77 000 00 00',
    specialty: user?.department || 'Non défini',
    notifications: true,
    emailAlerts: false
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handlePasswordChange = (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Veuillez remplir tous les champs.')
      return
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.')
      return
    }

    setPasswordSuccess(true)
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setTimeout(() => setPasswordSuccess(false), 4000)
  }

  const handleResetPassword = () => {
    setResetSent(true)
    setShowResetConfirm(false)
    setTimeout(() => setResetSent(false), 5000)
  }

  const sections = [
    { id: 'profile', label: 'Mon Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ]

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h2>Paramètres</h2>
        <p style={{ color: 'hsl(var(--text-muted))' }}>Gérez votre profil, vos accès et vos préférences.</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Sidebar navigation */}
        <div className="glass-panel" style={{ width: '240px', padding: '12px', flexShrink: 0 }}>
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px',
                background: activeSection === s.id ? 'hsla(var(--color-primary)/0.15)' : 'transparent',
                color: activeSection === s.id ? 'hsl(var(--color-primary))' : 'hsl(var(--text-secondary))',
                border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                fontWeight: activeSection === s.id ? '600' : '500',
                transition: 'all 0.2s', fontSize: '0.95rem'
              }}
            >
              <s.icon size={18} /> {s.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="glass-panel" style={{ flex: 1, padding: '32px' }}>

          {/* ══════ PROFIL ══════ */}
          {activeSection === 'profile' && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <h3 style={{ marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid hsl(var(--border-color)/0.5)' }}>
                Informations Personnelles
              </h3>

              {/* Info card */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '20px', padding: '20px',
                background: 'linear-gradient(135deg, hsla(var(--color-primary)/0.1), hsla(var(--color-accent)/0.05))',
                borderRadius: '12px', marginBottom: '28px', border: '1px solid hsl(var(--border-color)/0.3)'
              }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, hsl(var(--color-primary)), hsl(var(--color-accent)))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: '700', color: 'white', flexShrink: 0
                }}>
                  {user?.avatar || 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '4px' }}>{user?.fullName || 'Utilisateur'}</div>
                  <div style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building2 size={14} /> {user?.hospital_id || 'Hôpital'}</span>
                    <span>{user?.role || 'Rôle'}</span>
                    {user?.department && <span>• {user.department}</span>}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSave}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> Nom complet</label>
                    <input type="text" className="form-input" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> Email</label>
                    <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> Téléphone</label>
                    <input type="tel" className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Spécialité / Département</label>
                    <input type="text" className="form-input" value={formData.specialty} readOnly style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid hsl(var(--border-color)/0.3)' }}>
                  <button type="submit" className="call-next-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Save size={16} /> {saved ? 'Enregistré !' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ══════ SÉCURITÉ ══════ */}
          {activeSection === 'security' && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <h3 style={{ marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid hsl(var(--border-color)/0.5)' }}>
                Sécurité du Compte
              </h3>

              {/* Changer le mot de passe */}
              <div style={{ padding: '24px', background: 'hsl(var(--bg-elevated))', borderRadius: '12px', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Key size={18} color="hsl(var(--color-primary))" /> Changer le mot de passe
                </h4>
                <form onSubmit={handlePasswordChange}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Mot de passe actuel</label>
                      <input type="password" className="form-input" value={passwordData.currentPassword}
                        onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Nouveau mot de passe</label>
                      <input type="password" className="form-input" value={passwordData.newPassword}
                        onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Confirmer le nouveau mot de passe</label>
                      <input type="password" className="form-input" value={passwordData.confirmPassword}
                        onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} />
                    </div>
                    {passwordError && (
                      <div style={{ color: 'hsl(var(--color-danger))', fontSize: '0.9rem', padding: '8px 12px', background: 'hsla(var(--color-danger)/0.1)', borderRadius: '8px' }}>
                        {passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div style={{ color: 'hsl(var(--color-accent))', fontSize: '0.9rem', padding: '8px 12px', background: 'hsla(var(--color-accent)/0.1)', borderRadius: '8px' }}>
                        Mot de passe modifié avec succès !
                      </div>
                    )}
                    <button type="submit" className="call-next-btn" style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>
                      Mettre à jour le mot de passe
                    </button>
                  </div>
                </form>
              </div>

              {/* Réinitialisation par email */}
              <div style={{ padding: '24px', background: 'hsl(var(--bg-elevated))', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={18} color="hsl(var(--color-warning))" /> Réinitialisation par email
                </h4>
                <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', marginBottom: '16px' }}>
                  Un lien de réinitialisation sera envoyé à <strong>{formData.email}</strong>.
                </p>
                {resetSent ? (
                  <div style={{ color: 'hsl(var(--color-accent))', fontSize: '0.9rem', padding: '12px', background: 'hsla(var(--color-accent)/0.1)', borderRadius: '8px' }}>
                    Un email de réinitialisation a été envoyé avec succès.
                  </div>
                ) : showResetConfirm ? (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ color: 'hsl(var(--color-warning))', fontSize: '0.9rem' }}>Confirmer l'envoi ?</span>
                    <button onClick={handleResetPassword} className="call-next-btn" style={{ padding: '8px 20px' }}>Oui, envoyer</button>
                    <button onClick={() => setShowResetConfirm(false)} className="refresh-btn" style={{ padding: '8px 20px' }}>Annuler</button>
                  </div>
                ) : (
                  <button onClick={() => setShowResetConfirm(true)} className="refresh-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
                    <Key size={16} /> Envoyer le lien de réinitialisation
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ══════ NOTIFICATIONS ══════ */}
          {activeSection === 'notifications' && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <h3 style={{ marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid hsl(var(--border-color)/0.5)' }}>
                Préférences de Notification
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px',
                  background: 'hsl(var(--bg-elevated))', borderRadius: '12px'
                }}>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>Notifications de nouveaux patients</strong>
                    <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>Recevoir une alerte quand un patient rejoint votre file.</span>
                  </div>
                  <input type="checkbox" checked={formData.notifications}
                    onChange={e => setFormData({...formData, notifications: e.target.checked})}
                    style={{ width: '20px', height: '20px', accentColor: 'hsl(var(--color-primary))' }} />
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px',
                  background: 'hsl(var(--bg-elevated))', borderRadius: '12px'
                }}>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>Alertes par email</strong>
                    <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>Recevoir un résumé quotidien par email.</span>
                  </div>
                  <input type="checkbox" checked={formData.emailAlerts}
                    onChange={e => setFormData({...formData, emailAlerts: e.target.checked})}
                    style={{ width: '20px', height: '20px', accentColor: 'hsl(var(--color-primary))' }} />
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px',
                  background: 'hsl(var(--bg-elevated))', borderRadius: '12px'
                }}>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>Rappels de rendez-vous</strong>
                    <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>Être notifié 30 minutes avant chaque rendez-vous.</span>
                  </div>
                  <input type="checkbox" checked={true} readOnly
                    style={{ width: '20px', height: '20px', accentColor: 'hsl(var(--color-primary))' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid hsl(var(--border-color)/0.3)' }}>
                <button onClick={handleSave} className="call-next-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={16} /> {saved ? 'Enregistré !' : 'Enregistrer'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
