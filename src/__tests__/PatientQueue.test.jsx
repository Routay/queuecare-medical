/**
 * Tests — PatientQueue (Portail Médical)
 * ═══════════════════════════════════════
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PatientQueue from '../components/PatientQueue'

describe('PatientQueue', () => {
  const mockPatients = [
    { id: 'p1', ticketNumber: 'A-100', position: 1, timestamp: '2026-07-20T10:00:00', status: 'waiting' },
    { id: 'p2', ticketNumber: 'A-101', position: 2, timestamp: '2026-07-20T10:05:00', status: 'waiting' },
    { id: 'p3', ticketNumber: 'A-102', position: 3, timestamp: '2026-07-20T10:10:00', status: 'waiting' }
  ]

  const defaultProps = {
    patients: mockPatients,
    department: 'Consultation Générale',
    onCallNext: vi.fn(),
    isCalling: false
  }

  it('affiche le message file vide quand il n\'y a pas de patients', () => {
    render(<PatientQueue {...defaultProps} patients={[]} />)
    expect(screen.getByText('Aucun patient en attente')).toBeInTheDocument()
  })

  it('affiche le nom du département', () => {
    render(<PatientQueue {...defaultProps} patients={[]} />)
    expect(screen.getByText(/Consultation Générale/)).toBeInTheDocument()
  })

  it('affiche la liste des patients', () => {
    render(<PatientQueue {...defaultProps} />)
    expect(screen.getByText('A-100')).toBeInTheDocument()
    expect(screen.getByText('A-101')).toBeInTheDocument()
    expect(screen.getByText('A-102')).toBeInTheDocument()
  })

  it('affiche le nombre de patients dans le titre', () => {
    render(<PatientQueue {...defaultProps} />)
    expect(screen.getByText(/\(3\)/)).toBeInTheDocument()
  })

  it('marque le premier patient comme "Suivant"', () => {
    render(<PatientQueue {...defaultProps} />)
    expect(screen.getByText('→ Suivant')).toBeInTheDocument()
  })

  it('affiche le bouton "Appeler le suivant"', () => {
    render(<PatientQueue {...defaultProps} />)
    expect(screen.getByText('Appeler le suivant')).toBeInTheDocument()
  })

  it('affiche le dialogue de confirmation au clic sur "Appeler"', () => {
    render(<PatientQueue {...defaultProps} />)
    fireEvent.click(screen.getByText('Appeler le suivant'))
    expect(screen.getByText("Confirmer l'appel")).toBeInTheDocument()
    expect(screen.getByText('A-100')).toBeInTheDocument() // Le ticket du prochain
  })

  it('appelle onCallNext après confirmation', () => {
    render(<PatientQueue {...defaultProps} />)
    fireEvent.click(screen.getByText('Appeler le suivant'))
    const confirmButtons = screen.getAllByText("Confirmer l'appel")
    // Le premier est le h3, le deuxième est le bouton
    fireEvent.click(confirmButtons[1])
    expect(defaultProps.onCallNext).toHaveBeenCalled()
  })

  it('désactive le bouton pendant l\'appel', () => {
    render(<PatientQueue {...defaultProps} isCalling={true} />)
    expect(screen.getByText('Appel en cours...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /appel/i })).toBeDisabled()
  })
})
