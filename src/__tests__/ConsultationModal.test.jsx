/**
 * Tests — ConsultationModal (Portail Médical)
 * ═══════════════════════════════════════════
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ConsultationModal from '../components/ConsultationModal'

// Mock fetch for medicine availability
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('ConsultationModal', () => {
  const defaultProps = {
    patient: { id: 'ticket-001', ticketNumber: 'A-100', department: 'Consultation Générale' },
    onClose: vi.fn(),
    onComplete: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock availability fetch
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { name: 'Paracétamol 500mg', available: true, category: 'Analgésiques' },
        { name: 'Amoxicilline 1g', available: false, category: 'Antibiotiques' }
      ])
    })
  })

  it('affiche le numéro de ticket du patient', () => {
    render(<ConsultationModal {...defaultProps} />)
    expect(screen.getByText('A-100')).toBeInTheDocument()
  })

  it('affiche le titre "Consultation en cours"', () => {
    render(<ConsultationModal {...defaultProps} />)
    expect(screen.getByText('Consultation en cours')).toBeInTheDocument()
  })

  it('a un champ de notes cliniques', () => {
    render(<ConsultationModal {...defaultProps} />)
    expect(screen.getByPlaceholderText(/observations cliniques/i)).toBeInTheDocument()
  })

  it('permet d\'ajouter un médicament', async () => {
    render(<ConsultationModal {...defaultProps} />)
    
    const medInput = screen.getByPlaceholderText(/paracétamol/i)
    const dosageInput = screen.getByPlaceholderText(/matin et soir/i)
    
    fireEvent.change(medInput, { target: { value: 'Ibuprofène 400mg' } })
    fireEvent.change(dosageInput, { target: { value: '1 comprimé 2x/jour' } })
    
    fireEvent.click(screen.getByText('Ajouter'))
    
    expect(screen.getByText(/Ibuprofène 400mg/)).toBeInTheDocument()
  })

  it('désactive le bouton Ajouter sans nom de médicament', () => {
    render(<ConsultationModal {...defaultProps} />)
    const addBtn = screen.getByText('Ajouter').closest('button')
    expect(addBtn).toBeDisabled()
  })

  it('permet de supprimer un médicament ajouté', async () => {
    render(<ConsultationModal {...defaultProps} />)
    
    const medInput = screen.getByPlaceholderText(/paracétamol/i)
    fireEvent.change(medInput, { target: { value: 'Test Med' } })
    fireEvent.click(screen.getByText('Ajouter'))
    
    expect(screen.getByText(/Test Med/)).toBeInTheDocument()
    
    // Find and click delete button (Trash2 icon)
    const deleteBtn = screen.getByText(/Test Med/).closest('li').querySelector('button')
    fireEvent.click(deleteBtn)
    
    expect(screen.queryByText(/Test Med \(x1\)/)).not.toBeInTheDocument()
  })

  it('appelle onClose au clic sur Annuler', () => {
    render(<ConsultationModal {...defaultProps} />)
    fireEvent.click(screen.getByText('Annuler'))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('désactive le bouton Terminer sans notes', () => {
    render(<ConsultationModal {...defaultProps} />)
    const submitBtn = screen.getByText('Terminer la consultation').closest('button')
    expect(submitBtn).toBeDisabled()
  })

  it('appelle onComplete à la soumission', async () => {
    defaultProps.onComplete.mockResolvedValue(undefined)
    render(<ConsultationModal {...defaultProps} />)
    
    const notesField = screen.getByPlaceholderText(/observations cliniques/i)
    fireEvent.change(notesField, { target: { value: 'Patient avec fièvre.' } })
    
    const submitBtn = screen.getByText('Terminer la consultation').closest('button')
    fireEvent.click(submitBtn)
    
    await waitFor(() => {
      expect(defaultProps.onComplete).toHaveBeenCalledWith('Patient avec fièvre.', [])
    })
  })
})
