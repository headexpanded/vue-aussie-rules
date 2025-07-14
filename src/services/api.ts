import type {
  Game,
  LadderPrediction,
  LoginForm,
  Player,
  PlayerStats,
  Prediction,
  Team,
} from '@/types'

const isDevelopment = import.meta.env.MODE === 'development'
const API_BASE = isDevelopment
  ? 'http://localhost:3003/rules/api' // Development
  : '/rules/api';		      // Production

export const api = {
  async login(form: LoginForm): Promise<Player> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!response.ok) {
      throw new Error('Login failed')
    }
    return response.json()
  },

  async checkSession(): Promise<{ isLoggedIn: boolean; userId?: number; username?: string }> {
    const response = await fetch(`${API_BASE}/check-session`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) throw new Error('Failed to check session')
    return response.json()
  },

  async getCurrentRound(): Promise<number> {
    const response = await fetch(`${API_BASE}/games/current-round`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) {
      throw new Error('Failed to get current round')
    }
    return response.json()
  },

  async getGames(roundNumber: number): Promise<Game[]> {
    const response = await fetch(`${API_BASE}/games/round/${roundNumber}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) {
      throw new Error('Failed to get games')
    }
    return response.json()
  },

  async hasSubmitted(playerId: number, roundId: number): Promise<boolean> {
    const response = await fetch(`${API_BASE}/has-submitted?player_id=${playerId}&round_id=${roundId}`,
      {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      },
    )
    if (!response.ok) throw new Error('Failed to get submitted status')
    const data = await response.json()
    return data.hasSubmitted
  },

  async submitPrediction(prediction: Omit<Prediction, 'id'>): Promise<Prediction> {
    const response = await fetch(`${API_BASE}/predictions`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prediction),
    })
    if (!response.ok) {
      throw new Error('Failed to submit prediction')
    }
    return response.json()
  },

  async getPlayerStats(): Promise<PlayerStats[]> {
    const response = await fetch(`${API_BASE}/predictions/stats`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) {
      throw new Error('Failed to get player stats')
    }
    return response.json()
  },

  async submitLadderPrediction(
    prediction: Omit<LadderPrediction, 'id'>,
  ): Promise<LadderPrediction> {
    const response = await fetch(`${API_BASE}/ladder-predictions`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prediction),
    })
    if (!response.ok) {
      throw new Error('Failed to submit ladder prediction')
    }
    return response.json()
  },

  async getLadderPredictions(roundNumber: number): Promise<LadderPrediction[]> {
    const response = await fetch(`${API_BASE}/ladder-predictions/round/${roundNumber}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) {
      throw new Error('Failed to get ladder predictions')
    }
    return response.json()
  },

  async getTeams(): Promise<Team[]> {
    const response = await fetch(`${API_BASE}/teams`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) {
      throw new Error('Failed to get teams')
    }
    return response.json()
  },
}
