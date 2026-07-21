/**
 * Vitest Setup — QueueCare Medical
 * Configuration globale pour les tests React (jsdom).
 */
import '@testing-library/jest-dom'

// Mock de import.meta.env
if (!import.meta.env.VITE_API_URL) {
  import.meta.env.VITE_API_URL = 'http://127.0.0.1:8000'
}
