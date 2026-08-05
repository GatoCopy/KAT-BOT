const eventos = new Map();

eventos.set('Authenticated', require('./authenticated'));
eventos.set('Ready', require('./ready'));
eventos.set('Message', require('./message'));
eventos.set('MessageReact', require('./messageReact'));
eventos.set('MessageUnreact', require('./messageUnreact'));

module.exports = eventos;
