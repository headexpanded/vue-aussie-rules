import type { LoginForm, Player, Game, Prediction, PlayerStats, LadderPrediction, Team } from '../types';

const API_BASE = 'http://192.168.88.182:3003/rules/api';

export const api = {
  async login(form: LoginForm): Promise<Player> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  async getCurrentRound(): Promise<number> {
    const response = await fetch(`${API_BASE}/games/current-round`, {
	credentials: 'include',
	headers: {
		'Content-Type': 'application/json'
		},
	});
    if (!response.ok) throw new Error('Failed to get current round');
    return response.json();
  },

  async getGames(roundNumber: number): Promise<Game[]> {
    const response = await fetch(`${API_BASE}/games/round/${roundNumber}` , {
	credentials: 'include',
	headers: {
		'Content-Type': 'application/json'
		},
	});
    if (!response.ok) throw new Error('Failed to get games');
    return response.json();
  },

  async submitPrediction(prediction: Omit<Prediction, 'id'>): Promise<Prediction> {
    const response = await fetch(`${API_BASE}/predictions`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prediction),
    });
    if (!response.ok) throw new Error('Failed to submit prediction');
    return response.json();
  },

  async getPlayerStats(): Promise<PlayerStats[]> {
    const response = await fetch(`${API_BASE}/predictions/stats`, {
	credentials: 'include',
	headers: {
		'Content-Type': 'application/json'
		},
	});
    if (!response.ok) throw new Error('Failed to get player stats');
    return response.json();
  },

  async submitLadderPrediction(prediction: Omit<LadderPrediction, 'id'>): Promise<LadderPrediction> {
    const response = await fetch(`${API_BASE}/ladder-predictions`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prediction),
    });
    if (!response.ok) throw new Error('Failed to submit ladder prediction');
    return response.json();
  },

  async getLadderPredictions(roundNumber: number): Promise<LadderPrediction[]> {
    const response = await fetch(`${API_BASE}/ladder-predictions/round/${roundNumber}`, {
	credentials: 'include',
	headers: {
		'Content-Type': 'application/json'
		},
	});
    if (!response.ok) throw new Error('Failed to get ladder predictions');
    return response.json();
  }, 

  async getTeams(): Promise<Team[]> {
    const response = await fetch(`${API_BASE}/teams`, {
	credentials: 'include',
        headers: {
		'Content-Type': 'application/json'
		},
	});
    if (!repsonse.ok) throw new Error('Failed to get teams');
	return response.json();
   },
};
