<template>
  <div class="perfil">
    <div class="contenedor">
      <!-- HEADER -->
      <header class="cabecera-perfil">
        <div class="info-usuario">
          <h1>
            Hola, <span>{{ usuario.nombre }}</span>
          </h1>
          <p>Bienvenido al panel exclusivo de <strong>LAKOBRA</strong></p>
        </div>
        <div class="etiqueta" :class="usuario.rol">{{ usuario.rol }}</div>
      </header>

      <!-- GRID PRINCIPAL -->
      <div class="grid-principal">
        <!-- SIDEBAR -->
        <aside class="barra-lateral">
          <!-- DATOS DEL USUARIO -->
          <section class="tarjeta datos-usuario">
            <h3>
              <i class="icono">👤</i> Mis Datos
              <button v-if="!modoEdicion" @click="modoEdicion = true" class="boton-editar">
                ✏️
              </button>
            </h3>

            <div v-if="!modoEdicion">
              <div class="grupo-dato">
                <label>DNI</label>
                <p>{{ usuario.dni }}</p>
              </div>
              <div class="grupo-dato">
                <label>Email</label>
                <p>{{ usuario.email }}</p>
              </div>
              <div class="grupo-dato">
                <label>Dirección</label>
                <p>{{ usuario.direccion }}</p>
              </div>
            </div>

            <div v-else>
              <div class="grupo-dato">
                <label>Nombre</label>
                <input type="text" v-model="usuarioEditar.nombre" />
              </div>
              <div class="grupo-dato">
                <label>DNI</label>
                <input type="text" v-model="usuarioEditar.dni" />
              </div>
              <div class="grupo-dato">
                <label>Email</label>
                <input type="email" v-model="usuarioEditar.email" />
              </div>
              <div class="grupo-dato">
                <label>Dirección</label>
                <input type="text" v-model="usuarioEditar.direccion" />
              </div>
              <div class="botones-edicion">
                <button @click="guardarCambios" class="btn-guardar">Guardar</button>
                <button @click="cancelarEdicion" class="btn-cancelar">Cancelar</button>
              </div>
            </div>
          </section>

          <!-- TXANDALARI -->
          <section
            class="tarjeta estado-txandalari"
            :class="{ activo: usuario.solicitudTxandalari == 1 }"
          >
            <h3>🐍 Estado LAKOBRA</h3>

            <!-- Si ya es Txandalari -->
            <div v-if="usuario.solicitudTxandalari == 1" class="estado-activo">
              <div class="anillo-pulso"></div>
              <div class="texto-estado">
                <span class="estado-principal">TXANDALARI OFICIAL</span>
                <span class="estado-secundario">Miembro de la élite</span>
              </div>
            </div>

            <!-- Si no es Txandalari -->
            <!-- Si no es Txandalari -->
            <div v-else class="formulario-solicitud">
              <p class="titulo-formulario">¿Quieres ser Txandalari?</p>
              <p class="descripcion-formulario">Únete al club y accede a ventajas exclusivas.</p>

              <!-- Input de texto clásico -->
              <div class="grupo-dato">
                <label>Mensaje para tu solicitud:</label>
                <input type="text" v-model="mensajeSolicitud" placeholder="Escribe algo aquí..." />
              </div>

              <!-- Botón -->
              <button
                @click="enviarSolicitud"
                :disabled="!mensajeSolicitud || cargando"
                class="btn-txandalari"
              >
                {{ cargando ? 'Enviando...' : 'MANDAR SOLICITUD' }}
                <div class="efecto-brillante"></div>
              </button>
            </div>
          </section>
        </aside>

        <!-- MAIN CONTENT -->
        <main class="contenido">
          <section class="tarjeta eventos">
            <h3><i class="icono">📅</i> Mis Eventos Próximos</h3>

            <div v-if="eventos.length > 0" class="lista-eventos">
              <div v-for="evento in eventos" :key="evento.id" class="evento-item">
                <div class="fecha-evento">
                  <span class="dia">{{ evento.dia }}</span>
                  <span class="mes">{{ evento.mes }}</span>
                </div>
                <div class="detalle-evento">
                  <h4>{{ evento.titulo }}</h4>
                  <p>{{ evento.lugar }}</p>
                </div>
                <button class="btn-anular" title="Anular asistencia">×</button>
              </div>
            </div>

            <div v-else class="estado-vacio">
              <p>Aún no te has apuntado a ninguna quedada.</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      aceptaTerminos: false,
      cargando: false,
      modoEdicion: false,
      usuario: {
        id: 1,
        nombre: 'aaaa',
        dni: '12345678F',
        email: 'aaaa@gmail.com',
        direccion: 'Calle Falsa 123',
        rol: 'admin',
        solicitudTxandalari: 0,
      },
      usuarioEditar: {},
      eventos: [
        { id: 1, titulo: 'KDD Nocturna LAKOBRA', dia: '15', mes: 'ABR', lugar: 'Parking Norte' },
        { id: 2, titulo: 'Ruta Montaña Sierra', dia: '22', mes: 'MAY', lugar: 'Punto Pack' },
      ],
    }
  },
  methods: {
    cancelarEdicion() {
      this.modoEdicion = false
    },
    guardarCambios() {
      this.usuario = { ...this.usuarioEditar }
      this.modoEdicion = false
      alert('Datos actualizados correctamente')
    },
    async enviarSolicitud() {
      if (!this.aceptaTerminos) return

      this.cargando = true
      try {
        const respuesta = await fetch('http://localhost:3000/api/txandalari/solicitar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario_id: this.usuario.id }),
        })
        const datos = await respuesta.json()
        if (respuesta.ok) {
          this.usuario.solicitudTxandalari = 1
          this.aceptaTerminos = false
          alert('🔥 Solicitud enviada correctamente')
        } else {
          alert(datos.message || 'Error al enviar solicitud')
        }
      } catch (error) {
        console.error(error)
        alert('Error de conexión con el servidor')
      } finally {
        this.cargando = false
      }
    },
  },
  watch: {
    modoEdicion(val) {
      if (val) this.usuarioEditar = { ...this.usuario }
    },
  },
}
</script>

<style scoped>
:root {
  --color-fondo: #f1f5f9;
  --color-primario: #3b82f6;
  --color-secundario: #111827;
  --color-claro: #fff;
  --color-muted: #64748b;
  --color-activo: #facc15;
  --radio-bordes: 12px;
  --sombra: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.perfil {
  min-height: 100vh;
  background-color: var(--color-fondo);
  font-family: 'Inter', sans-serif;
  color: var(--color-secundario);
  padding: 2rem 1rem;
}
.contenedor {
  max-width: 1000px;
  margin: 0 auto;
}
.cabecera-perfil {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.cabecera-perfil h1 {
  font-size: 2rem;
  font-weight: 800;
}
.cabecera-perfil h1 span {
  background: black;
  color: var(--color-claro);
  padding: 2px 10px;
  border-radius: var(--radio-bordes);
}
.etiqueta {
  padding: 6px 16px;
  border-radius: 50px;
  font-weight: bold;
  font-size: 0.75rem;
  background: var(--color-claro);
  border: 1px solid #e2e8f0;
}
.etiqueta.admin {
  background: #fee2e2;
  color: #dc2626;
}
.grid-principal {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}
@media (max-width: 768px) {
  .grid-principal {
    grid-template-columns: 1fr;
  }
}
.tarjeta {
  background: var(--color-claro);
  border-radius: var(--radio-bordes);
  padding: 1.5rem;
  box-shadow: var(--sombra);
  margin-bottom: 1.5rem;
}
.tarjeta h3 {
  font-size: 1.1rem;
  margin-bottom: 1.2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.grupo-dato {
  margin-bottom: 1rem;
}
.grupo-dato label {
  font-size: 0.75rem;
  color: var(--color-muted);
  font-weight: 600;
  display: block;
}
.grupo-dato p,
.grupo-dato input {
  font-weight: 500;
  padding: 4px 6px;
  border-radius: var(--radio-bordes);
  border: 1px solid #d1d5db;
  margin-top: 3px;
  width: 100%;
}
.botones-edicion {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
.btn-guardar {
  background: var(--color-primario);
  color: var(--color-claro);
  padding: 8px 12px;
  border: none;
  border-radius: var(--radio-bordes);
  cursor: pointer;
}
.btn-cancelar {
  background: #e5e7eb;
  color: var(--color-secundario);
  padding: 8px 12px;
  border: none;
  border-radius: var(--radio-bordes);
  cursor: pointer;
}
.boton-editar {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-primario);
  margin-left: 10px;
  font-size: 0.8rem;
}

/* TXANDALARI */
.estado-txandalari {
  background: #000;
  color: var(--color-claro);
  padding: 1rem;
  border-radius: var(--radio-bordes);
}
.estado-txandalari.activo {
  border: 2px solid var(--color-activo);
}
.estado-activo {
  display: flex;
  align-items: center;
  gap: 10px;
}
.estado-principal {
  font-weight: 800;
  color: var(--color-activo);
}
.estado-secundario {
  font-size: 0.75rem;
  color: var(--color-muted);
}
.anillo-pulso {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-activo);
  animation: pulso 2s infinite;
}
@keyframes pulso {
  0%,
  100% {
    transform: scale(0.95);
    opacity: 0.7;
  }
  50% {
    transform: scale(1);
    opacity: 0;
  }
}

/* CHECKBOX */
.checkbox-personalizado {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  margin-bottom: 1rem;
}
.checkbox-personalizado input {
  display: none;
}
.marca-check {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-activo);
  border-radius: 4px;
  position: relative;
}
.checkbox-personalizado input:checked + .marca-check {
  background: var(--color-activo);
}
.marca-check:after {
  content: '✔';
  position: absolute;
  left: 3px;
  top: 0px;
  font-weight: 700;
  color: black;
  display: none;
}
.checkbox-personalizado input:checked + .marca-check:after {
  display: block;
}

/* BOTON TXANDALARI */
.btn-txandalari {
  position: relative;
  width: 100%;
  padding: 12px;
  background: var(--color-activo);
  color: black;
  border: none;
  border-radius: var(--radio-bordes);
  font-weight: 800;
  cursor: pointer;
  overflow: hidden;
}
.btn-txandalari:disabled {
  background: #ad8989;
  color: #723030;
  cursor: not-allowed;
}
.efecto-brillante {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
}
.btn-txandalari:hover .efecto-brillante {
  left: 200%;
  transition: 0.8s ease;
}

/* EVENTOS */
.evento-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: var(--radio-bordes);
  margin-bottom: 1rem;
}
.fecha-evento {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--color-activo);
  color: black;
  padding: 6px;
  border-radius: var(--radio-bordes);
  min-width: 50px;
}
.dia {
  font-weight: 800;
  font-size: 1.2rem;
}
.mes {
  font-size: 0.7rem;
  font-weight: 700;
}
.detalle-evento h4 {
  margin: 0;
  font-weight: 700;
}
.detalle-evento p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-muted);
}
.btn-anular {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
.btn-anular:hover {
  color: #ef4444;
}
</style>