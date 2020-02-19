const discord = require("discord.js")
const ping = require("./ping/ping")
const changePrefix = require("../app")

/**
 * 
 * @param {discord.Message} message The message identified as a command
 * @param {string} prefix The prefix of the commands
 */
function processCommand(message, prefix){
    let msg = message.content.split(' ')
    let command = msg[0]
    command = command.slice(prefix.length)

    switch(command){
        case "ping" : ping.ping(message)
                      break
        
        case "prefix" : changePrefix.changePrefix(msg[1])
                        break
    }
}

module.exports.processCommand = processCommand