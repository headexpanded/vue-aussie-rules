<script setup lang="ts">
import type { Game, PlayerStats, Team } from '@/types'
import { onMounted, ref, computed, watchEffect } from 'vue'
import { useAuthStore } from '../stores/auth'
import { api } from '../services/api'
import { differenceInDays } from 'date-fns'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const authStore = useAuthStore()

const props = defineProps<{
  playerId: number
}>()

const currentRound = ref<number>(0)
const games = ref<Game[]>([])
const totalGamesInRound = ref<number>(0)
const predictions = ref<Record<number, number>>({})
const tempPredictions = ref<Record<number, number>>({})
const playerStats = ref<PlayerStats[]>([])
const hasSubmitted = ref<boolean>(false)
const error = ref<string>('')
const submitError = ref<string>('')
const notify = () => {
    toast.success('Your tips are in!', {"theme": "colored", "position": "top-center", "transition": "slide"})
};

async function loadData() {
  try {
    currentRound.value = await api.getCurrentRound()
    games.value = await api.getGames(currentRound.value)
    totalGamesInRound.value = games.value.length
    playerStats.value = await api.getPlayerStats()
    checkIfSubmitted()
  } catch {
    error.value = 'Failed to load game data'
  }
}

function selectPrediction(gameId: number, teamId: number) {
  tempPredictions.value[gameId] = teamId
}

function reset() {
  tempPredictions.value = {}
}

function logout() {
  authStore.logout()
}

const ranking = computed(() => ['2 extra games.', 'Legit.', 'Pick 1.'])

const daysSinceLastEssendonFinalsWin = computed(() => {
	const lastWinDate = new Date(2004, 8, 4);
	return differenceInDays(new Date(), lastWinDate);
});

const buttonLabel = (team?: Team): string => {
	if (!team) return 'Unknown team';
	if (team.name === 'Essidin') return `${daysSinceLastEssendonFinalsWin.value}`;
	if (team.name === 'Mighty Tigers') return '18thmond';
	if (team.name === 'Smellbum') return 'Smellbum Lemons';
	if (team.name === 'Wet Toast') return 'Worst Coast';
	if (team.name === 'Failmantle') return 'Chokemantle';
	if (team.name === 'Mighty Lions') return 'THE PREMIERS';
	if (team.name === 'Swines') return 'Shitney';
	if (team.name === 'Boganwood') return 'Straightsetswood';
	if (team.name === 'The Orange Team') return 'GWShit';
	if (team.name === 'Geewrong') return 'Straightsetslong';
	if (team.name === 'Pooort') return 'Pisspoort';
	if (team.name === 'St Failda') return 'St Failda';
	if (team.name === 'Whoreborn') return 'Shitethorn';
	if (team.name === 'Crom') return 'Jokelaide';
	if (team.name === 'Fold Coast') return 'Participation Medal Coast';
	return team.name;
};

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
    hasSubmitted.value = true;
    notify();
    await loadData() // Reload stats
  } catch {
    submitError.value = 'Failed to submit predictions'
  }
}

const checkIfSubmitted = async () => {
    try {
        submitError.value = ''
        hasSubmitted.value = await api.hasSubmitted(props.playerId, currentRound.value)
    } catch {
        hasSubmitted.value = false;
    }
}

watchEffect(() => {
    if(currentRound.value) {
        checkIfSubmitted();
    }
});

onMounted(loadData)
</script>

<template>
  <div class="game-container">
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="submitError" class="error">{{ submitError }}</div>

    <div class="round-header">
      <h2>Q/E Finals</h2>
    </div>
    <div class="games-grid">
      <div v-for="game in games" :key="game.id" class="game-card">
        <div class="game-teams">
          <button
            class="btn"
            :class="{ 'btn-primary': tempPredictions[game.id] === game.team1_id }"
            @click="selectPrediction(game.id, game.team1_id)"
          >
            {{ buttonLabel(game.team1) }}
          </button>
          <span>vs</span>
          <button
            class="btn"
            :class="{ 'btn-primary': tempPredictions[game.id] === game.team2_id }"
            @click="selectPrediction(game.id, game.team2_id)"
          >
            {{ buttonLabel(game.team2) }}
          </button>
        </div>
      </div>
    </div>
    <div class="submit-section">
      <button
        class="btn reset-btn"
        @click="reset"
        :disabled="Object.keys(tempPredictions).length === 0"
      >
        Reset
      </button>
      <button
        class="btn btn-primary submit-btn"
        @click="submitAllPredictions"
        :disabled="hasSubmitted || Object.keys(tempPredictions).length !== totalGamesInRound"
      >
        Submit Predictions
      </button>
      <button class="btn logout-btn" @click="logout">Logout</button>
    </div>

    <div class="stats-header">
      <h2>Player Statistics</h2>
    </div>
    <div class="stats-section">
     <div class="stats-grid">
      <div v-for="(stat, index) in playerStats" :key="stat.player.id" class="stat-card">
        <h3
          :class="{
            winning: index === 0,
            'not-winning': index === 1,
            losing: index === 2,
          }"
        >
          {{ ranking[index] }}
        </h3>
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

.stats-header {
  margin-top: var(--spacing-md);
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
  margin-top: var(--spacing-md);
}

.stats-grid {
  display: grid;
  gap: var(--spacing-md);
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

.stat-card {
  background: white;
  padding: var(--spacing-sm);
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
  margin-left: var(--spacing-xs);
  margin-right: var(--spacing-xs);
}

.reset-btn {
  color: white;
  background-color: red;
  margin-right: var(--spacing-xs);
}

.logout-btn {
  color: white;
  background-color: red;
  margin-left: var(--spacing-xs);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reset-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.winning {
  color: green;
  font-weight: bold;
}

.not-winning {
  color: brown;
  font-weight: bold;
}

.losing {
  color: red;
  font-weight: bold;
}
</style>
