module.exports.execute = (message, args) => message.reply(`Hello, ${args[0]}!`);
module.exports.filter = (_, args) => !!args.length;
module.exports.filterCallback = (message) => message.reply('Please provide a name, eg. `!hello <username>`');