<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Team, LadderPrediction } from '../types';
import { api } from '../services/api';

const props = defineProps<{
  playerId: number;
  roundNumber: number;
}>();

const teams = ref<Team[]>([]);
const predictions = ref<Record<number, number>>({});
const allPredictions = ref<LadderPrediction[]>([]);
const error = ref<string>('');

async function loadData() {
  try {
    teams.value =  await api.getTeams();    
   // allPredictions.value = await api.getLadderPredictions(props.roundNumber);
  } catch (e) {
    error.value = 'Failed to load ladder data';
  }
}

async function submitPrediction(teamId: number, position: number) {
  try {
    await api.submitLadderPrediction({
      player_id: props.playerId,
      round_number: props.roundNumber,
      team_id: teamId,
      predicted_position: position,
    });
    predictions.value[teamId] = position;
    await loadData();
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
      <h2>Predict Round {{ roundNumber }} Ladder</h2>
      <p>Drag teams to reorder them in your predicted ladder position</p>
      
      <div class="ladder-container">
        <div
          v-for="position in 18"
          :key="position"
          class="ladder-row"
        >
          <div class="position">{{ position }}</div>
          <select
            v-model="predictions[teams[position - 1]?.id]"
            class="team-select"
            @change="submitPrediction(teams[position - 1].id, position)"
          >
            <option v-for="team in teams" :key="team.id" :value="position">
              {{ team.name }}
            </option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="card">
      <h2>All Predictions</h2>
      <div class="predictions-grid">
        <div v-for="prediction in allPredictions" :key="prediction.id" class="prediction-card">
          <h3>{{ prediction.team?.name }}</h3>
          <p>Position: {{ prediction.predicted_position }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ladder-container {
  margin-top: var(--spacing-md);
}

.ladder-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) 0;
  border-bottom: 1px solid var(--border-color);
}

.position {
  width: 40px;
  font-weight: bold;
  color: var(--primary-color);
}

.team-select {
  flex: 1;
  padding: var(--spacing-xs);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: var(--font-size-md);
}

.predictions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.prediction-card {
  background: var(--background-color);
  padding: var(--spacing-sm);
  border-radius: 4px;
}
</style> 
