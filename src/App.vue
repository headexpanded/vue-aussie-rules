<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { LoginForm } from './types'
import { useAuthStore } from './stores/auth'
import GameInterface from './components/GameInterface.vue'
import LadderPrediction from './components/LadderPrediction.vue'

const authStore = useAuthStore()

const loginForm = reactive<LoginForm>({
  name: '',
  email: '',
})

const currentRound = ref<number>(0)

async function handleLogin() {
  await authStore.login(loginForm.name, loginForm.email)
}

const showLadderPrediction = computed(() => {
  return currentRound.value === 8 || currentRound.value === 16
})

const ladderPredictionRound = computed(() => {
  return currentRound.value === 8 ? 8 : 16
})

onMounted(() => {
  authStore.checkSession()
})
</script>

<template>
  <div class="app-container">
    <h1>AFL Predictions Game</h1>
    <div v-if="!authStore.currentPlayer" class="login-card card">
      <h2>Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="name">Name</label>
          <input id="name" v-model="loginForm.name" type="text" class="form-control" required />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="loginForm.email" type="email" class="form-control" required />
        </div>

        <div v-if="authStore.error" class="error">{{ authStore.error }}</div>

        <button type="submit" class="btn btn-primary">Login</button>
      </form>
    </div>

    <div v-else class="content-container">
      <div class="app-header">
        <h2>Welcome, {{ authStore.currentPlayer.name }} !</h2>
        <p>Current Round: {{ authStore.currentRound }}</p>
      </div>

      <GameInterface :player-id="authStore.currentPlayer.id" />

      <LadderPrediction
        v-if="showLadderPrediction"
        :player-id="authStore.currentPlayer.id"
        :round-number="ladderPredictionRound"
      />
    </div>
  </div>
</template>

<style scoped>
/* @import './assets/main.css'; */

.app-container {
  width: 100%;
  min-height: 100vh;
  padding: var(--spacing-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xs);
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
  gap: var(--spacing-sm);
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  /* margin-bottom: var(--spacing-md); */
}

.card {
  background: white;
  padding: var(--spacing-md);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
