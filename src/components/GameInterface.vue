<script setup lang="ts">
import type { Game, PlayerStats } from '@/types'
import { onMounted, ref } from 'vue'
import { api } from '../services/api'

const props = defineProps<{
  playerId: number
}>()

const currentRound = ref<number>(0)
const games = ref<Game[]>([])
const predictions = ref<Record<number, number>>({})
const tempPredictions = ref<Record<number, number>>({})
const playerStats = ref<PlayerStats[]>([])
const error = ref<string>('')
const submitError = ref<string>('')

async function loadData() {
  try {
    currentRound.value = await api.getCurrentRound()
    games.value = await api.getGames(currentRound.value)
    playerStats.value = await api.getPlayerStats()
  } catch {
    error.value = 'Failed to load game data'
  }
}

function selectPrediction(gameId: number, teamId: number) {
  tempPredictions.value[gameId] = teamId
}

async function submitAllPredictions() {
  try {
    submitError.value = ''
    for (const [gameId, teamId] of Object.entries(tempPredictions.value)) {
      await api.submitPrediction({
        player_id: props.playerId,
        game_id: parseInt(gameId),
        predicted_winner_id: teamId,
      })
    }
    predictions.value = { ...tempPredictions.value }
    await loadData() // Reload stats
  } catch {
    submitError.value = 'Failed to submit predictions'
  }
}

onMounted(loadData)
</script>

<template>
  <div class="game-container">
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="submitError" class="error">{{ submitError }}</div>

    <div class="round-header">
      <h2>Round {{ currentRound }} Games</h2>
    </div>
    <div class="games-grid">
      <div v-for="game in games" :key="game.id" class="game-card">
        <div class="game-teams">
          <button
            class="btn"
            :class="{ 'btn-primary': tempPredictions[game.id] === game.team1_id }"
            @click="selectPrediction(game.id, game.team1_id)"
          >
            {{ game.team1?.name }}
          </button>
          <span>vs</span>
          <button
            class="btn"
            :class="{ 'btn-primary': tempPredictions[game.id] === game.team2_id }"
            @click="selectPrediction(game.id, game.team2_id)"
          >
            {{ game.team2?.name }}
          </button>
        </div>
      </div>
    </div>
    <div class="submit-section">
      <button
        class="btn btn-primary submit-btn"
        @click="submitAllPredictions"
        :disabled="Object.keys(tempPredictions).length === 0"
      >
        Submit Predictions
      </button>
    </div>
    <div class="stats-section">
      <h2>Player Statistics</h2>
      <div class="stats-grid">
        <div v-for="stat in playerStats" :key="stat.player.id" class="stat-card">
          <h3>{{ stat.player.name }}</h3>
          <p>Wins: {{ stat.wins }}</p>
          <p>Losses: {{ stat.losses }}</p>
          <p>Total: {{ stat.total }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-sm);
}

.round-header {
  margin-bottom: var(--spacing-sm);
  text-align: center;
}

.games-grid {
  display: grid;
  gap: var(--spacing-md);
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  margin-bottom: var(--spacing-sm);
}

.game-card {
  background: white;
  padding: var(--spacing-md);
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.game-teams {
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;
}

.game-teams .btn {
  flex: 1;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
  min-height: 40px;
  white-space: normal;
  text-align: center;
}

.game-teams span {
  font-weight: bold;
  color: var(--primary-color);
  padding: 0 var(--spacing-xs);
}

.stats-section {
  margin-top: var(--spacing-lg);
}

.stat-card {
  background: white;
  padding: var(--spacing-sm);
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

h2 {
  font-size: var(--font-size-lg);
  color: var(--primary-color);
  margin-bottom: var(--spacing-md);
  text-align: center;
}

h3 {
  font-size: var(--font-size-md);
  margin-bottom: var(--spacing-sm);
  color: var(--primary-color);
}

.submit-section {
  display: flex;
  justify-content: center;
  margin: var(--spacing-sm) 0;
}

.submit-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-md);
  min-width: 200px;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
