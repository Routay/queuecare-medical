import { useState, useEffect } from 'react'
import { X, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react'

export default function ConsultationModal({ patient, onClose, onComplete }) {
  const [notes, setNotes] = useState('')
  const [medicines, setMedicines] = useState([])
  const [availability, setAvailability] = useState([])
  const [newMed, setNewMed] = useState({ name: '', quantity: 1, dosage: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch medicine availability
    fetch(import.meta.env.VITE_API_URL + '/consultations/availability')
      .then(res => res.json())
      .then(data => setAvailability(data))
      .catch(err => console.error("Failed to fetch availability:", err))
  }, [])

  const handleAddMedicine = () => {
    if (newMed.name && newMed.quantity > 0) {
      setMedicines([...medicines, { ...newMed }])
      setNewMed({ name: '', quantity: 1, dosage: '' })
    }
  }

  const handleRemoveMedicine = (index) => {
    const updated = [...medicines]
    updated.splice(index, 1)
    setMedicines(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await onComplete(notes, medicines)
    setLoading(false)
  }

  const checkMedStatus = (name) => {
    const med = availability.find(m => m.name.toLowerCase() === name.toLowerCase())
    if (!med) return null
    return med.available ? 'available' : 'out_of_stock'
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '100%', padding: '2rem' }}>
        <div className="modal-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid hsl(var(--border-color)/0.5)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'hsl(var(--text-primary))' }}>
              Consultation en cours
            </h3>
            <p style={{ margin: '0.5rem 0 0', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>
              Patient : <strong style={{ color: 'hsl(var(--color-primary))' }}>{patient?.ticketNumber}</strong>
            </p>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-secondary))' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Notes cliniques */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>Notes cliniques / Diagnostic</label>
            <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Saisissez vos observations cliniques ici..."
              style={{
                width: '100%', height: '120px', padding: '1rem',
                background: 'hsl(var(--bg-primary)/0.5)',
                border: '1px solid hsl(var(--border-color))',
                borderRadius: 'var(--radius-md)',
                color: 'hsl(var(--text-primary))',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
              required
            />
          </div>

          {/* Ordonnance */}
          <div>
            <h4 style={{ margin: '0 0 1rem', color: 'hsl(var(--text-primary))', fontSize: '1.1rem', borderBottom: '1px solid hsl(var(--border-color)/0.3)', paddingBottom: '0.5rem' }}>
              Ordonnance
            </h4>
            
            {/* Liste des médicaments ajoutés */}
            {medicines.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {medicines.map((med, idx) => (
                  <li key={idx} style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem 1rem', background: 'hsl(var(--bg-primary)/0.3)',
                    border: '1px solid hsl(var(--border-color)/0.5)', borderRadius: 'var(--radius-md)'
                  }}>
                    <div>
                      <strong style={{ display: 'block', color: 'hsl(var(--text-primary))' }}>{med.name} (x{med.quantity})</strong>
                      {med.dosage && <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>{med.dosage}</span>}
                    </div>
                    <button type="button" onClick={() => handleRemoveMedicine(idx)} style={{ background: 'transparent', border: 'none', color: 'hsl(var(--color-danger))', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Ajouter un médicament */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr auto', gap: '1rem', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>Médicament</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    value={newMed.name}
                    onChange={e => setNewMed({...newMed, name: e.target.value})}
                    placeholder="Ex: Paracétamol"
                    list="med-list"
                    style={{
                      width: '100%', padding: '0.75rem',
                      background: 'hsl(var(--bg-primary)/0.5)',
                      border: '1px solid hsl(var(--border-color))',
                      borderRadius: 'var(--radius-md)',
                      color: 'hsl(var(--text-primary))'
                    }}
                  />
                  <datalist id="med-list">
                    {availability.map((m, idx) => (
                      <option key={idx} value={m.name} />
                    ))}
                  </datalist>
                  {/* Status indicator */}
                  {newMed.name && (
                    <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                      {checkMedStatus(newMed.name) === 'available' && <CheckCircle size={16} color="hsl(var(--color-success))" title="En stock" />}
                      {checkMedStatus(newMed.name) === 'out_of_stock' && <AlertCircle size={16} color="hsl(var(--color-danger))" title="En rupture" />}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>Quantité</label>
                <input 
                  type="number" 
                  min="1"
                  value={newMed.quantity}
                  onChange={e => setNewMed({...newMed, quantity: parseInt(e.target.value) || 1})}
                  style={{
                    width: '100%', padding: '0.75rem',
                    background: 'hsl(var(--bg-primary)/0.5)',
                    border: '1px solid hsl(var(--border-color))',
                    borderRadius: 'var(--radius-md)',
                    color: 'hsl(var(--text-primary))'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>Posologie</label>
                <input 
                  type="text" 
                  value={newMed.dosage}
                  onChange={e => setNewMed({...newMed, dosage: e.target.value})}
                  placeholder="Ex: 1 matin et soir"
                  style={{
                    width: '100%', padding: '0.75rem',
                    background: 'hsl(var(--bg-primary)/0.5)',
                    border: '1px solid hsl(var(--border-color))',
                    borderRadius: 'var(--radius-md)',
                    color: 'hsl(var(--text-primary))'
                  }}
                />
              </div>
              <button 
                type="button" 
                onClick={handleAddMedicine}
                disabled={!newMed.name || newMed.quantity < 1}
                className="btn btn-secondary"
                style={{ height: '42px', padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Plus size={18} /> Ajouter
              </button>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid hsl(var(--border-color)/0.5)' }}>
            <button type="button" onClick={onClose} className="btn" style={{ background: 'transparent', border: '1px solid hsl(var(--border-color))', color: 'hsl(var(--text-primary))' }}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !notes.trim()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {loading ? 'Envoi...' : (
                <>
                  <CheckCircle size={18} /> Terminer la consultation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
