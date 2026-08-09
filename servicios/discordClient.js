let client = null;

function setClient(instancia) {
    client = instancia;
}

function getClient() {
    if (!client) {
        throw new Error('El cliente de Discord aún no está listo (¿se llamó a setClient antes del login?).');
    }
    return client;
}

module.exports = { setClient, getClient };
