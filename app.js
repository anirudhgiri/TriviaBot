const discord = require("discord.js")
const client = new discord.Client()

const fs = require("fs")
const questions = JSON.parse(fs.readFileSync("questions.json"))

let hitRate = 0.1
let prefix = '~'

let currentChampion

let inTriviaMode = false
let start
let eventChannel
let submissions = "Submissions Received:"
let contestants = []
let answer

let trigMessage

require("dotenv").config()
client.login(process.env.CLIENT_TOKEN)

client.on("ready", () => {
    console.log(`${client.user.tag} : Login Successful!`)
})

client.on("message",(msg) => {
    if(msg.author.bot) return;
    
    if(inTriviaMode)
        spawnTrivia(msg)
    else if(msg.author == currentChampion && Math.random() > hitRate)
        spawnTrivia(msg)
    else if(msg.content.substring(0,prefix.length) == prefix)
        processCommand(msg,prefix)
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
        
        case "prefix" : changePrefix(msg[1])
                        break
        
        case "trivia" : spawnTrivia(message)
                        break
        
        case "hitrate" : setHitRate(msg[1])
                        break
    }
}

/**
 * 
 * @param {discord.Message} message The message identified as a command
 */
function ping(message){
    message.reply(`Pong! \`${Math.floor((Date.now() - message.createdTimestamp)/100)}ms\``)
}

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

/**
 * 
 * @param {discord.Message} message The message that triggered the trivia event
 */
function spawnTrivia(message){
    if(!inTriviaMode){
        trivia = questions[Math.floor(Math.random()*questions.length)]
    
        let embed = new discord.RichEmbed()
        .setColor("#FFD700")
        .setDescription(`:trophy::rotating_light::rotating_light: ***TRIVIA TIME!!*** :rotating_light::rotating_light::trophy:\n\n**QUESTION :**\n*${trivia.Question}*\n\nA) ${trivia.A}\nB) ${trivia.B}\nC) ${trivia.C}\nD) ${trivia.D}\n\n:trophy::trophy::trophy::trophy::trophy::trophy::trophy::trophy::trophy::trophy:`)
        .setFooter("Which option (A/B/C/D) do you think is correct? You have 10 seconds to enter the correct answer for a chance to win the Hardcore Championship!")
    
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
            let winner = contestants[Math.floor(Math.random()*contestants.length)]
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
    if(currentChampion == winner)
        eventChannel.send(`🥊🥊🥊 ${winner.toString()} has successfully defended the title!! 🥊🥊🥊`)
    else{
    eventChannel.send(`🎉🎉🎉${winner.toString()} is the new Hardcore Champion!! 🎉🎉🎉`)
    hc_role = eventChannel.guild.roles.get("683263039734415391")
    winner.addRole(hc_role)
    currentChampion = winner
    }
}