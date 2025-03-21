<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Game, Prediction, PlayerStats } from '../types';
import { api } from '../services/api';

const props = defineProps<{
  playerId: number;
}>();

const currentRound = ref<number>(0);
const games = ref<Game[]>([]);
const predictions = ref<Record<number, number>>({});
const playerStats = ref<PlayerStats[]>([]);
const error = ref<string>('');

async function loadData() {
  try {
    currentRound.value = await api.getCurrentRound();
    games.value = await api.getGames(currentRound.value);
    const stats = await api.getPlayerStats();
    playerStats.value = stats;
  } catch (e) {
    error.value = 'Failed to load game data';
  }
}

async function submitPrediction(gameId: number, teamId: number) {
  try {
    await api.submitPrediction({
      player_id: props.playerId,
      game_id: gameId,
      predicted_winner_id: teamId,
    });
    predictions.value[gameId] = teamId;
    await loadData(); // Reload stats
  } catch (e) {
    error.value = 'Failed to submit prediction';
  }
}

onMounted(loadData);
</script>

<template>
  <div class="container">
    <div v-if="error" class="error">{{ error }}</div>
    
    <div class="card">
      <h2>Round {{ currentRound }} Games</h2>
      <div class="grid">
        <div v-for="game in games" :key="game.id" class="card">
          <div class="game-teams">
            <button
              class="btn"
              :class="{ 'btn-primary': predictions[game.id] === game.team1_id }"
              @click="submitPrediction(game.id, game.team1_id)"
            >
              {{ game.team1?.name }}
            </button>
            <span>vs</span>
            <button
              class="btn"
              :class="{ 'btn-primary': predictions[game.id] === game.team2_id }"
              @click="submitPrediction(game.id, game.team2_id)"
            >
              {{ game.team2?.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card">
      <h2>Player Statistics</h2>
      <div class="grid">
        <div v-for="stat in playerStats" :key="stat.player.id" class="card">
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
.game-teams {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  justify-content: center;
}

.game-teams .btn {
  flex: 1;
  max-width: 200px;
}

.game-teams span {
  font-weight: bold;
  color: var(--primary-color);
}

h3 {
  font-size: var(--font-size-md);
  margin-bottom: var(--spacing-sm);
  color: var(--primary-color);
}
</style> 