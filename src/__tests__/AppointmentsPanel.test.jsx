/**
 * Tests — AppointmentsPanel (Portail Médical)
 * ═══════════════════════════════════════════
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AppointmentsPanel from '../components/AppointmentsPanel'

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('AppointmentsPanel', () => {
  const defaultProps = {
    user: { id: 'doc-001', fullName: 'Dr. Test', role: 'Médecin', department: 'Consultation' },
    showToast: vi.fn(),
    setError: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche un spinner de chargement initialement', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves
    render(<AppointmentsPanel {...defaultProps} />)
    expect(screen.getByText('Chargement des rendez-vous...')).toBeInTheDocument()
  })

  it('affiche le panneau après chargement', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] })
    })

    render(<AppointmentsPanel {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Gestion des Rendez-vous')).toBeInTheDocument()
    })
  })

  it('affiche les demandes en attente', async () => {
    mockFetch.mockImplementation((url) => {
      if (url.includes('availabilities')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [] }) })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: [{
            id: 'appt-1',
            patientName: 'Fatou Sow',
            patientPhone: '771234567',
            date: '2027-01-15',
            startTime: '09:00',
            endTime: '09:30',
            reason: 'Contrôle annuel',
            status: 'pending'
          }]
        })
      })
    })

    render(<AppointmentsPanel {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Fatou Sow')).toBeInTheDocument()
    })
    expect(screen.getByText('Accepter')).toBeInTheDocument()
    expect(screen.getByText('Refuser')).toBeInTheDocument()
  })

  it('affiche les rendez-vous confirmés', async () => {
    mockFetch.mockImplementation((url) => {
      if (url.includes('availabilities')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [] }) })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: [{
            id: 'appt-2',
            patientName: 'Moussa Ba',
            patientPhone: '776543210',
            date: '2027-02-10',
            startTime: '14:00',
            endTime: '14:30',
            status: 'confirmed'
          }]
        })
      })
    })

    render(<AppointmentsPanel {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Moussa Ba')).toBeInTheDocument()
    })
    expect(screen.getByText('Terminer')).toBeInTheDocument()
    expect(screen.getByText('Reporter')).toBeInTheDocument()
  })

  it('affiche "Aucune demande" quand il n\'y a pas de RDV pending', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] })
    })

    render(<AppointmentsPanel {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Aucune demande en attente.')).toBeInTheDocument()
    })
  })
})
