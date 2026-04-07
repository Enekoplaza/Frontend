<template>
  <div class="perfil">
    <div class="contenedor">
      <header class="cabecera-perfil">
        <div class="info-usuario">
          <h1>
            Ongi Etorri LAKOBRA-RA <span>{{ usuarioEditar.nombre || '...' }}</span>
          </h1>
        </div>
        <div class="etiqueta" :class="usuarioEditar.rol">{{ usuarioEditar.rol }}</div>
      </header>

      <div class="grid-principal">
        <aside class="barra-lateral">
          <section class="tarjeta datos-usuario">
            <div class="cabecera-seccion">
              <h3><i class="icono">👤</i> Nire Datuak</h3>
              <button
                v-if="!modoEdicion"
                @click="modoEdicion = true"
                class="boton-editar-icono"
                title="Editatu"
              >
                ✏️
              </button>
            </div>

            <div v-if="!modoEdicion" class="vista-datos">
              <div class="grupo-dato">
                <label>Izena</label>
                <p class="dato-texto">{{ usuarioEditar.nombre || '---' }}</p>
              </div>
              <div class="grupo-dato">
                <label>DNI-a</label>
                <p class="dato-texto">{{ usuarioEditar.dni || '---' }}</p>
              </div>
              <div class="grupo-dato">
                <label>Email-a</label>
                <p class="dato-texto">{{ usuarioEditar.email || '---' }}</p>
              </div>
              <div class="grupo-dato">
                <label>Norabidea</label>
                <p class="dato-texto">{{ usuarioEditar.direccion || '---' }}</p>
              </div>
            </div>

            <div v-else class="formulario-edicion">
              <div class="grupo-dato">
                <label>Izena</label>
                <input type="text" v-model="usuarioEditar.nombre" placeholder="Sartu izena..." />
              </div>
              <div class="grupo-dato">
                <label>DNI-a</label>
                <input type="text" v-model="usuarioEditar.dni" placeholder="12345678X" />
              </div>
              <div class="grupo-dato">
                <label>Email-a</label>
                <input type="email" v-model="usuarioEditar.email" placeholder="adibidea@mail.com" />
              </div>
              <div class="grupo-dato">
                <label>Norabidea</label>
                <input
                  type="text"
                  v-model="usuarioEditar.direccion"
                  placeholder="Zure helbidea..."
                />
              </div>

              <div class="botones-edicion">
                <button @click="guardarCambios" class="btn-guardar">Gorde</button>
                <button @click="cancelarEdicion" class="btn-cancelar">Ezeztatu</button>
              </div>
            </div>
          </section>

          <section
            class="tarjeta estado-txandalari"
            :class="{ activo: usuarioEditar.solicitudTxandalari == 1 }"
          >
            <h3>🐍 LAKOBRAREN EGOERA</h3>

            <div v-if="usuarioEditar.solicitudTxandalari == 1" class="estado-activo">
              <div class="anillo-pulso"></div>
              <div class="texto-estado">
                <span class="estado-principal">TXANDALARI OFICIALA</span>
                <span class="estado-secundario">Eliteko kidea</span>
              </div>
            </div>

            <div v-else class="formulario-solicitud">
              <p class="titulo-formulario">Txandalaria izan nahi duzu?</p>
              <p class="descripcion-formulario">
                Egin bat klubarekin eta sartu abantaila esklusiboetan.
              </p>
              <button class="btn-txandalari" @click="abrirConfirmacion = true">
                {{ cargando ? 'Bidaltzen...' : 'MANDAR SOLICITUD' }}
              </button>
            </div>

            <div v-if="abrirConfirmacion" class="modal-overlay">
              <div class="modal-contenido">
                <h4>Eskaera berretsi</h4>
                <p>Ziur zaude Txandalari izan nahi duzula?</p>
                <div class="botones-modal">
                  <button @click="confirmarSolicitud" class="btn-guardar">Bai, Bidali</button>
                  <button @click="abrirConfirmacion = false" class="btn-cancelar">Ezeztatu</button>
                </div>
              </div>
            </div>
          </section>
        </aside>

        <main class="contenido">
          <section class="tarjeta eventos">
            <h3><i class="icono">📅</i> Nire Hurrengo Ekitaldiak</h3>

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
              <p>Oraindik ez duzu geraleku bakar batean ere izena eman.</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    usuario: { type: Object, required: true },
  },
  data() {
    return {
      cargando: false,
      modoEdicion: false,
      abrirConfirmacion: false,
      mensajeSolicitud: '',
      usuarioEditar: {}, 
      eventos: [
        { id: 1, titulo: 'KDD Nocturna LAKOBRA', dia: '15', mes: 'ABR', lugar: 'Parking Norte' },
        { id: 2, titulo: 'Ruta Montaña Sierra', dia: '22', mes: 'MAY', lugar: 'Punto Pack' },
      ],
    }
  },
  watch: {
    usuario: {
      immediate: true,
      deep: true,
      handler(nuevoUsuario) {
        if (nuevoUsuario && Object.keys(nuevoUsuario).length > 0) {
          this.usuarioEditar = { ...nuevoUsuario };
        }
      },
    },
  },
  methods: {
    cancelarEdicion() {
      this.usuarioEditar = { ...this.usuario };
      this.modoEdicion = false;
    },

    async guardarCambios() {
      this.cargando = true;
      try {
        this.$emit('actualizar-usuario', { ...this.usuarioEditar });
        this.modoEdicion = false;
      } catch (error) {
        console.error("Error al guardar:", error);
      } finally {
        this.cargando = false;
      }
    },

    async confirmarSolicitud() {
      this.abrirConfirmacion = false;
      this.cargando = true;
      try {
        const respuesta = await fetch('http://localhost/Backend/solictar_txandalari.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuario_id: this.usuario.id,
            mensaje: this.mensajeSolicitud,
          }),
        });
        const datos = await respuesta.json();
        if (datos.ok) {
          this.$emit('solicitud-enviada'); 
          this.mensajeSolicitud = '';
        } else {
          alert(datos.message || 'Errorea');
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        this.cargando = false;
      }
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
  --border-raduis: 16px;
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
  color: var(--color-claro);
  padding: 2px 10px;
  border-radius: var(--border-raduis);
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
  border-radius: var(--border-raduis);
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
  background: rgb(126, 126, 219);
  color: var(--color-secundario);
  padding: 8px 12px;
  border: none;
  border-radius: 16px;
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

/* BOTON TXANDALARI */
.btn-txandalari {
  position: relative;
  width: 100%;
  padding: 12px;
  background: rgb(125, 125, 236);
  color: rgb(2, 60, 87);
  border: none;
  border-radius: 16px;
  font-weight: 800;
  cursor: pointer;
  overflow: hidden;
}
.btn-txandalari:disabled {
  background: #ad8989;
  color: #723030;
  cursor: not-allowed;
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