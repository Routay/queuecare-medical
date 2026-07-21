/**
 * Tests — StatCards (Portail Médical)
 * ═══════════════════════════════════════
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatCards from '../components/StatCards'

describe('StatCards', () => {
  it('affiche les statistiques avec des départements', () => {
    const departments = [
      { name: 'Consultation Générale', waitingCount: 5 },
      { name: 'Pédiatrie', waitingCount: 3 },
      { name: 'Cardiologie', waitingCount: 0 }
    ]
    render(<StatCards departments={departments} />)
    
    // Total en attente = 5 + 3 + 0 = 8
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('Patients en attente')).toBeInTheDocument()
  })

  it('affiche le nombre de services actifs', () => {
    const departments = [
      { name: 'Consultation', waitingCount: 5 },
      { name: 'Pédiatrie', waitingCount: 3 },
      { name: 'Cardiologie', waitingCount: 0 }
    ]
    render(<StatCards departments={departments} />)
    
    // 2 services actifs (>0 patients)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Services actifs')).toBeInTheDocument()
  })

  it('affiche 0 quand aucun patient en attente', () => {
    render(<StatCards departments={[]} />)
    
    const zeroValues = screen.getAllByText('0')
    expect(zeroValues.length).toBeGreaterThanOrEqual(2) // total + actifs
    expect(screen.getByText('0m')).toBeInTheDocument()
  })

  it('calcule l\'attente moyenne correctement', () => {
    const departments = [
      { name: 'Urgences', waitingCount: 4 }
    ]
    render(<StatCards departments={departments} />)
    
    // avgWait = round(4 * 15 / 1) = 60
    expect(screen.getByText('60m')).toBeInTheDocument()
    expect(screen.getByText('Attente moy.')).toBeInTheDocument()
  })

  it('affiche le compteur de connexions', () => {
    render(<StatCards departments={[]} connectedCount={7} />)
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('Connectés')).toBeInTheDocument()
  })

  it('affiche 0 connectés par défaut', () => {
    render(<StatCards departments={[]} />)
    expect(screen.getByText('Connectés')).toBeInTheDocument()
  })
})
