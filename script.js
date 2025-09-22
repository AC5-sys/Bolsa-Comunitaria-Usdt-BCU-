document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================================
    // *** SECCIÓN DE CONFIGURACIÓN DE DATOS - SOLO EDITAR AQUÍ ***
    // =========================================================

    const ENTRADAS_FILE = 'entradas.json'; 
    
    // CAMBIO DE NOMBRE: Costo por Entrada -> Donación Mínima
    const DONACION_MINIMA = 1.00; 
    
    const RECOMPENSA_PORCENTAJE = 0.50; 
    
    // Horarios (Mantenidos en UTC)
    const CLOSING_DAY = 5;      
    const CLOSING_HOUR = 20;    
    const OPENING_DAY = 1;      
    const OPENING_HOUR = 0;     
    
    // =========================================================
    // *** FIN DE CONFIGURACIÓN ***
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
    const totalEntradasHTMLElem = document.getElementById('total-entradas-html');

    // --- VARIABLES GLOBALES PARA DATOS CALCULADOS ---
    let entradas_txid = [];
    let totalEntradas = 0;
    let bolsaAcumulada = 0;
    let incentivoGanador = 0; 
    
    // --- FUNCIÓN PARA FORMATO ESTÉTICO (K, M) ---
    function formatBolsaAmount(num) {
        const standardFormatter = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        if (Math.abs(num) < 1000) {
            return standardFormatter.format(num);
        }

        const SI_POSTFIXES = ["", "K", "M", "B", "T"]; 
        const tier = Math.floor(Math.log10(Math.abs(num)) / 3);

        if (tier === 0) {
             return standardFormatter.format(num); 
        }

        const postfix = SI_POSTFIXES[tier];
        const tierScale = Math.pow(10, tier * 3);
        const scaled = num / tierScale;

        return scaled.toFixed(scaled < 100 ? 1 : 0) + postfix;
    }

    // --- FUNCIONES DE UTILIDAD ---
    
    function formatDistance(distance) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        return `${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }
    
    /**
     * Calcula la fecha del próximo Viernes a las 20:00 UTC (Cierre).
     * @returns {Date}
     */
    function getNextClosingTime(now) {
        const nextClose = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), CLOSING_HOUR, 0, 0, 0));
        let daysToNextFriday = CLOSING_DAY - now.getUTCDay();

        if (daysToNextFriday < 0) {
            daysToNextFriday += 7;
        } else if (daysToNextFriday === 0 && now.getUTCHours() >= CLOSING_HOUR) {
            daysToNextFriday += 7;
        }
        nextClose.setUTCDate(nextClose.getUTCDate() + daysToNextFriday);
        return nextClose;
    }

    /**
     * Calcula la fecha del próximo Lunes a las 00:00 UTC (Apertura).
     * @returns {Date}
     */
    function getNextOpeningTime(now) {
        const nextOpen = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), OPENING_HOUR, 0, 0, 0));
        let daysToNextMonday = OPENING_DAY - now.getUTCDay();
        
        if (daysToNextMonday < 0 || (daysToNextMonday === 0 && now.getUTCHours() >= OPENING_HOUR)) {
            daysToNextMonday += 7;
        }
        nextOpen.setUTCDate(nextOpen.getUTCDate() + daysToNextMonday);
        return nextOpen;
    }

    /**
     * Determina el estado (Abierto/Cerrado) y a qué tiempo contar.
     * @returns {{isOpen: boolean, targetTime: number, targetLabel: string}}
     */
    function calculateNextTarget() {
        const now = new Date();
        
        const nextCloseTime = getNextClosingTime(now).getTime();
        const nextOpenTime = getNextOpeningTime(now).getTime();
        
        if (nextOpenTime > nextCloseTime) {
            return {
                isOpen: true,
                targetTime: nextCloseTime,
                targetLabel: "Tiempo Restante para el Cierre de Donaciones" 
            };
        } else {
            return {
                isOpen: false,
                targetTime: nextOpenTime,
                targetLabel: "¡DONACIONES CERRADAS! Reabren en:" 
            };
        }
    }

    // --- FUNCIÓN DE ESTADO (CERRADO/ABIERTO) ---
    function updatePozoState(status, distance) {
        const isClosed = !status.isOpen;

        document.querySelector('#cuenta-regresiva h2').textContent = status.targetLabel;

        if (isClosed) {
            paymentElements.style.display = 'none';
            closedMessage.style.display = 'block';
            countdownTimerElement.innerHTML = formatDistance(distance);
            
            closedMessage.querySelector('h3').textContent = '❌ Donaciones Cerradas ❌';
            closedMessage.querySelector('p:nth-of-type(1)').textContent = 'La Donación Semanal reabrirá el lunes a las 00:00 UTC. Mientras tanto, estamos seleccionando al Participante Elegido.';
            closedMessage.querySelector('p:nth-of-type(2)').textContent = 'Las donaciones realizadas a partir del viernes 20:00 UTC serán consideradas para el próximo evento semanal.';
            
            return true;
        } else {
            paymentElements.style.display = 'block';
            closedMessage.style.display = 'none';
            document.querySelector('#cuenta-regresiva h2').textContent = "Tiempo Restante para el Cierre de Donaciones"; 
            return false;
        }
    }

    // --- LÓGICA DE CUENTA REGRESIVA ---
    function updateCountdown() {
        const status = calculateNextTarget();
        const now = new Date().getTime();
        const distance = status.targetTime - now;

        updatePozoState(status, distance);
        
        if (distance <= 0) {
             clearInterval(window.countdownInterval);
             loadDataAndInitialize();
             return;
        }

        countdownTimerElement.innerHTML = formatDistance(distance);
    }

    // --- FUNCIÓN DE CARGA DE DATOS ASÍNCRONA ---
    async function loadDataAndInitialize() {
        try {
            const response = await fetch(ENTRADAS_FILE);
            if (!response.ok) {
                 console.error(`Error al cargar ${ENTRADAS_FILE}. Usando 0 donaciones.`); // Mensaje corregido
                 entradas_txid = [];
            } else {
                 entradas_txid = await response.json();
                 if (!Array.isArray(entradas_txid)) {
                    console.error("El archivo JSON no es un array válido. Usando 0 donaciones."); // Mensaje corregido
                    entradas_txid = [];
                 }
            }
        } catch (error) {
            console.error("Fallo durante la operación de fetch/parseo:", error);
            entradas_txid = [];
        }
        
        totalEntradas = entradas_txid.length;
        bolsaAcumulada = totalEntradas * DONACION_MINIMA; 
        incentivoGanador = bolsaAcumulada * RECOMPENSA_PORCENTAJE;
        
        initializeApp();
    }
    
    // --- FUNCIÓN PRINCIPAL DE INICIALIZACIÓN ---
    function initializeApp() {
        
        if (resultadoPendienteElement && youtubeButtonElement) {
            if (resultadoPendienteElement.style.display !== 'none') {
                youtubeButtonElement.style.display = 'none';
            } else {
                youtubeButtonElement.style.display = 'inline-block';
            }
        }

        // Muestra el total de donaciones (aunque la variable se llama totalEntradas)
        if (totalEntradasHTMLElem) {
             totalEntradasHTMLElem.textContent = totalEntradas;
        }

        // --- LÓGICA DE VISUALIZACIÓN DE LA BOLSA E INCENTIVO ---

        if (totalEntradas === 0) {
            
            bolsaElement.textContent = formatBolsaAmount(0);
            bolsaElement.style.fontSize = '3em'; 

            potencialTitulo.textContent = `Potencial de Incentivo: ${formatBolsaAmount(DONACION_MINIMA * RECOMPENSA_PORCENTAJE)} USDT (con la primera donación)`;
            recompensaPotencialElement.textContent = `${formatBolsaAmount(DONACION_MINIMA * RECOMPENSA_PORCENTAJE)} USDT (Incentivo Potencial Inicial)`;
            
            if (bolsaEstadoInicialElement) {
                 bolsaEstadoInicialElement.innerHTML = "(¡Sé el **Primer Donante**! Tu aporte inicia el fondo de ayuda y convierte este evento en una realidad. El fondo crece con cada donación.)"; 
                 bolsaEstadoInicialElement.style.color = '#00ff99';
            }
            
            // CORRECCIÓN CRÍTICA DE MENSAJE
            listaParticipantesElement.innerHTML = `
                <p style="text-align: center;">
                    <span class="highlight" style="font-size: 1.1em; color: #f3ba2f;">¡Aún no hay donaciones registradas!</span>
                    <br>
                    Sé el primero en donar y ver tu ID de Transacción registrado aquí como tu número de participación.
                </p>
            `;
        } else {
            
            bolsaElement.textContent = formatBolsaAmount(bolsaAcumulada);
            bolsaElement.style.fontSize = '3em';

            if (bolsaEstadoInicialElement) {
                bolsaEstadoInicialElement.innerHTML = "(El **Fondo Acumulado** crecerá con cada donación de 1 USDT.)"; 
                bolsaEstadoInicialElement.style.color = '#999';
            }

            potencialTitulo.textContent = `¡Potencial de Incentivo al Momento: ${formatBolsaAmount(incentivoGanador)} USDT!`; 
            recompensaPotencialElement.textContent = `${formatBolsaAmount(incentivoGanador)} USDT (Incentivo Potencial)`; 

            // --- Generación de lista de Participantes (Donantes) ---
            listaParticipantesElement.innerHTML = ''; 
            const ol = document.createElement('ol'); 
            ol.style.paddingLeft = '45px'; 
            
            entradas_txid.forEach(ID => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${ID}</strong>`; 
                ol.appendChild(li);
            });
            listaParticipantesElement.appendChild(ol);
        }

        // Inicializa y comienza el temporizador
        updateCountdown(); 
        window.countdownInterval = setInterval(updateCountdown, 1000); 
    }

    // Comienza el proceso cargando primero los datos
    loadDataAndInitialize();
});