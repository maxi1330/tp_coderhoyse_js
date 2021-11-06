//INICIO

$( document ).ready(function() {
    checkWallet();
});

function checkWallet(){
    let savedWallet = obtenerWalletGuardada();
    if (savedWallet != null) {
        mostrarMineros();
    } else {
        mostrarIngresoWallet();
    }
}

//Listas

let mineros = [];
let pagos = [];

//Servicios

function getWorkers(wallet){
    $.get(`https://hiveon.net/api/v1/stats/miner/${wallet}/ETH/workers`, function(resp,status){
        if(status === "success"){
            if(resp.workers != null){
                mineros = [];
                $.each(resp.workers , function( key, value ) {
                    let minero = new Minero(key, 
                        value.online, 
                        value.reportedHashrate, 
                        value.sharesStatusStats.validCount ?? "0",
                        value.sharesStatusStats.invalidCount ?? "0",
                        value.sharesStatusStats.staleCount ?? "0"
                        );
                    mineros.push(minero);
                });
                agregarMinerosDOM(mineros);
            } else {
                seccion_mineros_index.empty().append(`
                    <div class="itemMiner">
                        <div class="nameMiner">
                            No hay mineros para mostrar
                        </div>
                    </div>`
                );
            }
        } else {
            seccion_mineros_index.empty().append(`
                <div class="itemMiner">
                    <div class="nameMiner">
                        No hay mineros para mostrar
                    </div>
                </div>`
            );
        }
    });
}

function getEstadisticas(wallet){
    $.get(`https://hiveon.net/api/v1/stats/miner/${wallet}/ETH/billing-acc`, function(resp,status){
        if(status === "success"){
            if(resp != null){
                console.log(resp);
                value_pago_ETH.text(`${resp.totalPaid} ETH`);
                value_estimado_semanal_ETH.text(`${resp.expectedRewardWeek} ETH`);
                value_estimado_diario_ETH.text(`${resp.expectedReward24H} ETH`);
                value_pendiente_pago_ETH.text(`${resp.totalUnpaid} ETH`);
            } else {
                alert("No pudimos obtener las estadisticas");
            }
        } else {
            alert("No pudimos obtener las estadisticas");
        }
    });
}

function getPagos(wallet){
    $.get(`https://hiveon.net/api/v1/payouts/find?limit=30&offset=0&userAddress=${wallet}&coin=ETH&sortBy=-createdAt&type=miner_reward`, function(resp,status){
        if(status === "success"){
            if(resp != null){
                pagos = [];
                $.each(resp.items , function( key, value ) {
                    let pago = new Pago(
                        value.amount, 
                        value.createdAt, 
                        value.status);
                    pagos.push(pago);
                });
                console.log(pagos);
                agregarPagosDOM(pagos);
            } else {
                alert("No pudimos obtener los pagos");
            }
        } else {
            section_pagos.empty().append(`
            <div class="itemMiner">
                <div class="nameMiner">
                    No hay pagos para mostrar
                </div>
            </div>`
        );
        }
    });
}

//Agregar al DOM

function agregarPagosDOM(pagos){
    section_pagos.empty();
    pagos.forEach( function(value) {
        section_pagos.append(`
            <div class="itemMiner">
                <div class="headerItemMiner">
                    <div class="containerStatus">
                        <h3 class="nameMiner">${new Date(value.createdAt).toLocaleString()}</h3>
                        <h3 class="textStatus">Monto: ${value.amount} ETH</h3>
                    </div>
                </div>
                <div>
                    <h3 class="itemHashrate">${value.status == "succeed" ? "Aprobado" : "Rechazado"}</h3>
                </div>
            </div>
        `).hide().fadeIn(350);
    });
}

function agregarMinerosDOM(mineros){
    seccion_mineros_index.empty();
    mineros.forEach( function(value) {
        seccion_mineros_index.append(`
            <div class="itemMiner">
                <div class="headerItemMiner">
                    <img class="imageStatus" src="${value.estado ? "resources/worker_online.png" : "resources/worker_offline.png"}"/>
                    <div class="containerStatus">
                        <h3 class="nameMiner">${value.nombre}</h3>
                        <h3 class="textStatus">Estado: ${value.estado ? "En linea" : "Fuera de linea"}</h3>
                    </div>
                </div>
                <div>
                    <h3 class="itemHashrate">Hashrate: ${(value.hashrate / 1000000).toFixed(2)} mh/s</h3>
                    <h3 class="itemHashrate">Transacciones validas: ${value.transValidas}</h3>
                    <h3 class="itemHashrate">Transacciones rechazadas: ${value.transRechazadas}</h3>
                    <h3 class="itemHashrate">Transacciones invalidas: ${value.transInvalidas}</h3>
                </div>
            </div>
        `).hide().fadeIn(350);
    });
}

//Vistas

function mostrarIngresoWallet(){
    seccion_mineros_index.hide();
    navbar_general.hide();
    section_pagos.hide();
    section_estadisticas.hide();
    seccion_ingresar_billetera.hide().fadeIn(2000);
}

function mostrarMineros(){
    seccion_ingresar_billetera.hide();
    section_estadisticas.hide();
    section_pagos.hide();
    seccion_mineros_index.hide().fadeIn(350);
    navbar_general.show();
    getWorkers(obtenerWalletGuardada());
}

function mostrarEstadisticas(){
    seccion_ingresar_billetera.hide();
    seccion_mineros_index.hide();
    section_pagos.hide();
    section_estadisticas.hide().fadeIn(350);
    navbar_general.show();
    getEstadisticas(obtenerWalletGuardada());
}

function mostrarPagos(){
    section_estadisticas.hide();
    seccion_ingresar_billetera.hide();
    seccion_mineros_index.hide();
    section_pagos.fadeOut(350).fadeIn(350);
    navbar_general.show();
    getPagos(obtenerWalletGuardada());
}

//LocalStorage

function obtenerWalletGuardada(){
    return localStorage.getItem(WALLET_SAVED);
}

function guardarWallet(){
    let direccion = String(value_wallet.val());
    if (direccion == "" || direccion.length < 27){
        alert("Ingrese una wallet valida");
    } else {
        localStorage.setItem(WALLET_SAVED,String(direccion.substring(2)));
        mostrarMineros();
    }
}

function removeWallet(){
    localStorage.removeItem(WALLET_SAVED);
    mostrarIngresoWallet();
}

//EVENTOS

btn_guardar_wallet.on('click', function(){
    guardarWallet();
});

btn_cerrar_sesion.on('click', function(){
    removeWallet();
});

btn_mineros.on('click', function(){
    mostrarMineros();
});

btn_estadisticas.on('click', function(){
    mostrarEstadisticas();
});

btn_pagos.on('click', function(){
    mostrarPagos();
});