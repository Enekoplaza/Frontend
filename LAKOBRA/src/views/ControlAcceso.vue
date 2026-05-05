<script setup>
import { apiFetch } from '@/services/apiFetch'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { useI18n } from 'vue-i18n' // <-- Importamos i18n

const { t } = useI18n() // <-- Instanciamos t() para usarlo en el script
const route = useRoute()
const router = useRouter() 
const dniInput = ref('')
const cargando = ref(false)
const resultado = ref(null)

const esAutorizado = ref(false)
const usuarioLocal = JSON.parse(localStorage.getItem('usuarioLakobra') || '{}')

onMounted(async () => {
  if (usuarioLocal.rol === 'admin' || usuarioLocal.rol === 'txandalari') {
    esAutorizado.value = true
    return
  }

  if (route.query.guest) {
    const data = await apiFetch(`api_validar_invitado.php?token=${route.query.guest}`)
    if (data.success) {
      esAutorizado.value = true
      Swal.fire({
        background: '#1e293b',
        color: '#f8fafc',
        title: t('puerta.swal_activo_tit'),
        text: t('puerta.swal_activo_msg'),
        icon: 'success',
        timer: 2500,
        showConfirmButton: false
      })
    } else {
      await Swal.fire({
        background: '#1e293b',
        color: '#f8fafc',
        title: t('puerta.swal_caducado_tit'),
        text: t('puerta.swal_caducado_msg'),
        icon: 'error',
        confirmButtonColor: '#38bdf8'
      })
      router.push('/principal')
    }
  } else {
    router.push('/principal')
  }
})

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
    if (data.estado === 'OK') dniInput.value = ''
  } catch (error) {
    resultado.value = { estado: 'error', mensaje: t('puerta.err_conexion') }
  } finally {
    cargando.value = false
  }
}

const generarEnlace = async () => {
  try {
    const data = await apiFetch('api_generar_enlace.php')
    if (data.success) {
      const url = `${window.location.origin}/puerta?guest=${data.token}`
      await navigator.clipboard.writeText(url)
      Swal.fire({
        background: '#1e293b',
        color: '#f8fafc',
        title: t('puerta.swal_copiado_tit'),
        text: t('puerta.swal_copiado_msg'),
        icon: 'success',
        confirmButtonColor: '#38bdf8'
      })
    }
  } catch (e) {
    Swal.fire({
      background: '#1e293b',
      color: '#f8fafc',
      title: t('puerta.swal_err_tit'),
      text: t('puerta.swal_err_msg'),
      icon: 'error',
      confirmButtonColor: '#38bdf8'
    })
  }
}
</script>

<template>
  <div class="control-acceso" v-if="esAutorizado">
    <div class="contenedor-herramienta">

      <header class="cabecera">
        <h1>🛡️ {{ $t('puerta.titulo') }}</h1>
        <p>{{ $t('puerta.subtitulo') }}</p>
      </header>

      <div v-if="usuarioLocal && usuarioLocal.rol === 'admin'" class="zona-admin">
        <button @click="generarEnlace" class="btn-enlace">
          🔗 {{ $t('puerta.btn_generar_enlace') }}
        </button>
      </div>

      <div class="formulario-validacion">
        <label>{{ $t('puerta.label_dni') }}</label>
        <div class="input-grupo">
          <input type="text" v-model="dniInput" :placeholder="$t('puerta.ph_dni')" @keyup.enter="validarDni"
            :disabled="cargando">
          <button @click="validarDni" :disabled="cargando || dniInput === ''" class="btn-validar">
            {{ cargando ? '...' : $t('puerta.btn_comprobar') }}
          </button>
        </div>
      </div>

      <transition name="fade">
        <div v-if="resultado" class="panel-resultado" :class="resultado.estado.toLowerCase().replace(' ', '-')">
          
          <div v-if="resultado.estado === 'OK'" class="estado-ok">
            <span class="icono">✅</span>
            <h2>{{ $t('puerta.acceso_ok') }}</h2>
            <p><strong>{{ resultado.nombre }}</strong> {{ $t('puerta.puede_pasar') }}</p>
            <p class="aforo">{{ resultado.ocupacion }}</p>
          </div>

          <div v-else-if="resultado.estado === 'Ya entró'" class="estado-aviso">
            <span class="icono">⚠️</span>
            <h2>{{ $t('puerta.entrada_dup') }}</h2>
            <p><strong>{{ resultado.nombre }}</strong> {{ $t('puerta.ya_entro') }}</p>
          </div>

          <div v-else-if="resultado.estado === 'Aforo completo'" class="estado-error">
            <span class="icono">⛔</span>
            <h2>{{ $t('puerta.aforo_full') }}</h2>
            <p>{{ $t('puerta.no_mas') }}</p>
          </div>

          <div v-else-if="resultado.estado === 'Sin evento'" class="estado-error">
            <span class="icono">📅</span>
            <h2>{{ $t('puerta.sin_evento') }}</h2>
            <p>{{ $t('puerta.no_hay_evento') }}</p>
          </div>

          <div v-else class="estado-error">
            <span class="icono">❌</span>
            <h2>{{ $t('puerta.dni_invalido') }}</h2>
            <p>{{ $t('puerta.no_existe') }}</p>
          </div>
          
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
/* =========================================
   CONTENEDORES PRINCIPALES
   ========================================= */
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

/* =========================================
   CABECERA
   ========================================= */
.cabecera h1 {
  color: #facc15;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.cabecera p {
  color: #94a3b8;
  margin-bottom: 2rem;
}

/* =========================================
   ZONA ADMIN (ENLACE)
   ========================================= */
.zona-admin {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #334155;
}

.btn-enlace {
  background: transparent;
  color: #38bdf8;
  border: 1px solid #38bdf8;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.3s;
  width: 100%;
}

.btn-enlace:hover {
  background: rgba(56, 189, 248, 0.1);
}

/* =========================================
   FORMULARIO
   ========================================= */
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

/* =========================================
   RESULTADOS Y ESTADOS
   ========================================= */
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

.estado-ok {
  background: rgba(16, 185, 129, 0.2);
  border: 2px solid #10b981;
  color: #34d399;
}

.estado-aviso {
  background: rgba(245, 158, 11, 0.2);
  border: 2px solid #f59e0b;
  color: #fbbf24;
}

.estado-error {
  background: rgba(239, 68, 68, 0.2);
  border: 2px solid #ef4444;
  color: #f87171;
}

/* =========================================
   ANIMACIONES
   ========================================= */
@keyframes popIn {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* =========================================
   SWEETALERT FIX (Estilo Oscuro Forzado)
   ========================================= */
:deep(.swal2-popup) {
  background-color: #1e293b !important;
  color: #f8fafc !important;
}
:deep(.swal2-title), :deep(.swal2-html-container) {
  color: #f8fafc !important;
}

/* =========================================
   📱 RESPONSIVE (MEDIA QUERIES)
   ========================================= */
@media (max-width: 1024px) {
  .contenedor-herramienta {
    max-width: 450px;
    padding: 1.8rem;
  }
  .cabecera h1 { font-size: 1.7rem; }
  .input-grupo input { font-size: 1rem; }
}

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
  .cabecera h1 { font-size: 1.5rem; }
  .cabecera p { font-size: 0.95rem; }
  
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
  .panel-resultado { padding: 1.2rem; }
  .icono { font-size: 2.5rem; }
}

@media (max-width: 480px) {
  .contenedor-herramienta { padding: 1.2rem; }
  .cabecera h1 { font-size: 1.3rem; }
  .cabecera p { font-size: 0.9rem; }
  .input-grupo input { font-size: 0.95rem; }
  .panel-resultado h2 { font-size: 1.2rem; }
  .panel-resultado p { font-size: 1rem; }
  .aforo { font-size: 0.85rem !important; }
}
</style>