// Se define una clase Paciente para crear objetos de pacientes

class Paciente {
    constructor(nombre, apellido, documento, email, id) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.documento = documento;
        this.email = email;
        this.id = id;
        this.horaIngreso = luxon.DateTime.local(); // Hora de ingreso como objeto Date en uso horario local
    }
}

// Funcion para general un ID aleatorio para las Historias Clinicas Unicas
    function generarID() {
        return Math.floor(10000 + Math.random() * 90000);
    }

// Funcion para calcular el tiempo de espera desde el ingreso hasta ser atendido
function calcularTiempoTranscurrido(horaIngreso, horaActual) {
    const tiempoTranscurridoMs = horaActual - horaIngreso;
    const segundos = Math.floor(tiempoTranscurridoMs / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    
    if (dias > 0) {
        return `${dias} días`;
    } else if (horas > 0) {
        return `${horas} horas`;
    } else if (minutos > 0) {
        return `${minutos} minutos`;
    } else {
        return `${segundos} segundos`;
    }
}

// Reemplaza el uso del objeto Date con la clase DateTime de Luxon
function formatTimeInLocalTimezone(hora) {
    if (hora instanceof luxon.DateTime) {
        const formattedTime = hora.toLocal().toLocaleString(luxon.DateTime.DATETIME_MED);
        return formattedTime;
    } else {
        return "Fecha no válida";
    }
}
        
// Capturar evento submit del formulario
document.getElementById("pacienteForm").addEventListener("submit", function(event) {
event.preventDefault();
        
    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const documento = document.getElementById("documento").value;
    const email = document.getElementById("email").value;
    const id = generarID();

// Crear nuevo Paciente
const paciente = new Paciente(nombre, apellido, documento, email, id);
        
// comprobar en el array PACIENTES en LS , si no exisrte crearlo
let pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];

// Guardar paciente en el array PACIENTES
pacientes.push(paciente);

// Guardar en el array PACIENTES en LS
localStorage.setItem("pacientes", JSON.stringify(pacientes));

// Resetar formulario
document.getElementById("pacienteForm").reset();

// Ejecutar funcion
actualizarListaPacientes();

Toastify({
    text: "Se ha agregado un nuevo paciente!",
    duration: 4000,
    close: true,
    gravity: "bottom", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
    background: "linear-gradient(to right, #0B2161, #0B2161)",
        },
    }).showToast();
});
        
// Actualizar la lista de pacientes
        function actualizarListaPacientes() {
            const listaPacientes = document.getElementById("listaPacientes");
            listaPacientes.innerHTML = "";
            const pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];

            pacientes.forEach(function(paciente) {
                const li = document.createElement("li");
                li.className = "list-group-item";
                const horaIngreso = luxon.DateTime.fromISO(paciente.horaIngreso);
                const horaActual = luxon.DateTime.local();
                const tiempoTranscurrido = calcularTiempoTranscurrido(horaIngreso, horaActual);
                const horaIngresoFormateada = formatTimeInLocalTimezone(horaIngreso);
        
// Agrega el botón de "Atender Paciente"
                li.innerHTML = `
                <div class="card">
                    <div class="card-body col-9">
                        <h4 class="card-title">HC${paciente.id}</h4>
                        <h3 class="card-title">${paciente.nombre} ${paciente.apellido}</h3>
                        <p class="card-text">DNI: ${paciente.documento}</p>
                        <p class="card-text">Email: ${paciente.email}</p>
                        <p class="card-text">Hora de Ingreso: ${horaIngresoFormateada}</p>
                        <p class="card-text">Tiempo de espera: ${tiempoTranscurrido}</p>
                        <button class="btn card-link btn-danger btn-sm float-right" onclick="eliminarPaciente(${paciente.id})">Eliminar</button>
                        <button class="btn card-link btn-success btn-sm float-right" onclick="atenderPaciente(${paciente.id})">Atender</button>
                        </div>
                </div>`;
                listaPacientes.appendChild(li);
            });
        
        }
        
document.getElementById("btnAgregar").addEventListener("click", actualizarListaPacientes);
        
// Define un array para almacenar pacientes que han sido atendidos
    let pacientesAtendidos = JSON.parse(localStorage.getItem("pacientesAtendidos")) || [];

// Función para atender a un paciente
        function atenderPaciente(id) {
            let pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];
            const horaAtencion = luxon.DateTime.local(); // Obtiene la hora actual como la hora de atención
            
// Encuentra al paciente con el ID dado en la sala de espera
            const paciente = pacientes.find(p => p.id === id);
            
            if (paciente) {
// Elimina al paciente de la sala de espera
            pacientes = pacientes.filter(p => p.id !== id);
// Agregar la hora de atención al objeto del paciente
        paciente.horaAtencion = horaAtencion.toISO(); // Almacénala como una cadena ISO

// Agrega al paciente al array "pacientesAtendidos"
            pacientesAtendidos.push(paciente);
            
// Actualiza el almacenamiento local para ambos arrays
            localStorage.setItem("pacientes", JSON.stringify(pacientes));
            localStorage.setItem("pacientesAtendidos", JSON.stringify(pacientesAtendidos));
            
// Actualiza las listas de pacientes
            actualizarListaPacientes();
            actualizarListaPacientesAtendidos();
            
            Toastify({
                text: "El paciente ha sido atendido y movido a la lista de pacientes atendidos.",
                duration: 4000,
                close: true,
                gravity: "bottom",
                position: "right",
                style: {
                background: "linear-gradient(to right, #0B2161, #0B2161)",
                },
            }).showToast();
            }
        }
        
// Función para actualizar la lista de pacientes atendidos
function actualizarListaPacientesAtendidos() {
    const listaPacientesAtendidos = document.getElementById("listaPacientesAtendidos");
    listaPacientesAtendidos.innerHTML = "";

    pacientesAtendidos.forEach(function (paciente) {
        const li = document.createElement("li");
        li.className = "list-group-item";

// Formatea la hora de ingreso y la hora de atención usando formatTimeInLocalTimezone
        const horaIngresoFormateada = formatTimeInLocalTimezone(luxon.DateTime.fromISO(paciente.horaIngreso));
        const horaAtencionFormateada = formatTimeInLocalTimezone(luxon.DateTime.fromISO(paciente.horaAtencion));

        li.innerHTML = `
            <div class="card">
                <div class="card-body col-9">
                    <h4 class="card-title">HC${paciente.id}</h4>
                    <h3 class="card-title">${paciente.nombre} ${paciente.apellido}</h3>
                    <p class="card-text">DNI: ${paciente.documento}</p>
                    <p class="card-text">Email: ${paciente.email}</p>
                    <p class="card-text">Hora de Ingreso: ${horaIngresoFormateada}</p>
                    <p class="card-text">Hora de Atención: ${horaAtencionFormateada}</p>
                </div>
            </div>`;

        listaPacientesAtendidos.appendChild(li);
    });
}

// Funcion aliminar paciente
        function eliminarPaciente(id) {
            let pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];
            pacientes = pacientes.filter(paciente => paciente.id !== id);
            localStorage.setItem("pacientes", JSON.stringify(pacientes));
            actualizarListaPacientes();
        
            Toastify({
                text: "!El paciente ha sido eliminado!",
                duration: 4000,
                close: true,
                gravity: "bottom", // `top` or `bottom`
                position: "right", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                background: "red",
                },
            }).showToast();
        
        }



actualizarListaPacientes();
actualizarListaPacientesAtendidos();
