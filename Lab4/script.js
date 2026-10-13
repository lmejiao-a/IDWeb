let tareas = JSON.parse(localStorage.getItem("tareasUniversitarias")) || [];
let filtroActual = "todas";

const formulario = document.getElementById("formularioTarea");
const tituloInput = document.getElementById("titulo");
const cursoInput = document.getElementById("curso");
const fechaInput = document.getElementById("fechaEntrega");
const alertas = document.getElementById("alertas");
const listaTareas = document.getElementById("listaTareas");

const totalTareas = document.getElementById("totalTareas");
const totalPendientes = document.getElementById("totalPendientes");
const totalCompletadas = document.getElementById("totalCompletadas");

function obtenerFechaLocal() {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}

function configurarFechaMinima() {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);

    const anio = manana.getFullYear();
    const mes = String(manana.getMonth() + 1).padStart(2, "0");
    const dia = String(manana.getDate()).padStart(2, "0");

    fechaInput.min = `${anio}-${mes}-${dia}`;
}

function mostrarAlerta(mensaje, tipo = "error") {
    alertas.replaceChildren();

    const alerta = document.createElement("div");
    alerta.className = `alerta alerta-${tipo}`;
    alerta.textContent = mensaje;
    alerta.setAttribute("role", "alert");

    alertas.appendChild(alerta);
}

function limpiarAlerta() {
    alertas.replaceChildren();
}

function guardarTareas() {
    localStorage.setItem("tareasUniversitarias", JSON.stringify(tareas));
}

function actualizarEstadisticas() {
    totalTareas.textContent = tareas.length;

    totalCompletadas.textContent = tareas.reduce(
        (contador, tarea) => contador + (tarea.completada ? 1 : 0),
        0
    );

    totalPendientes.textContent = tareas.reduce(
        (contador, tarea) => contador + (!tarea.completada ? 1 : 0),
        0
    );
}

function crearElementoTarea(tarea) {
    const tarjeta = document.createElement("article");
    tarjeta.className = tarea.completada
        ? "tarea completada"
        : "tarea";

    const informacion = document.createElement("div");
    informacion.className = "tarea-info";

    const titulo = document.createElement("h3");
    titulo.textContent = tarea.titulo;

    const curso = document.createElement("p");
    curso.textContent = `Curso: ${tarea.curso}`;

    const fecha = document.createElement("p");
    fecha.textContent = `Fecha de entrega: ${tarea.fechaEntrega}`;

    const estado = document.createElement("p");
    estado.textContent = tarea.completada
        ? "Estado: Completada"
        : "Estado: Pendiente";

    informacion.append(titulo, curso, fecha, estado);

    const acciones = document.createElement("div");
    acciones.className = "tarea-acciones";

    const botonEstado = document.createElement("button");
    botonEstado.type = "button";
    botonEstado.className = "boton boton-estado";
    botonEstado.textContent = tarea.completada
        ? "Marcar pendiente"
        : "Completar";

    botonEstado.addEventListener("click", () => {
        const tareaEncontrada = tareas.find(
            elemento => elemento.id === tarea.id
        );

        if (tareaEncontrada) {
            tareaEncontrada.completada = !tareaEncontrada.completada;
            guardarTareas();
            renderizarTareas();
        }
    });

    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.className = "boton boton-eliminar";
    botonEliminar.textContent = "Eliminar";

    botonEliminar.addEventListener("click", () => {
        tareas = tareas.filter(elemento => elemento.id !== tarea.id);
        guardarTareas();
        renderizarTareas();
        mostrarAlerta("Tarea eliminada correctamente.", "exito");
    });

    acciones.append(botonEstado, botonEliminar);
    tarjeta.append(informacion, acciones);

    return tarjeta;
}

function renderizarTareas() {
    listaTareas.replaceChildren();

    const tareasFiltradas = tareas.filter(tarea => {
        if (filtroActual === "pendientes") {
            return !tarea.completada;
        }

        if (filtroActual === "completadas") {
            return tarea.completada;
        }

        return true;
    });

    if (tareasFiltradas.length === 0) {
        const mensaje = document.createElement("p");
        mensaje.className = "vacio";
        mensaje.textContent = filtroActual === "pendientes"
            ? "No tienes tareas pendientes."
            : filtroActual === "completadas"
                ? "Todavía no tienes tareas completadas."
                : "Todavía no has registrado tareas.";

        listaTareas.appendChild(mensaje);
    } else {
        tareasFiltradas.forEach(tarea => {
            listaTareas.appendChild(crearElementoTarea(tarea));
        });
    }

    actualizarEstadisticas();

    document.querySelectorAll(".filtro").forEach(boton => {
        boton.classList.toggle(
            "activo",
            boton.dataset.filtro === filtroActual
        );
    });
}

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const titulo = tituloInput.value.trim();
    const curso = cursoInput.value.trim();
    const fechaEntrega = fechaInput.value;

    if (!titulo || !curso || !fechaEntrega) {
        mostrarAlerta("Todos los campos son obligatorios.");
        return;
    }

    if (fechaEntrega <= obtenerFechaLocal()) {
        mostrarAlerta(
            "La fecha de entrega debe ser posterior a la fecha actual."
        );
        return;
    }

    const nuevaTarea = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        titulo: titulo,
        curso: curso,
        fechaEntrega: fechaEntrega,
        completada: false
    };

    tareas.push(nuevaTarea);

    guardarTareas();
    formulario.reset();
    configurarFechaMinima();
    filtroActual = "todas";
    renderizarTareas();

    mostrarAlerta("Tarea registrada correctamente.", "exito");
});

document.querySelectorAll(".filtro").forEach(boton => {
    boton.addEventListener("click", () => {
        filtroActual = boton.dataset.filtro;
        limpiarAlerta();
        renderizarTareas();
    });
});

configurarFechaMinima();
renderizarTareas();
