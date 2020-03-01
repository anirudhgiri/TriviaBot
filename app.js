const discord = require("discord.js")
const client = new discord.Client()

require("dotenv").config()

const fs = require("fs")
const questions = JSON.parse(fs.readFileSync("questions.json"))

let guild = " "
let hitRate = 0.01
let prefix = '~'

let ChampRoleID = process.env.CHAMP_ROLE_ID
let AdminRoleID = process.env.ADMIN_ROLE_ID

let currentChampion

let inTriviaMode = false
let start
let eventChannel
let submissions = "Submissions Received:"
let contestants = []
let answer

let trigMessage

client.login(process.env.CLIENT_TOKEN)

client.on("ready", () => {
    console.log(`${client.user.tag} : Login Successful!`)
})

client.on("message",(msg) => {
    if(msg.author.bot) return;
    if(guild == " ")
        getCurrentChampion(msg)
    if(inTriviaMode)
        spawnTrivia(msg)
    else if(msg.content.substring(0,prefix.length) == prefix)
        processCommand(msg,prefix)
    else if(msg.member == getCurrentChampion(msg) && Math.random() < hitRate && msg.channel.parent.name == "Wrestling Channels")
        spawnTrivia(msg)
})

/**
 * 
 * @param {discord.Message} message The message identified as a command
 */
function processCommand(message){
    let msg = message.content.split(' ')
    let command = msg[0]
    command = command.slice(prefix.length)

    switch(command){
        case "ping" : ping(message)
                      break
        
        case "prefix" : changePrefix(message,msg[1])
                        break
        
        case "trivia" : if(message.member.roles.has(AdminRoleID))
                            spawnTrivia(message)
                        break
        
        case "hitrate" : setHitRate(message,msg[1])
                        break
        
        case "help" : help(message)
                      break
        
        case "currentchamp" : currentchamp(message)
                              break
    }
}

/**
 * 
 * @param {discord.Message} message The message identified as a command
 */
function help(message){
    let embed = new discord.RichEmbed()
    .setColor("#FFD700")
    .setDescription(`:trophy::trophy::trophy: **TRIVIA BOT V1.0.0** :trophy::trophy::trophy:
    Prefix   : \`${prefix}\`
    Ping     : \`${Math.floor(message.client.ping/100)}ms\`
    Hit Rate : \`${hitRate*100}%\`
    ---*Commands*---
    \`${prefix}ping\` : Ping time in milliseconds
    \`${prefix}currentchamp\` : Tells you who the current champion is
    \`${prefix}prefix (STAFF ONLY)\` : Chances the prefix for commands
    \`${prefix}trivia (STAFF ONLY)\` : Forces a trivia event
    \`${prefix}hitrate (STAFF ONLY)\` : Changes the % probability of a trivia event spawning
    `)
    message.channel.send(embed)
}

/**
 * 
 * @param {discord.Message} message The message identified as a command
 */
function ping(message){
    message.reply(`Pong! \`${Math.floor(message.client.ping/100)}ms\``)
}

/**
 * 
 * @param {discord.Message} message The message identified as a command
 * @param {string} newPrefix The new prefix to be changed to
 */
function changePrefix(message,newPrefix){
    message.channel.send(`Changed Prefix From \`${prefix}\` to \`${newPrefix}\``)
    if(newPrefix !== null && newPrefix !== ' ')
    prefix = newPrefix
}

/**
 * 
 * @param {discord.Message} message The message identified as a command
 * @param {string} newHitrate The new probability at which the trivia question spawns as a %
 */
function setHitRate(message,newHitrate){
    if(newHitrate !== null && newHitrate !== ' ' && !isNaN(newHitrate)){
        message.channel.send(`Changed Hitrate from \`${hitRate*100}%\` to \`${newHitrate}%\``)
        hitRate = Number(newHitrate)/100
    }
}

/**
 * 
 * @param {discord.Message} message The message identified as a command
 */
function getCurrentChampion(message){
    if (guild == " ")
        guild = message.guild
    return guild.roles.get(ChampRoleID).members.array()[0]
}

/**
 * 
 * @param {discord.Message} message The message identified as a command
 */
function currentchamp(message){
    champ = getCurrentChampion()
    message.reply(`:trophy:The current Harcore Champion is \`${champ.nickname}(${champ.user.tag})\`:trophy:`)
}

/**
 * 
 * @param {discord.Message} message The message that triggered the trivia event
 */
function spawnTrivia(message){
    if(!inTriviaMode){
        trivia = questions[Math.floor(Math.random()*questions.length)]
        message.channel.send(`<@&${process.env.ROLE_ID}>`)
        let embed = new discord.RichEmbed()
        .setColor("#FFD700")
        .setDescription(`:trophy::rotating_light::rotating_light: ***TRIVIA TIME!!*** :rotating_light::rotating_light::trophy:\n\n**QUESTION :**\n*${trivia.Question}*\n\nA) ${trivia.A}\nB) ${trivia.B}\nC) ${trivia.C}\nD) ${trivia.D}\n\n:trophy::trophy::trophy::trophy::trophy::trophy::trophy::trophy::trophy::trophy:`)
        .setFooter(`Which option (A/B/C/D) do you think is correct? You have 10 seconds to enter the correct answer for a chance to win the Hardcore Championship!`)
    
        message.channel.send(embed).then(()=>{
            message.channel.send("\`\`\`"+submissions+"\`\`\`")
        })

        inTriviaMode = true
        console.log("Trivia mode set to true")
        start = Date.now()
        eventChannel = message.channel
        answer = trivia.Answer
        setTimeout((trigMessage = message) => {
            trigMessage.channel.send(":rotating_light::rotating_light: TIME'S UP! :rotating_light::rotating_light:")
            inTriviaMode = false
            start = 0
            submissions = "Submissions Received:"
            let winner = " "
            contestants.forEach(function(c){
                if(c == getCurrentChampion()){
                    console.log("Champ is here")
                    winner = c
                }
            })
            if(winner == " "){
            console.log("Champ is not here")
            winner = contestants[Math.floor(Math.random()*contestants.length)]
            }
            makeChampion(winner,eventChannel)
            contestants = []
            eventChannel = null
        },10000)
        return
    }
    else{
        let sub = message.content.trim().toUpperCase()
        if(contestants.includes(message.author))
            return
        if(sub.length == 1 && (sub == 'A' || sub == 'B' || sub == 'C' || sub == 'D')){
           submissions += `\n${message.author.username}`
            client.user.lastMessage.edit("\`\`\`"+submissions+"\`\`\`")
            if(sub == answer)
                contestants.push(message.member)
        }
    }
}

/**
 * 
 * @param {discord.GuildMember} winner The winner of the raffle
 * @param {discord.TextChannel} eventChannel The channel where the trivia event took place
 */
function makeChampion(winner,eventChannel){
    if(!winner || getCurrentChampion() == winner)
        eventChannel.send(`🥊🥊🥊 ${getCurrentChampion()} has successfully defended the title!! 🥊🥊🥊`)
    else{
    eventChannel.send(`🎉🎉🎉${winner.toString()} is the new Hardcore Champion!! 🎉🎉🎉`)
    hc_role = eventChannel.guild.roles.get(ChampRoleID)
    if(getCurrentChampion())
    getCurrentChampion().removeRole(hc_role)
    winner.addRole(hc_role)
    }
}