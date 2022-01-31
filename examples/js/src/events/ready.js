const { registerGlobalSlashCommands } = require('discord-botly');

exports.execute = function (client) {
    registerGlobalSlashCommands(client);
    console.log(`client logged in as ${client.user.tag}`);
};
