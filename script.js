document.addEventListener('DOMContentLoaded', () => {

    const pozoElement = document.getElementById('pozo-cantidad');
    const listaParticipantesElement = document.getElementById('lista-participantes');

    // --- DATOS DEL PROTOTIPO (ACTUALIZAR MANUALMENTE) ---
    // Total recaudado en USDT (Ejemplo: 37 participantes)
    const pozoAcumulado = 37.00; 
    
    // Lista de identificadores de billetera (tomados de las notificaciones de Binance Pay)
    const participantes = [
        "Txyz9876543210fedcba9876543210fedcba9876543 (Ver Transacción)",
        "T1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b (Ver Transacción)",
        "T987654321fedcba9876543210fedcba9876543210 (Ver Transacción)",
        "Tabcdef0123456789abcdef0123456789abcdef01 (Ver Transacción)",
        "T09876543210fedcba9876543210fedcba9876543 (Ver Transacción)",
        "Tfedcba9876543210fedcba9876543210fedcba98 (Ver Transacción)",
        "T9876543210fedcba9876543210fedcba98765432 (Ver Transacción)",
        "T0fedcba9876543210fedcba9876543210fedcba9 (Ver Transacción)",
        "T3210fedcba9876543210fedcba9876543210fedc (Ver Transacción)",
        "T456789abcdef0123456789abcdef0123456789ab (Ver Transacción)",
        "T13579bdf02468aceg13579bdf02468aceg13579b (Ver Transacción)",
        "Taceg13579bdf02468aceg13579bdf02468aceg1 (Ver Transacción)",
        "Tbdf02468aceg13579bdf02468aceg13579bdf02 (Ver Transacción)",
        "T579bdf02468aceg13579bdf02468aceg13579bd (Ver Transacción)",
        "Td02468aceg13579bdf02468aceg13579bdf0246 (Ver Transacción)",
        "T8aceg13579bdf02468aceg13579bdf02468aceg (Ver Transacción)",
        "T10fedcba9876543210fedcba9876543210fedcba (Ver Transacción)",
        "T543210fedcba9876543210fedcba9876543210fe (Ver Transacción)",
        "Ta9876543210fedcba9876543210fedcba9876543 (Ver Transacción)",
        "T789abcdef0123456789abcdef0123456789abcde (Ver Transacción)",
        "T2468aceg13579bdf02468aceg13579bdf02468a (Ver Transacción)",
        "T13579bdf02468aceg13579bdf02468aceg13579 (Ver Transacción)",
        "T543210fedcba9876543210fedcba9876543210fe (Ver Transacción)",
        "Tbdf02468aceg13579bdf02468aceg13579bdf02 (Ver Transacción)",
        "T9876543210fedcba9876543210fedcba98765432 (Ver Transacción)",
        "T0fedcba9876543210fedcba9876543210fedcba9 (Ver Transacción)",
        "T3210fedcba9876543210fedcba9876543210fedc (Ver Transacción)",
        "T456789abcdef0123456789abcdef0123456789ab (Ver Transacción)",
        "T13579bdf02468aceg13579bdf02468aceg13579b (Ver Transacción)",
        "Taceg13579bdf02468aceg13579bdf02468aceg1 (Ver Transacción)",
        "Tbdf02468aceg13579bdf02468aceg13579bdf02 (Ver Transacción)",
        "T579bdf02468aceg13579bdf02468aceg13579bd (Ver Transacción)",
        "Td02468aceg13579bdf02468aceg13579bdf0246 (Ver Transacción)",
        "T8aceg13579bdf02468aceg13579bdf02468aceg (Ver Transacción)",
        "T10fedcba9876543210fedcba9876543210fedcba (Ver Transacción)",
        "T543210fedcba9876543210fedcba9876543210fe (Ver Transacción)",
        "Ta9876543210fedcba9876543210fedcba9876543 (Ver Transacción)"
    ];
    // --------------------------------------------------------

    // Actualiza el pozo acumulado en la página
    pozoElement.textContent = pozoAcumulado.toFixed(2);

    // Muestra la lista de participantes en la página
    if (participantes.length === 0) {
        listaParticipantesElement.innerHTML = "<p>Aún no hay participantes. ¡Sé el primero!</p>";
    } else {
        const ul = document.createElement('ul');
        ul.style.listStyleType = 'none';
        ul.style.paddingLeft = '0';
        
        // Muestra el total de participantes antes de la lista
        const totalParticipantes = document.createElement('p');
        totalParticipantes.innerHTML = `**Total de Aportes: ${participantes.length}**`;
        listaParticipantesElement.appendChild(totalParticipantes);
        
        participantes.forEach(direccionInfo => {
            const li = document.createElement('li');
            li.innerHTML = direccionInfo; 
            ul.appendChild(li);
        });
        
        listaParticipantesElement.appendChild(ul);
    }
});