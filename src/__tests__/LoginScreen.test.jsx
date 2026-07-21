/**
 * Tests — LoginScreen (Portail Médical)
 * ═══════════════════════════════════════
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginScreen from '../components/LoginScreen'

// Mock fetch global
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('LoginScreen', () => {
  const mockOnLogin = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le formulaire de connexion', () => {
    render(<LoginScreen onLogin={mockOnLogin} />)
    
    expect(screen.getByPlaceholderText("Nom d'utilisateur")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Mot de passe")).toBeInTheDocument()
    expect(screen.getByText('Se connecter')).toBeInTheDocument()
  })

  it('affiche le titre QueueCare et Portail Médical', () => {
    render(<LoginScreen onLogin={mockOnLogin} />)
    
    expect(screen.getByText('QueueCare')).toBeInTheDocument()
    expect(screen.getByText('Portail Médical')).toBeInTheDocument()
  })

  it('affiche une erreur si les champs sont vides', async () => {
    render(<LoginScreen onLogin={mockOnLogin} />)
    
    fireEvent.click(screen.getByText('Se connecter'))
    
    expect(screen.getByText('Veuillez remplir tous les champs.')).toBeInTheDocument()
    expect(mockOnLogin).not.toHaveBeenCalled()
  })

  it('appelle l\'API et onLogin en cas de succès', async () => {
    const mockResponse = {
      token: 'test-token-123',
      user: { id: 'doc-001', fullName: 'Dr. Test', role: 'Médecin' }
    }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    render(<LoginScreen onLogin={mockOnLogin} />)
    
    fireEvent.change(screen.getByPlaceholderText("Nom d'utilisateur"), {
      target: { value: 'dr.diallo' }
    })
    fireEvent.change(screen.getByPlaceholderText("Mot de passe"), {
      target: { value: 'queuecare2026' }
    })
    fireEvent.click(screen.getByText('Se connecter'))

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith('test-token-123', mockResponse.user)
    })
  })

  it('affiche une erreur en cas d\'identifiants incorrects', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: 'Identifiants incorrects.' })
    })

    render(<LoginScreen onLogin={mockOnLogin} />)
    
    fireEvent.change(screen.getByPlaceholderText("Nom d'utilisateur"), {
      target: { value: 'wrong' }
    })
    fireEvent.change(screen.getByPlaceholderText("Mot de passe"), {
      target: { value: 'wrong' }
    })
    fireEvent.click(screen.getByText('Se connecter'))

    await waitFor(() => {
      expect(screen.getByText('Identifiants incorrects.')).toBeInTheDocument()
    })
    expect(mockOnLogin).not.toHaveBeenCalled()
  })

  it('désactive le bouton pendant le chargement', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<LoginScreen onLogin={mockOnLogin} />)
    
    fireEvent.change(screen.getByPlaceholderText("Nom d'utilisateur"), {
      target: { value: 'dr.diallo' }
    })
    fireEvent.change(screen.getByPlaceholderText("Mot de passe"), {
      target: { value: 'password' }
    })
    fireEvent.click(screen.getByText('Se connecter'))

    await waitFor(() => {
      expect(screen.getByText('Connexion en cours...')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /connexion/i })).toBeDisabled()
  })

  it('affiche les identifiants de démonstration', () => {
    render(<LoginScreen onLogin={mockOnLogin} />)
    
    expect(screen.getByText('Dr. Diallo')).toBeInTheDocument()
    expect(screen.getByText('Dr. Ndiaye')).toBeInTheDocument()
    expect(screen.getByText('Agent')).toBeInTheDocument()
  })

  it('remplit les champs avec les identifiants de démonstration', () => {
    render(<LoginScreen onLogin={mockOnLogin} />)
    
    fireEvent.click(screen.getByText('Dr. Diallo'))
    
    expect(screen.getByPlaceholderText("Nom d'utilisateur").value).toBe('dr.diallo')
    expect(screen.getByPlaceholderText("Mot de passe").value).toBe('queuecare2026')
  })
})
