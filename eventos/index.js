const eventos = new Map();

eventos.set('clientReady', require('./ready'));
eventos.set('messageCreate', require('./message'));
eventos.set('messageReactionAdd', require('./messageReact'));
eventos.set('messageReactionRemove', require('./messageUnreact'));
eventos.set('guildMemberAdd', require('./memberAdd'));

module.exports = eventos;
