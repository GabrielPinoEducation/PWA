// Referencias a los elementos del DOM
const btnDictar = document.getElementById('btn-dictar');
const btnGuardar = document.getElementById('btn-guardar');
const textoActual = document.getElementById('texto-actual');
const estado = document.getElementById('estado');
const listaNotas = document.getElementById('lista-notas');

let escuchando = false;

// 1. API: Speech Recognition (Reconocimiento de Voz)
// Usamos webkitSpeechRecognition para Safari/Chrome y SpeechRecognition para Firefox/otros.
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    estado.textContent = "Tu navegador no soporta el dictado por voz 😢";
    btnDictar.disabled = true;
} else {
    const reconocimiento = new SpeechRecognition();
    reconocimiento.lang = 'es-ES'; // Idioma de reconocimiento
    reconocimiento.interimResults = true; // Muestra resultados mientras se habla

    // Evento al presionar el botón de inicio/paro
    btnDictar.addEventListener('click', () => {
        if (escuchando) {
            reconocimiento.stop();
        } else {
            reconocimiento.start();
        }
    });

    // Eventos del reconocimiento de voz
    reconocimiento.onstart = () => {
        escuchando = true;
        btnDictar.textContent = "⏹️ Detener Dictado";
        btnDictar.style.backgroundColor = "#F44336"; // Rojo para indicar grabación
        estado.textContent = "Escuchando...";
    };

    reconocimiento.onresult = (evento) => {
        // Extraemos el texto transcrito del evento
        const transcripcion = Array.from(evento.results)
            .map(resultado => resultado[0].transcript)
            .join('');
        textoActual.value = transcripcion;
        btnGuardar.disabled = transcripcion.trim() === ""; // Habilita botón si hay texto
    };

    reconocimiento.onend = () => {
        escuchando = false;
        btnDictar.textContent = "🎤 Iniciar Dictado";
        btnDictar.style.backgroundColor = "var(--primary-color)";
        estado.textContent = "Dictado finalizado.";
    };
}

// 2. API: Web Storage (localStorage)
// Cargar notas al iniciar
let notas = JSON.parse(localStorage.getItem('notasVoz')) || [];
renderizarNotas();

btnGuardar.addEventListener('click', () => {
    const nuevaNota = textoActual.value;
    if (nuevaNota) {
        notas.push(nuevaNota);
        localStorage.setItem('notasVoz', JSON.stringify(notas)); // Guardar en el dispositivo
        textoActual.value = "";
        btnGuardar.disabled = true;
        renderizarNotas();
    }
});

function renderizarNotas() {
    listaNotas.innerHTML = "";
    notas.forEach((nota, index) => {
        const li = document.createElement('li');
        li.textContent = nota;
        
        // 3. API: Web Share (Compartir nativo)
        const btnCompartir = document.createElement('button');
        btnCompartir.textContent = "📤 Compartir";
        btnCompartir.className = "btn btn-share";
        
        btnCompartir.onclick = () => {
            // Verificamos si el navegador soporta compartir
            if (navigator.share) {
                navigator.share({
                    title: 'Nota de voz',
                    text: nota
                }).catch(err => console.error("Error al compartir", err));
            } else {
                alert("La API de compartir no está soportada en tu navegador actual.");
            }
        };

        li.appendChild(document.createElement('br'));
        li.appendChild(btnCompartir);
        listaNotas.appendChild(li);
    });
}