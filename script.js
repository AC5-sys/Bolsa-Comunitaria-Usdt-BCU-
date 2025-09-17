document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================================
    // *** SECCIÓN DE CONFIGURACIÓN DE DATOS - SOLO EDITAR AQUÍ ***
    // =========================================================

    const CLOSING_DAY = 5;      // Viernes (0=Domingo, 5=Viernes)
    const CLOSING_HOUR = 20;    // 20:00 (8 PM) UTC (Hora Universal Coordinada)
    const COSTO_POR_ENTRADA = 1.00; 
    const RECOMPENSA_PORCENTAJE = 0.50; 

    // AÑADE LOS ID DE TRANSACCIÓN / PAGO DE BINANCE aquí.
    // CADA LÍNEA CON UN ID REPRESENTA UNA ENTRADA DE 1 USDT.
    const entradas_txid = [
        // EJEMPLO CON 5 ENTRADAS:
        "477D8H934983HD74892H7K21L4G0E", 
        "28H4G0E9K21L4G0E477D8H934983H",
        "L4G0E477D8H934983HD74892H7K21",
        "9K21L4G0E477D8H934983HD74892H",
        "H934983HD74892H7K21L4G0E477D8" // ¡La última NO lleva coma!
    ];

    // =========================================================
    // *** FIN DE CONFIGURACIÓN - NO EDITAR NADA DE AQUÍ ABAJO ***
    // =========================================================
    
    // --- DECLARACIÓN DE CONSTANTES Y ELEMENTOS ---
    const bolsaElement = document.getElementById('pozo-cantidad');
    const listaParticipantesElement = document.getElementById('lista-participantes');
    const countdownTimerElement = document.getElementById('countdown-timer');
    const paymentElements = document.getElementById('payment-elements');
    const closedMessage = document.getElementById('closed-message');
    const bolsaEstadoInicialElement = document.getElementById('bolsa-estado-inicial');
    
    const resultadoPendienteElement = document.getElementById('resultado-pendiente');
    const youtubeButtonElement = document.getElementById('youtube-button-publicado'); 
    
    const potencialTitulo = document.getElementById('potencial-titulo');
    const recompensaPotencialElement = document.getElementById('recompensa-potencial');

    // --- CÁLCULO AUTOMÁTICO DE DATOS ---
    const totalEntradas = entradas_txid.length;
    const bolsaAcumulada = (totalEntradas * COSTO_POR_ENTRADA).toFixed(2); 
    const recompensaGanador = (totalEntradas * COSTO_POR_ENTRADA * RECOMPENSA_PORCENTAJE).toFixed(2); 


    // --- FUNCIÓN DE CÁLCULO DE FECHA DE CIERRE ---
    function getNextClosingTime() {
        const now = new Date();
        const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMilliseconds()));
        
        let daysToAdd = (CLOSING_DAY - date.getUTCDay());
        
        if (date.getUTCDay() === CLOSING_DAY && date.getUTCHours() >= CLOSING_HOUR) {
            daysToAdd += 7; 
        } else if (daysToAdd < 0) {
            daysToAdd += 7; 
        }

        date.setUTCDate(date.getUTCDate() + daysToAdd);
        date.setUTCHours(CLOSING_HOUR, 0, 0, 0);
        
        return date.getTime();
    }
    
    const targetDate = getNextClosingTime();


    // --- FUNCIÓN DE ESTADO (CERRADO/ABIERTO) ---
    function updatePozoState(distance) {
        if (distance <= 0) {
            paymentElements.style.display = 'none';
            closedMessage.style.display = 'block';
            countdownTimerElement.innerHTML = "¡BOLSA CERRADA! Seleccionando...";
            return true;
        } else {
            paymentElements.style.display = 'block';
            closedMessage.style.display = 'none';
            return false;
        }
    }


    // --- LÓGICA DE CUENTA REGRESIVA ---
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        const isClosed = updatePozoState(distance);
        if (isClosed) {
            clearInterval(countdownInterval);
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        countdownTimerElement.innerHTML = 
            `${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }

    // --- LÓGICA DE VISIBILIDAD DE RESULTADOS ---
    if (resultadoPendienteElement && youtubeButtonElement) {
        if (resultadoPendienteElement.style.display !== 'none') {
            youtubeButtonElement.style.display = 'none';
        } else {
            youtubeButtonElement.style.display = 'inline-block';
        }
    }

    // --- INICIALIZACIÓN DE DATOS EN PANTALLA ---

    if (totalEntradas === 0) {
        
        bolsaElement.textContent = "0.00"; 
        bolsaElement.style.fontSize = '3em'; 

        potencialTitulo.textContent = `Potencial de Recompensa: 0.50 USDT (con la primera entrada)`;
        recompensaPotencialElement.textContent = `0.50 USDT (Potencial Inicial)`;
        
        if (bolsaEstadoInicialElement) {
             bolsaEstadoInicialElement.innerHTML = "(¡Sé el **primer participante**! Tu aporte inicia la bolsa y convierte este 0.50 USDT en una realidad. La bolsa crece con cada pago.)";
             bolsaEstadoInicialElement.style.color = '#00ff99';
        }
        
        listaParticipantesElement.innerHTML = `
            <p style="text-align: center;">
                <span class="highlight" style="font-size: 1.1em; color: #f3ba2f;">¡Aún no hay participantes!</span>
                <br>
                Sé el primero en participar y ver tu entrada registrada aquí.
                El primer ID de Transacción será la entrada #1.
            </p>
        `;
    
    } else {
        
        bolsaElement.textContent = bolsaAcumulada; 
        bolsaElement.style.fontSize = '3em';

        if (bolsaEstadoInicialElement) {
            bolsaEstadoInicialElement.innerHTML = "(La **Bolsa** se acumulará con cada pago de 1 USDT. ¡Sé el primero en hacer que esta cifra crezca!)";
            bolsaEstadoInicialElement.style.color = '#999';
        }

        potencialTitulo.textContent = `¡Potencial de Recompensa al Momento: ${recompensaGanador} USDT!`;
        recompensaPotencialElement.textContent = `${recompensaGanador} USDT (Recompensa Potencial)`;


        const ol = document.createElement('ol'); 
        ol.style.paddingLeft = '20px';
        
        const totalParticipantesElement = document.createElement('p');
        totalParticipantesElement.innerHTML = `<span class="highlight">Total de entradas: ${totalEntradas}</span>`; 
        listaParticipantesElement.appendChild(totalParticipantesElement);
        
        entradas_txid.forEach(ID => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${ID}</strong>`; 
            ol.appendChild(li);
        });
        
        listaParticipantesElement.appendChild(ol);
    }

    // Inicializa y comienza el temporizador
    updateCountdown(); 
    const countdownInterval = setInterval(updateCountdown, 1000);
});
