<script setup>
import { apiFetch } from '@/services/apiFetch'
import { ref } from 'vue'

const dniInput = ref('')
const cargando = ref(false)
const resultado = ref(null)

const validarDni = async () => {
  if (dniInput.value.trim() === '') return
  
  cargando.value = true
  resultado.value = null

  try {
    const data = await apiFetch('api_validar_acceso.php', {
      method: 'POST',
      body: JSON.stringify({ dni: dniInput.value.trim().toUpperCase() })
    })
    
    resultado.value = data
    
    if (data.estado === 'OK') {
      dniInput.value = ''
    }

  } catch (error) {
    resultado.value = { estado: 'error', mensaje: 'Error de conexión' }
  } finally {
    cargando.value = false
  }
}
</script>
<template>
  <div class="control-acceso">
    <div class="contenedor-herramienta">
      
      <header class="cabecera">
        <h1>🛡️ Control de Puerta</h1>
        <p>Validador de Acceso por DNI</p>
      </header>

      <div class="formulario-validacion">
        <label>Introduce el DNI del usuario:</label>
        <div class="input-grupo">
          <input 
            type="text" 
            v-model="dniInput" 
            placeholder="Ej: 12345678A"
            @keyup.enter="validarDni"
            :disabled="cargando"
          >
          <button 
            @click="validarDni" 
            :disabled="cargando || dniInput === ''" 
            class="btn-validar"
          >
            {{ cargando ? '...' : 'Comprobar' }}
          </button>
        </div>
      </div>

      <transition name="fade">
        <div v-if="resultado" class="panel-resultado" :class="resultado.estado.toLowerCase().replace(' ', '-')">
          
          <div v-if="resultado.estado === 'OK'" class="estado-ok">
            <span class="icono">✅</span>
            <h2>ACCESO PERMITIDO</h2>
            <p><strong>{{ resultado.nombre }}</strong> puede pasar.</p>
            <p class="aforo">Aforo: {{ resultado.ocupacion }}</p>
          </div>

          <div v-else-if="resultado.estado === 'Ya entró'" class="estado-aviso">
            <span class="icono">⚠️</span>
            <h2>ENTRADA DUPLICADA</h2>
            <p><strong>{{ resultado.nombre }}</strong> ya ha registrado su entrada hoy.</p>
          </div>

          <div v-else-if="resultado.estado === 'Aforo completo'" class="estado-error">
            <span class="icono">⛔</span>
            <h2>AFORO COMPLETO</h2>
            <p>No se admiten más personas.</p>
          </div>

          <div v-else-if="resultado.estado === 'Sin evento'" class="estado-error">
            <span class="icono">📅</span>
            <h2>SIN EVENTO</h2>
            <p>No hay ningún evento confirmado para la fecha de hoy.</p>
          </div>

          <div v-else class="estado-error">
            <span class="icono">❌</span>
            <h2>DNI INVÁLIDO</h2>
            <p>Este DNI no existe o no es válido.</p>
          </div>

        </div>
      </transition>

    </div>
  </div>
</template>

<style scoped>
.control-acceso {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 80vh;
  padding: 2rem 1rem;
}

.contenedor-herramienta {
  background: #1e293b;
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border: 1px solid #334155;
  text-align: center;
}

.cabecera h1 { 
  color: #facc15; 
  font-size: 1.8rem; 
  margin-bottom: 0.5rem; 
}

.cabecera p { 
  color: #94a3b8; 
  margin-bottom: 2rem; 
}

.formulario-validacion {
  text-align: left;
  margin-bottom: 2rem;
}

.formulario-validacion label {
  display: block;
  color: #cbd5e1;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.input-grupo {
  display: flex;
  gap: 10px;
}

.input-grupo input {
  flex: 1;
  background: #0f172a;
  border: 2px solid #334155;
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-size: 1.1rem;
  outline: none;
  font-family: monospace;
}

.input-grupo input:focus { 
  border-color: #facc15; 
}

.btn-validar {
  background: #facc15;
  color: #0f172a;
  border: none;
  padding: 0 20px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
}

.btn-validar:disabled { 
  opacity: 0.5; 
  cursor: not-allowed; 
}

.btn-validar:hover:not(:disabled) { 
  background: #eab308; 
}

/* RESULTADOS */
.panel-resultado {
  padding: 1.5rem;
  border-radius: 8px;
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.icono { 
  font-size: 3rem; 
  display: block; 
  margin-bottom: 10px; 
}

.panel-resultado h2 { 
  margin-bottom: 5px; 
  font-size: 1.4rem; 
}

.panel-resultado p { 
  margin: 0; 
  font-size: 1.1rem; 
}

.aforo { 
  margin-top: 10px !important; 
  font-size: 0.9rem !important; 
  opacity: 0.8; 
}

/* ESTADOS */
.ok { 
  background: rgba(16, 185, 129, 0.2); 
  border: 2px solid #10b981; 
  color: #34d399; 
}

.ya-entró { 
  background: rgba(245, 158, 11, 0.2); 
  border: 2px solid #f59e0b; 
  color: #fbbf24; 
}

.aforo-completo, 
.sin-evento, 
.error { 
  background: rgba(239, 68, 68, 0.2); 
  border: 2px solid #ef4444; 
  color: #f87171; 
}

@keyframes popIn {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.fade-enter-active, .fade-leave-active { 
  transition: opacity 0.3s; 
}

.fade-enter-from, .fade-leave-to { 
  opacity: 0; 
}

/* =========================================
   📱 TABLET
   ========================================= */
@media (max-width: 1024px) {

  .contenedor-herramienta {
    max-width: 450px;
    padding: 1.8rem;
  }

  .cabecera h1 {
    font-size: 1.7rem;
  }

  .input-grupo input {
    font-size: 1rem;
  }
}

/* =========================================
   📱 MÓVIL
   ========================================= */
@media (max-width: 768px) {

  .control-acceso {
    align-items: center;
    padding: 1.5rem 1rem;
  }

  .contenedor-herramienta {
    max-width: 100%;
    padding: 1.5rem;
    border-radius: 10px;
  }

  .cabecera h1 {
    font-size: 1.5rem;
  }

  .cabecera p {
    font-size: 0.95rem;
  }

  .input-grupo {
    flex-direction: column;
    gap: 12px;
  }

  .input-grupo input {
    font-size: 1rem;
    padding: 13px;
  }

  .btn-validar {
    width: 100%;
    padding: 12px;
  }

  .panel-resultado {
    padding: 1.2rem;
  }

  .icono {
    font-size: 2.5rem;
  }
}

/* =========================================
   📱 MÓVIL PEQUEÑO
   ========================================= */
@media (max-width: 480px) {

  .contenedor-herramienta {
    padding: 1.2rem;
  }

  .cabecera h1 {
    font-size: 1.3rem;
  }

  .cabecera p {
    font-size: 0.9rem;
  }

  .input-grupo input {
    font-size: 0.95rem;
  }

  .panel-resultado h2 {
    font-size: 1.2rem;
  }

  .panel-resultado p {
    font-size: 1rem;
  }

  .aforo {
    font-size: 0.85rem !important;
  }
}
</style>