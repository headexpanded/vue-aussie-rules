<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import type { LoginForm, Player } from './types';
import { api } from './services/api';
import GameInterface from './components/GameInterface.vue';
import LadderPrediction from './components/LadderPrediction.vue';

const currentPlayer = ref<Player | null>(null);
const loginForm = reactive<LoginForm>({
  name: '',
  email: '',
});
const error = ref<string>('');
const currentRound = ref<number>(0);

async function handleLogin() {
  try {
    error.value = '';
    currentPlayer.value = await api.login(loginForm);
    currentRound.value = await api.getCurrentRound();
  } catch (e) {
    error.value = 'Login failed. Please try again.';
  }
}

const showLadderPrediction = computed(() => {
  return currentRound.value === 8 || currentRound.value === 16;
});

const ladderPredictionRound = computed(() => {
  return currentRound.value === 8 ? 16 : 24;
});
</script>

<template>
  <div class="container">
    <h1>AFL Predictions Game</h1>
    
    <div v-if="!currentPlayer" class="card">
      <h2>Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="name">Name</label>
          <input
            id="name"
            v-model="loginForm.name"
            type="text"
            class="form-control"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="loginForm.email"
            type="email"
            class="form-control"
            required
          />
        </div>
        
        <div v-if="error" class="error">{{ error }}</div>
        
        <button type="submit" class="btn btn-primary">Login</button>
      </form>
    </div>
    
    <div v-else>
      <div class="header">
        <h2>Welcome, {{ currentPlayer.name }}!</h2>
        <p>Current Round: {{ currentRound }}</p>
      </div>
      
      <GameInterface :player-id="currentPlayer.id" />
      
      <LadderPrediction
        v-if="showLadderPrediction"
        :player-id="currentPlayer.id"
        :round-number="ladderPredictionRound"
      />
    </div>
  </div>
</template>

<style>
@import './assets/main.css';

h1 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-lg);
  color: var(--primary-color);
}

h2 {
  font-size: var(--font-size-md);
  margin-bottom: var(--spacing-md);
  color: var(--primary-color);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}
</style>
