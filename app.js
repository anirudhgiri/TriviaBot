const discord = require("discord.js")
const client = new discord.Client()

require("dotenv").config()

const commandProcessor = require("./commands/commandProcessor")

let hitRate = 0.1
let prefix = '~'

client.login(process.env.CLIENT_TOKEN)

client.on("ready", () => {
    console.log(`${client.user.tag} : Login Successful!`)
})

client.on("message",(msg) => {
    if(msg.author.bot) return;
    
    if(msg.content.substring(0,prefix.length) == prefix)
        commandProcessor.processCommand(msg,prefix)
})


/**
 * 
 * @param {string} newPrefix The new prefix to be changed to
 */
function changePrefix(newPrefix){
    if(newPrefix !== null && newPrefix !== ' ')
    prefix = newPrefix
}

/**
 * 
 * @param {string} newHitrate The new probability at which the trivia question spawns as a %
 */
function setHitRate(newHitrate){
    if(newHitrate !== null && newHitrate !== ' ' && !isNaN(newHitrate))
        hitRate = Number(newHitrate)/100
}

module.exports.changePrefix = changePrefix;
module.exports.setHitRate = setHitRate;