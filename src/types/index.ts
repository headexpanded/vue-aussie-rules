export interface Player {
  id: number
  name: string
  email: string
}

export interface Team {
  id: number
  name: string
}

export interface Game {
  id: number
  round_id: number
  team1_id: number
  team2_id: number
  winner_id: number | null
  team1?: Team
  team2?: Team
  winner?: Team
}

export interface Prediction {
  id: number
  player_id: number
  game_id: number
  predicted_winner_id: number
  game?: Game
  predicted_winner?: Team
}

export interface LadderPrediction {
  id: number
  player_id: number
  round_number: number
  team_id: number
  predicted_position: number
  team?: Team
}

export interface PlayerStats {
  player: Player
  wins: number
  losses: number
  total: number
}

export interface LoginForm {
  name: string
  email: string
}
