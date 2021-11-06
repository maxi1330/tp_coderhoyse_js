class Minero {
	constructor(nombre, estado, hashrate, transValidas, transInvalidas, transRechazadas) {
		this.nombre = nombre
		this.estado = estado
		this.hashrate = hashrate
        this.transValidas = transValidas
        this.transInvalidas = transInvalidas
        this.transRechazadas = transRechazadas
	}
}

class Pago {
	constructor(amount, createdAt, status) {
		this.amount = amount
		this.createdAt = createdAt
		this.status = status
	}
}