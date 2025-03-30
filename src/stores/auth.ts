import { defineStore } from 'pinia'
import { api } from '../services/api'
import type { Player } from '../types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentPlayer: null as Player | null,
    currentRound: 0,
    error: '',
    ready: false,
  }),

  actions: {
    async login(name: string, email: string) {
      try {
        this.error = ''
        this.currentPlayer = await api.login({ name, email })
        this.currentRound = await api.getCurrentRound()
      } catch {
        this.error = 'Login failed. Please try again.'
      }
    },

    async logout() {
      this.currentPlayer = null
    },

    async checkSession() {
      try {
        const sessionData = await api.checkSession()
        if (sessionData.isLoggedIn && sessionData.userId && sessionData.username) {
          this.currentPlayer = {
            id: sessionData.userId,
            name: sessionData.username,
            email: '',
          }
          this.currentRound = await api.getCurrentRound()
        }
      } catch (error) {
        console.error('Failed to check session: ', error)
      } finally {
        this.ready = true
      }
    },
  },
})
