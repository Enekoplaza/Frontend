// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import principal from '@/views/principal.vue' 

const routes = [
  
  { path: '/', name: 'principal', component: principal },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router