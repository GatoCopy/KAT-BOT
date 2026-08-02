const eventos = new Map();

eventos.set('Authenticated', require('./authenticated'));
eventos.set('Ready', require('./ready'));
eventos.set('Message', require('./message'));

module.exports = eventos;
