<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import type { LoginForm, Player } from './types';
import { api } from './services/api';
import { useAuthStore } from './stores/auth';
import GameInterface from './components/GameInterface.vue';
import LadderPrediction from './components/LadderPrediction.vue';

const authStore = useAuthStore();

const currentPlayer = ref<Player | null>(null);
const loginForm = reactive<LoginForm>({
  name: '',
  email: '',
});
const error = ref<string>('');
const currentRound = ref<number>(1);

async function handleLogin() {
  try {
    error.value = '';
    currentPlayer.value = await api.login(loginForm);
    currentRound.value = await api.getCurrentRound();
  } catch (e) {
    error.value = 'Login failed. Please try again.';
  }
}

async function checkSession() {
  try {
    const sessionData = await api.checkSession();
    if (sessionData.isLoggedIn && sessionData.userId && sessionData.username) {
        currentPlayer.value = {
            id: sessionData.userId,
            name: sessionData.username,
            email: ''
        }
       currentRound.value = await api.getCurrentRound()
    }
  } catch (error) {
    console.error('Failed to check session:', error);
  }
}

const showLadderPrediction = computed(() => {
  return currentRound.value === 8 || currentRound.value === 16;
});

const ladderPredictionRound = computed(() => {
  return currentRound.value === 8 ? 8 : 16;
});
</script>

<template>
  <div class="app-container">
    <h1>AFL Predictions Game</h1>
    
    <div v-if="!currentPlayer" class="login-card card">
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
    
    <div v-else class="content-container">
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

<style scoped>
@import './assets/main.css';

.app-container {
  width: 100%;
  min-height: 100vh;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-lg);
  color: var(--primary-color);
  text-align: center;
  width: 100%;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.content-container {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing);
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: var(--spacing-md);
}

.card {
  background: white;
  padding: var(--spacing-md);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
