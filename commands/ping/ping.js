const discord = require("discord.js")

/**
 * 
 * @param {discord.Message} message The message identified as a command
 */
function ping(message){
    message.reply(`Pong! \`${Math.floor((Date.now() - message.createdTimestamp)/100)}ms\``)
}

module.exports.ping = ping