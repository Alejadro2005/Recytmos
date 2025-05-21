const API_URL = 'http://127.0.0.1:5000/api';

let datosCuriosos = [];
let ranking = [];
let indiceDato = 0;
let noticias = [];
let indiceSlide = 0;
let slideInterval;
let inactivityTimer;

// Mensajes de concientización
const mensajesConciencia = [
    "Reciclar hoy es salvar el planeta mañana.",
    "Cada residuo cuenta para un mundo mejor.",
    "¡Gracias por cuidar el medio ambiente!",
    "Separar residuos es un acto de amor por la Tierra.",
    "Tus acciones verdes inspiran a otros.",
    "Reciclar es dar una segunda vida a los materiales.",
    "¡Juntos hacemos la diferencia!"
];

// --- LOGIN ---
const loginForm = document.getElementById('login-form');
const loginContainer = document.getElementById('login-container');
const slideContainer = document.getElementById('slide-container');
const mainStudent = document.getElementById('main-student');
const loginError = document.getElementById('login-error');

let bonus = 0.0;
let bonificaciones = [
    // Ejemplo inicial
    { estudiante: '1001', materia: 'Matemáticas', bonificacion: 0.5, fecha: '2025-06-01 10:30' },
    { estudiante: '1002', materia: 'Ciencias', bonificacion: 0.3, fecha: '2025-06-01 11:00' }
];
let documentoEstudiante = null;

// --- NUEVA LÓGICA BARRA SUPERIOR ESTUDIANTE ---
let logroInterval = null;

function mostrarBarraEstudiante(documento) {
    // Mostrar solo el texto Estudiante y el documento
    const docSpan = document.getElementById('student-doc');
    if (docSpan) docSpan.innerHTML = `<span>Estudiante:</span> <b>${documento}</b>`;
    // Consultar logros SOLO de ese estudiante
    fetch(`${API_URL}/logros_estudiante/${documento}`)
        .then(res => res.json())
        .then(logros => {
            if (logros.length > 0) {
                const logro = logros[0]; // El más reciente
                mostrarLogroAnimado(logro.descripcion);
            } else {
                ocultarLogroAnimado();
            }
        })
        .catch(() => ocultarLogroAnimado());
}

function mostrarLogroAnimado(descripcion) {
    const logroSpan = document.getElementById('student-achievement');
    if (!logroSpan) return;
    logroSpan.textContent = descripcion;
    logroSpan.style.display = 'inline-block';
    logroSpan.style.opacity = '1';
    if (logroInterval) clearInterval(logroInterval);
    logroInterval = setInterval(() => {
        logroSpan.style.transition = 'opacity 1s';
        logroSpan.style.opacity = '0';
        setTimeout(() => {
            logroSpan.style.opacity = '1';
        }, 1000);
    }, 5000);
}
function ocultarLogroAnimado() {
    const logroSpan = document.getElementById('student-achievement');
    if (logroSpan) {
        logroSpan.style.display = 'none';
        logroSpan.textContent = '';
    }
    if (logroInterval) clearInterval(logroInterval);
    logroInterval = null;
}

if (loginForm) {
    loginForm.onsubmit = async function(e) {
        e.preventDefault();
        const documento = document.getElementById('documento').value;
        const password = document.getElementById('password').value;
        loginError.textContent = '';
        // Credenciales fijas para admin
        if (documento === 'admin' && password === 'admin123') {
            loginContainer.style.display = 'none';
            document.getElementById('main-admin').style.display = 'flex';
            document.getElementById('main-student').style.display = 'none';
            document.getElementById('admin-name').textContent = 'Administrador';
            return;
        }
        try {
            const res = await fetch(`${API_URL}/login_estudiante`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documento, password })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                loginContainer.style.display = 'none';
                mainStudent.style.display = 'flex';
                document.getElementById('main-admin').style.display = 'none';
                cargarMaterias();
                actualizarBonus();
                documentoEstudiante = documento;
                mostrarBarraEstudiante(documento);
            } else {
                loginError.textContent = data.message || 'Documento o contraseña incorrectos';
            }
        } catch (err) {
            loginError.textContent = 'Error de conexión con el servidor';
        }
    }
}

// --- Lógica pantalla principal estudiante ---
function actualizarBonus() {
    document.getElementById('bonus-counter').textContent = bonus.toFixed(1);
}

async function cargarMaterias() {
    const lista = document.getElementById('materias-list');
    lista.innerHTML = '';
    try {
        const res = await fetch(`${API_URL}/materias`);
        const materias = await res.json();
    materias.forEach(m => {
        const li = document.createElement('li');
            li.textContent = m.nombre;
            li.onclick = () => aplicarBonificacion(m.nombre, li);
        lista.appendChild(li);
    });
    } catch {
        lista.innerHTML = '<li>Error al cargar materias</li>';
    }
}

// Menú lateral
const menuIcon = document.getElementById('menu-icon');
const sideMenu = document.getElementById('side-menu');
let menuAbierto = false;
if (menuIcon) {
    menuIcon.onclick = () => {
        menuAbierto = !menuAbierto;
        sideMenu.classList.toggle('open', menuAbierto);
    };
}

const closeMenuBtn = document.getElementById('close-menu-btn');
if (closeMenuBtn) {
    closeMenuBtn.onclick = () => {
        sideMenu.classList.remove('open');
        menuAbierto = false;
    };
}

// Depositar residuo
const residueCards = document.querySelectorAll('.residue-card');
residueCards.forEach(card => {
    card.onclick = () => depositarResiduo(card);
});

function mensajeConcientizacionAleatorio(tipo) {
    if (tipo === 'RECICLABLES') {
        return "¡Recuerda separar plásticos, vidrios, metales, papel y cartón!";
    } else if (tipo === 'ORGANICOS') {
        return "Los restos de comida y desechos agrícolas van aquí. ¡Haz compost!";
    } else if (tipo === 'NOAPROVECHABLES') {
        return "Servilletas, papel higiénico y residuos contaminados van aquí. ¡Reduce su uso!";
    }
    return "¡Gracias por cuidar el medio ambiente!";
}

function depositarResiduo(card) {
    residueCards.forEach(c => c.classList.add('disabled'));
    card.classList.add('selected');
    let tipoResiduo = card.dataset.type;
    let nombreResiduo = '';
    if (tipoResiduo === 'RECICLABLES') nombreResiduo = 'Aprovechables';
    else if (tipoResiduo === 'ORGANICOS') nombreResiduo = 'Orgánicos';
    else if (tipoResiduo === 'NOAPROVECHABLES') nombreResiduo = 'No aprovechables';
    mostrarOverlay(`Deposite el residuo <br><b>${nombreResiduo}</b> <div class="spinner"></div>`);
    setTimeout(async () => {
        // Enviar al backend (simulado)
        if (documentoEstudiante) {
            await fetch(`${API_URL}/depositar_residuo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documento: documentoEstudiante,
                    tipo_residuo: tipoResiduo,
                    fecha: new Date().toISOString()
                })
            });
        }
        // Mensaje de concientización
        mostrarOverlay(`<span class="check">✔</span><div style='margin-top:12px;font-size:1em;'>${mensajeConcientizacionAleatorio(tipoResiduo)}</div>`);
        bonus += 0.1;
        actualizarBonus();
        setTimeout(() => {
            ocultarOverlay();
            residueCards.forEach(c => c.classList.remove('disabled', 'selected'));
        }, 1800);
    }, 1500);
}

// Overlay para animaciones y mensajes
const overlay = document.getElementById('overlay');
const overlayContent = document.getElementById('overlay-content');
function mostrarOverlay(html) {
    overlayContent.innerHTML = html;
    overlay.style.display = 'flex';
}
function ocultarOverlay() {
    overlay.style.display = 'none';
}

// Aplicar bonificación a materia
function aplicarBonificacion(materia, li) {
    if (bonus <= 0) return;
    // Enviar al backend (simulado)
    if (documentoEstudiante) {
        fetch(`${API_URL}/aplicar_bonificacion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                documento: documentoEstudiante,
                materia: materia,
                bonificacion: bonus,
                fecha: new Date().toISOString()
            })
        });
        // Guardar registro local para el informe admin
        bonificaciones.push({
            estudiante: documentoEstudiante,
            materia: materia,
            bonificacion: bonus,
            fecha: new Date().toLocaleString()
        });
    }
    mostrarOverlay(`Bonificación aplicada a <b>${materia}</b> <span class="check">✔</span>`);
    bonus = 0.0;
    actualizarBonus();
    setTimeout(() => {
        ocultarOverlay();
        sideMenu.classList.remove('open');
        menuAbierto = false;
    }, 1200);
}

// --- SLIDE ---
async function cargarNoticias() {
    const res = await fetch(`${API_URL}/noticias`);
    noticias = await res.json();
}

async function cargarDatosCuriosos() {
    const res = await fetch(`${API_URL}/datos_curiosos`);
    datosCuriosos = await res.json();
}

function mostrarSlide() {
    const slideContent = document.getElementById('slide-content');
    if (noticias.length === 0 && datosCuriosos.length === 0) {
        slideContent.textContent = 'Cargando...';
        return;
    }
    const esNoticia = Math.random() < 0.5;
    if (esNoticia && noticias.length > 0) {
        const noticia = noticias[Math.floor(Math.random() * noticias.length)];
        slideContent.innerHTML = `<h3>Noticia:</h3><p>${noticia.titulo}: ${noticia.contenido}</p>`;
    } else if (datosCuriosos.length > 0) {
        const dato = datosCuriosos[Math.floor(Math.random() * datosCuriosos.length)];
        slideContent.innerHTML = `<h3>Dato Curioso:</h3><p>${dato.texto}</p>`;
    } else {
        slideContent.textContent = 'No hay contenido disponible.';
    }
}

function iniciarSlide() {
    cargarNoticias();
    cargarDatosCuriosos();
    mostrarSlide();
    slideInterval = setInterval(mostrarSlide, 5000);
}

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        // Solo mostrar el slide si el login está visible y no hay sesión activa
        const loginVisible = loginContainer && (loginContainer.style.display === '' || loginContainer.style.display === 'flex' || loginContainer.style.display === 'block');
        const mainStudentVisible = mainStudent && mainStudent.style.display === 'flex';
        const mainAdminVisible = document.getElementById('main-admin') && document.getElementById('main-admin').style.display === 'flex';
        if (loginVisible && !mainStudentVisible && !mainAdminVisible) {
            slideContainer.style.display = 'flex';
            loginContainer.style.display = 'none';
            iniciarSlide();
        }
    }, 10000);
}

// Evento para el botón de ingresar en el slide
document.getElementById('slide-ingresar').onclick = () => {
    document.getElementById('slide-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'flex';
    clearInterval(slideInterval);
};

// Reiniciar temporizador al detectar interacción
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keydown', resetInactivityTimer);
document.addEventListener('touchstart', resetInactivityTimer);

// Iniciar temporizador al cargar la página
resetInactivityTimer();

// --- GESTIÓN DE MATERIAS (ADMIN REAL) ---
const btnAsignarMaterias = document.getElementById('btn-asignar-materias');
if (btnAsignarMaterias) {
    btnAsignarMaterias.onclick = () => {
        cargarMateriasAdmin();
        document.getElementById('modal-materias').style.display = 'flex';
    };
}
const cerrarModalMaterias = document.getElementById('cerrar-modal-materias');
if (cerrarModalMaterias) {
    cerrarModalMaterias.onclick = () => {
        document.getElementById('modal-materias').style.display = 'none';
    };
}

async function cargarMateriasAdmin() {
    const ul = document.getElementById('lista-materias-admin');
    ul.innerHTML = '<li>Cargando...</li>';
    try {
        const res = await fetch(`${API_URL}/materias`);
        const materias = await res.json();
    ul.innerHTML = '';
        materias.forEach(m => {
        const li = document.createElement('li');
            li.textContent = m.nombre;
        const btnDel = document.createElement('button');
        btnDel.textContent = 'Eliminar';
            btnDel.onclick = async () => {
                if (confirm('¿Eliminar materia?')) {
                    await fetch(`${API_URL}/materias/${m.id}`, { method: 'DELETE' });
                    cargarMateriasAdmin();
                }
        };
        li.appendChild(btnDel);
        ul.appendChild(li);
    });
    } catch (e) {
        ul.innerHTML = '<li>Error al cargar materias</li>';
    }
}

const btnAgregarMateria = document.getElementById('agregar-materia');
if (btnAgregarMateria) {
    btnAgregarMateria.onclick = async () => {
        const input = document.getElementById('nueva-materia');
        const val = input.value.trim();
        if (val) {
            const res = await fetch(`${API_URL}/materias`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: val })
            });
            const data = await res.json();
            if (data.success) {
            input.value = '';
                cargarMateriasAdmin();
            } else {
                alert(data.message || 'Error al agregar materia');
            }
        }
    };
}

// --- REGISTRO Y REPORTE DE BONIFICACIONES ---
// Abrir modal de bonificaciones
const btnInformes = document.getElementById('btn-informes');
if (btnInformes) {
    btnInformes.onclick = () => {
        renderTablaBonificaciones();
        document.getElementById('modal-bonificaciones').style.display = 'flex';
    };
}
// Cerrar modal bonificaciones
const cerrarModalBonificaciones = document.getElementById('cerrar-modal-bonificaciones');
if (cerrarModalBonificaciones) {
    cerrarModalBonificaciones.onclick = () => {
        document.getElementById('modal-bonificaciones').style.display = 'none';
    };
}
// Renderizar tabla de bonificaciones
function renderTablaBonificaciones() {
    const tbody = document.querySelector('#tabla-bonificaciones tbody');
    tbody.innerHTML = '';
    bonificaciones.forEach(b => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${b.estudiante}</td><td>${b.materia}</td><td>${b.bonificacion}</td><td>${b.fecha}</td>`;
        tbody.appendChild(tr);
    });
}
// Descargar CSV
const btnDescargarInforme = document.getElementById('descargar-informe');
if (btnDescargarInforme) {
    btnDescargarInforme.onclick = () => {
        let csv = 'Estudiante,Materia,Bonificación,Fecha\n';
        bonificaciones.forEach(b => {
            csv += `${b.estudiante},${b.materia},${b.bonificacion},${b.fecha}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'informe_bonificaciones.csv';
        a.click();
        URL.revokeObjectURL(url);
    };
}

// --- MODALES DE LOS DEMÁS BOTONES ADMIN ---
const btnInfoAmbiental = document.getElementById('btn-info-ambiental');
if (btnInfoAmbiental) btnInfoAmbiental.onclick = () => {
    document.getElementById('modal-info-ambiental').style.display = 'flex';
    setTimeout(dibujarGraficoResiduos, 100);
};
document.getElementById('volver-info-ambiental').onclick = () => {
    document.getElementById('modal-info-ambiental').style.display = 'none';
};

const btnLogros = document.getElementById('btn-logros');
if (btnLogros) btnLogros.onclick = () => {
    document.getElementById('modal-logros').style.display = 'flex';
};
document.getElementById('volver-logros').onclick = () => {
    document.getElementById('modal-logros').style.display = 'none';
};

const btnNoticias = document.getElementById('btn-noticias');
if (btnNoticias) btnNoticias.onclick = () => {
    document.getElementById('modal-noticias').style.display = 'flex';
};
document.getElementById('volver-noticias').onclick = () => {
    document.getElementById('modal-noticias').style.display = 'none';
};

const btnTop = document.getElementById('btn-top');
if (btnTop) btnTop.onclick = () => {
    document.getElementById('modal-top').style.display = 'flex';
    setTimeout(dibujarGraficoTop, 100);
};
document.getElementById('volver-top').onclick = () => {
    document.getElementById('modal-top').style.display = 'none';
};

const btnReportes = document.getElementById('btn-reportes');
if (btnReportes) btnReportes.onclick = () => {
    document.getElementById('modal-reportes').style.display = 'flex';
};
document.getElementById('volver-reportes').onclick = () => {
    document.getElementById('modal-reportes').style.display = 'none';
};

// --- GRÁFICOS DE EJEMPLO EN MODALES ---
function dibujarGraficoResiduos() {
    const canvas = document.getElementById('grafico-residuos');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // Datos de ejemplo
    const datos = [120, 80, 60, 150];
    const colores = ['#c7e6ff','#ffe066','#c7ffd6','#ffe7a0'];
    const etiquetas = ['Papel','Plástico','Vidrio','Orgánico'];
    const max = Math.max(...datos);
    for(let i=0;i<datos.length;i++){
        ctx.fillStyle = colores[i];
        ctx.fillRect(40+i*65, canvas.height-30-datos[i]/max*120, 40, datos[i]/max*120);
        ctx.fillStyle = '#222';
        ctx.fillText(etiquetas[i], 40+i*65, canvas.height-10);
        ctx.fillText(datos[i]+'kg', 40+i*65, canvas.height-35-datos[i]/max*120);
    }
}
function dibujarGraficoTop() {
    const canvas = document.getElementById('grafico-top');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // Datos de ejemplo
    const datos = [100,80,60,40,30];
    const nombres = ['Ana','Luis','María','Pedro','Lucía'];
    const colores = ['#4caf50','#388e3c','#b2e6b2','#ffe066','#c7e6ff'];
    const max = Math.max(...datos);
    for(let i=0;i<datos.length;i++){
        ctx.fillStyle = colores[i];
        ctx.fillRect(40+i*50, canvas.height-30-datos[i]/max*120, 32, datos[i]/max*120);
        ctx.fillStyle = '#222';
        ctx.fillText(nombres[i], 40+i*50, canvas.height-10);
        ctx.fillText(datos[i]+'kg', 40+i*50, canvas.height-35-datos[i]/max*120);
    }
}
// --- DESCARGA DE REPORTE DE EJEMPLO ---
const btnDescargarReporteEjemplo = document.getElementById('descargar-reporte-ejemplo');
if (btnDescargarReporteEjemplo) {
    btnDescargarReporteEjemplo.onclick = () => {
        let csv = 'Tipo,Fecha,Responsable\nSemanal,2025-06-01,Admin\nMensual,2025-05-31,Admin\n';
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte_ejemplo.csv';
        a.click();
        URL.revokeObjectURL(url);
    };
}

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.onclick = () => {
        mainStudent.style.display = 'none';
        loginContainer.style.display = 'flex';
        document.getElementById('bonus-counter').textContent = '0.0';
        bonus = 0.0;
        documentoEstudiante = null;
        document.getElementById('documento').value = '';
        document.getElementById('password').value = '';
        loginError.textContent = '';
        // Limpiar barra superior
        const docSpan = document.getElementById('student-doc');
        if (docSpan) docSpan.textContent = '';
        ocultarLogroAnimado();
    };
}

const logoutBtnAdmin = document.getElementById('logout-btn-admin');
if (logoutBtnAdmin) {
    logoutBtnAdmin.onclick = () => {
        document.getElementById('main-admin').style.display = 'none';
        loginContainer.style.display = 'flex';
        document.getElementById('admin-name').textContent = '';
        document.getElementById('documento').value = '';
        document.getElementById('password').value = '';
        // Limpiar barra superior por si acaso
        const docSpan = document.getElementById('student-doc');
        if (docSpan) docSpan.textContent = '';
        ocultarLogroAnimado();
    };
}

// --- REGISTRO Y OLVIDÉ CONTRASEÑA ---
const registroLink = document.getElementById('registro-link');
const olvideLink = document.getElementById('olvide-link');
const modalRegistro = document.getElementById('modal-registro');
const modalOlvide = document.getElementById('modal-olvide');
const cerrarModalRegistro = document.getElementById('cerrar-modal-registro');
const cerrarModalOlvide = document.getElementById('cerrar-modal-olvide');

if (registroLink) registroLink.onclick = () => { modalRegistro.style.display = 'flex'; };
if (olvideLink) olvideLink.onclick = () => { modalOlvide.style.display = 'flex'; };
if (cerrarModalRegistro) cerrarModalRegistro.onclick = () => { modalRegistro.style.display = 'none'; document.getElementById('registro-error').textContent = ''; };
if (cerrarModalOlvide) cerrarModalOlvide.onclick = () => { modalOlvide.style.display = 'none'; document.getElementById('olvide-error').textContent = ''; document.getElementById('olvide-nueva-pass').textContent = ''; };

// Registro de usuario
const formRegistro = document.getElementById('form-registro');
if (formRegistro) {
  formRegistro.onsubmit = async function(e) {
    e.preventDefault();
    const documento = document.getElementById('registro-documento').value;
    const password = document.getElementById('registro-password').value;
    const errorDiv = document.getElementById('registro-error');
    errorDiv.textContent = '';
    try {
      const res = await fetch(`${API_URL}/registrar_usuario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documento, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        modalRegistro.style.display = 'none';
        alert('Usuario registrado correctamente. Ahora puedes iniciar sesión.');
        formRegistro.reset();
      } else {
        errorDiv.textContent = data.message || 'Error al registrar usuario';
      }
    } catch (err) {
      errorDiv.textContent = 'Error de conexión con el servidor';
    }
  }
}

// Recuperar contraseña
const formOlvide = document.getElementById('form-olvide');
if (formOlvide) {
  formOlvide.onsubmit = async function(e) {
    e.preventDefault();
    const documento = document.getElementById('olvide-documento').value;
    const errorDiv = document.getElementById('olvide-error');
    const nuevaPassDiv = document.getElementById('olvide-nueva-pass');
    errorDiv.textContent = '';
    nuevaPassDiv.textContent = '';
    try {
      const res = await fetch(`${API_URL}/recuperar_password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documento })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        nuevaPassDiv.textContent = `Tu nueva contraseña es: ${data.nueva_password}`;
      } else {
        errorDiv.textContent = data.message || 'No se pudo recuperar la contraseña';
      }
    } catch (err) {
      errorDiv.textContent = 'Error de conexión con el servidor';
    }
  }
}

// --- GESTIÓN DE DATOS CURIOSOS ---
const btnGestionDatosCuriosos = document.getElementById('btn-gestion-datos-curiosos');
if (btnGestionDatosCuriosos) btnGestionDatosCuriosos.onclick = () => { cargarDatosCuriososAdmin(); document.getElementById('modal-datos-curiosos').style.display = 'flex'; };
document.getElementById('cerrar-modal-datos-curiosos').onclick = () => { document.getElementById('modal-datos-curiosos').style.display = 'none'; };
async function cargarDatosCuriososAdmin() {
  const ul = document.getElementById('lista-datos-curiosos');
  ul.innerHTML = '<li>Cargando...</li>';
  try {
    const res = await fetch(`${API_URL}/datos_curiosos_db`);
    const datos = await res.json();
    ul.innerHTML = '';
    datos.forEach(d => {
      const li = document.createElement('li');
      li.textContent = d.texto;
      const btnDel = document.createElement('button');
      btnDel.textContent = 'Eliminar';
      btnDel.onclick = async () => { await fetch(`${API_URL}/datos_curiosos_db/${d.id}`, { method: 'DELETE' }); cargarDatosCuriososAdmin(); };
      li.appendChild(btnDel);
      ul.appendChild(li);
    });
  } catch { ul.innerHTML = '<li>Error al cargar</li>'; }
}
document.getElementById('agregar-dato-curioso').onclick = async () => {
  const input = document.getElementById('nuevo-dato-curioso');
  const val = input.value.trim();
  if (val) {
    const res = await fetch(`${API_URL}/datos_curiosos_db`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ texto: val }) });
    const data = await res.json();
    if (data.success) { input.value = ''; cargarDatosCuriososAdmin(); } else { alert(data.message || 'Error'); }
  }
};
// --- GESTIÓN DE LOGROS ---
const btnGestionLogros = document.getElementById('btn-gestion-logros');
if (btnGestionLogros) btnGestionLogros.onclick = () => { cargarLogrosAdmin(); document.getElementById('modal-logros-admin').style.display = 'flex'; };
document.getElementById('cerrar-modal-logros-admin').onclick = () => { document.getElementById('modal-logros-admin').style.display = 'none'; };
async function cargarLogrosAdmin() {
  const ul = document.getElementById('lista-logros-admin');
  ul.innerHTML = '<li>Cargando...</li>';
  try {
    const res = await fetch(`${API_URL}/logros`);
    const logros = await res.json();
    ul.innerHTML = '';
    logros.forEach(l => {
      const li = document.createElement('li');
      li.textContent = `${l.estudiante_documento}: ${l.descripcion} ${l.medalla || ''}`;
      const btnDel = document.createElement('button');
      btnDel.textContent = 'Eliminar';
      btnDel.onclick = async () => { await fetch(`${API_URL}/logros/${l.id}`, { method: 'DELETE' }); cargarLogrosAdmin(); };
      li.appendChild(btnDel);
      ul.appendChild(li);
    });
  } catch { ul.innerHTML = '<li>Error al cargar</li>'; }
}

// Evento para agregar logro desde el modal de admin
document.getElementById('agregar-logro').onclick = async () => {
    const estudiante = document.getElementById('logro-estudiante').value.trim();
    const descripcion = document.getElementById('logro-desc').value.trim();
    const medalla = document.getElementById('logro-medalla').value.trim();
    if (!estudiante || !descripcion) {
        alert('Debes ingresar el documento del estudiante y la descripción.');
        return;
    }
    const res = await fetch(`${API_URL}/logros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            estudiante_documento: estudiante,
            descripcion: descripcion,
            medalla: medalla
        })
    });
    const data = await res.json();
    if (data.success) {
        document.getElementById('logro-estudiante').value = '';
        document.getElementById('logro-desc').value = '';
        document.getElementById('logro-medalla').value = '';
        cargarLogrosAdmin();
    } else {
        alert(data.message || 'Error al agregar logro');
    }
};