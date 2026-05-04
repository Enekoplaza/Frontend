<script setup>
import { computed } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'

// 1. IMPORTANTE: Los idiomas se importan así desde el paquete 'core'
import esLocale from '@fullcalendar/core/locales/es'
import euLocale from '@fullcalendar/core/locales/eu' 

import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const props = defineProps({
  mostrar: Boolean,
  eventos: { type: Array, default: () => [] },
  usuario: { type: Object, default: null }
})

const emit = defineEmits(['cerrar'])

// --- TRADUCTOR DE EVENTOS ---
const eventosFormateados = computed(() => {
  const hoy = new Date().toISOString().split('T')[0]
  const rolUsuario = props.usuario?.rol || 'socio'

  return props.eventos.map(e => {
    let bgColor = '#3b82f6'
    let titulo = e.titulo

    if (e.estado === 'cancelado') bgColor = '#ef4444'
    else if (e.estado === 'pendiente') bgColor = '#f59e0b'
    else if (e.estado === 'confirmado') bgColor = '#10b981'

    if (e.fecha_evento < hoy) bgColor = '#475569'

    if (e.estoy_apuntado || (e.puesto && e.puesto !== '')) {
      if (rolUsuario === 'admin' || rolUsuario === 'txandalari') {
        // Usamos $t para traducir el prefijo del título también
        titulo = `🛠️ [${locale.value === 'eus' ? 'Txanda' : 'Turno'}] ${e.titulo}`
        bgColor = '#8b5cf6'
      } else {
        titulo = `🎫 [${locale.value === 'eus' ? 'Barruan' : 'Dentro'}] ${e.titulo}`
        bgColor = '#0ea5e9'
      }
    }

    return {
      title: titulo,
      date: e.fecha_evento,
      backgroundColor: bgColor,
      borderColor: bgColor,
      allDay: true 
    }
  })
})

// --- CONFIGURACIÓN DEL CALENDARIO ---
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  // 2. Aquí hacemos el cambio dinámico de idioma
  locale: locale.value === 'eus' ? euLocale : esLocale, 
  events: eventosFormateados.value,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth'
  },
  height: '100%',
  firstDay: 1
}))
</script>

<template>
  <transition name="fade">
    <div v-if="mostrar" class="modal-overlay" @click.self="$emit('cerrar')">
      <div class="modal-content-calendario">
        <button class="btn-close" @click="$emit('cerrar')">✖</button>
        
        <div class="calendario-wrapper">
          <FullCalendar :options="calendarOptions" />
        </div>

        <div class="leyenda">
          <span class="leyenda-item"><span class="dot verde"></span> {{ $t('perfil.cal_confirmado') }}</span>
          <span class="leyenda-item"><span class="dot naranja"></span> {{ $t('perfil.cal_pendiente') }}</span>
          <span class="leyenda-item"><span class="dot gris"></span> {{ $t('perfil.cal_finalizado') }}</span>
          
          <span v-if="usuario && (usuario.rol === 'admin' || usuario.rol === 'txandalari')" class="leyenda-item">
            <span class="dot morado"></span> {{ $t('perfil.cal_mi_turno') }}
          </span>
          <span v-else class="leyenda-item">
            <span class="dot" style="background: #0ea5e9;"></span> {{ $t('perfil.cal_dentro') }}
          </span>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* ESTILOS DEL MODAL (Fondo oscuro) */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(15, 23, 42, 0.85);
    /* Fondo oscuro con opacidad */
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    /* Por encima de todo */
}

.modal-content-calendario {
    background: #1e293b;
    width: 90%;
    max-width: 900px;
    height: 80vh;
    border-radius: 12px;
    padding: 20px;
    position: relative;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    border: 1px solid #334155;
}

.btn-close {
    position: absolute;
    top: 15px;
    right: 15px;
    background: transparent;
    color: #f8fafc;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    z-index: 10;
}

.btn-close:hover {
    color: #ef4444;
}

.calendario-wrapper {
    flex-grow: 1;
    background: #0f172a;
    border-radius: 8px;
    padding: 10px;
    overflow: hidden;
    color: #f8fafc;
}

/* LEYENDA INFERIOR */
.leyenda {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 15px;
    flex-wrap: wrap;
}

.leyenda-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.9rem;
    color: #cbd5e1;
}

.dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

.dot.verde {
    background: #10b981;
}

.dot.naranja {
    background: #f59e0b;
}

.dot.gris {
    background: #475569;
}

.dot.morado {
    background: #8b5cf6;
}

/* MODIFICANDO EL CSS INTERNO DE FULLCALENDAR PARA MODO OSCURO */
:deep(.fc-theme-standard td),
:deep(.fc-theme-standard th),
:deep(.fc-theme-standard .fc-scrollgrid) {
    border-color: #334155;
}

:deep(.fc-col-header-cell-cushion),
:deep(.fc-daygrid-day-number) {
    color: #cbd5e1;
    text-decoration: none;
}

:deep(.fc-button-primary) {
    background-color: #38bdf8 !important;
    border-color: #38bdf8 !important;
    color: #0f172a !important;
    font-weight: bold;
}

:deep(.fc-button-primary:hover) {
    background-color: #7dd3fc !important;
}

:deep(.fc-day-today) {
    background-color: rgba(56, 189, 248, 0.1) !important;
}
</style>