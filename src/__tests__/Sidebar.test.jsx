/**
 * Tests — Sidebar (Portail Médical)
 * ═══════════════════════════════════════
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Sidebar from '../components/Sidebar'

describe('Sidebar', () => {
  const defaultProps = {
    activeTab: 'queue',
    onTabChange: vi.fn(),
    user: {
      fullName: 'Dr. Mamadou Diallo',
      role: 'Médecin Chef',
      avatar: 'MD',
      department: 'Consultation Générale'
    },
    onLogout: vi.fn()
  }

  it('affiche le logo QueueCare', () => {
    render(<Sidebar {...defaultProps} />)
    expect(screen.getByText('QueueCare')).toBeInTheDocument()
    expect(screen.getByText('Portail Médical')).toBeInTheDocument()
  })

  it('affiche les onglets de navigation', () => {
    render(<Sidebar {...defaultProps} />)
    expect(screen.getByText("File d'Attente")).toBeInTheDocument()
    expect(screen.getByText("Pharmacies")).toBeInTheDocument()
    expect(screen.getByText("Statistiques")).toBeInTheDocument()
    expect(screen.getByText("Hôpitaux")).toBeInTheDocument()
  })

  it('affiche les onglets médecin (RDV + Historique) pour un médecin', () => {
    render(<Sidebar {...defaultProps} />)
    expect(screen.getByText("Rendez-vous")).toBeInTheDocument()
    expect(screen.getByText("Historique")).toBeInTheDocument()
  })

  it('masque les onglets médecin pour un Agent Médical', () => {
    render(<Sidebar {...defaultProps} user={{ ...defaultProps.user, role: 'Agent Médical' }} />)
    expect(screen.queryByText("Rendez-vous")).not.toBeInTheDocument()
    expect(screen.queryByText("Historique")).not.toBeInTheDocument()
  })

  it('met en évidence l\'onglet actif', () => {
    render(<Sidebar {...defaultProps} activeTab="pharmacies" />)
    const pharmaciesBtn = screen.getByText("Pharmacies").closest('button')
    expect(pharmaciesBtn.className).toContain('active')
  })

  it('appelle onTabChange au clic', () => {
    render(<Sidebar {...defaultProps} />)
    fireEvent.click(screen.getByText("Statistiques"))
    expect(defaultProps.onTabChange).toHaveBeenCalledWith('stats')
  })

  it('affiche le profil utilisateur', () => {
    render(<Sidebar {...defaultProps} />)
    expect(screen.getByText('Dr. Mamadou Diallo')).toBeInTheDocument()
    expect(screen.getByText('Médecin Chef')).toBeInTheDocument()
    expect(screen.getByText('MD')).toBeInTheDocument()
  })

  it('appelle onLogout au clic', () => {
    render(<Sidebar {...defaultProps} />)
    fireEvent.click(screen.getByText("Déconnexion"))
    expect(defaultProps.onLogout).toHaveBeenCalled()
  })
})
