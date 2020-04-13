const discord = require("discord.js")
const client = new discord.Client()

require("dotenv").config()

const fs = require("fs")
const questions = JSON.parse(fs.readFileSync("questions.json"))

let guild = " "
let hitRate = 0.02
let prefix = '='

let ChampRoleID = process.env.CHAMP_ROLE_ID
let AdminRoleID = process.env.ADMIN_ROLE_ID
let RefRoleID   = process.env.REF_ROLE_ID
let SideRoleID  = process.env.SIDE_ROLE_ID

let currentChampion
let preChamp = false

let inTriviaMode = false
let start
let eventChannel
let submissions = "Submissions Received:"
let contestants = []
let players = []
let answer

let trigMessage

let giflinks = ['LyJ6KPlrFdKnK','NRXleEopnqL3a','26BkLCUdp1lqUA2JO','doJrCO8kCAgNy','ELTNW5yGKbn9K','WegnQe8QdvpCg']
let gif_user = ' '
let gifMessages = []
let gifReplies = ["...did you just say...you can't say that on a PG server...", "wh-- what the hell did you just say?", ".....that's your answer?", "....did you seriously say that on a PG server?"]

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
        
        case "prefix" : if(message.member.roles.has(AdminRoleID))
                            changePrefix(message,msg[1])
                        break
        
        case "trivia" : if(message.member.roles.has(AdminRoleID)||message.member.roles.has(RefRoleID))
                            spawnTrivia(message)
                        break
        
        case "hitrate" : if(message.member.roles.has(AdminRoleID))
                            setHitRate(message,msg[1])
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
    .setDescription(`:trophy::trophy::trophy: **TRIVIA BOT V1.0.1** :trophy::trophy::trophy:
    Prefix           : \`${prefix}\`
    Ping             : \`${Math.round((Date.now()-message.createdTimestamp))}ms\`
    Hit Rate         : \`${hitRate*100}%\`
    Current Champion : \`${(getCurrentChampion()?getCurrentChampion().user.tag : "Vacant")}\`
    ---*Commands*---
    \`${prefix}ping\` : Ping time in milliseconds
    \`${prefix}currentchamp\` : Tells you who the current champion is
    \`${prefix}prefix (STAFF ONLY)\` : Changes the prefix for commands
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
    message.reply(`Pong! \`${Math.round((Date.now()-message.createdTimestamp))}ms\``)
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
    champName = champ?champ.nickname?`${champ.nickname}(${champ.user.tag})`:`${champ.user.tag}`:"Vacant"
    message.channel.send(`:trophy:The current 24/7 Champion is \`${champName}\`!:trophy:`)
   }

/**
 * 
 * @param {discord.Message} message The message that triggered the trivia event
 */
function spawnTrivia(message){
    if(!inTriviaMode){
        trivia = questions[Math.floor(Math.random()*questions.length)]
        message.channel.send(`<@&${process.env.CHAMP_ROLE_ID}>`)
        let embed = new discord.RichEmbed()
        .setColor("#FFD700")
        .setDescription(`:trophy::rotating_light::rotating_light: ***TRIVIA TIME!!*** :rotating_light::rotating_light::trophy:\n\n**QUESTION :**\n*${trivia.Question}*\n\nA) ${trivia.A}\nB) ${trivia.B}\nC) ${trivia.C}\nD) ${trivia.D}\n\n:trophy::trophy::trophy::trophy::trophy::trophy::trophy::trophy::trophy::trophy:`)
        .setFooter(`Which option (A/B/C/D) do you think is correct? You have 10 seconds to enter the correct answer for a chance to win the 24/7 Championship!`)
    
        message.channel.send(embed).then(()=>{
            message.channel.send("\`\`\`"+submissions+"\`\`\`")
        })

        inTriviaMode = true
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
                if(c == getCurrentChampion())
                    winner = c
            })
            if(winner == " ")
                winner = contestants[Math.floor(Math.random()*contestants.length)]
            makeChampion(winner,eventChannel)
            setTimeout(() => {
                sendGif()
                gif_user = ' '
            }, 5000);
            contestants = []
            players = []
            eventChannel = null
        },10000)
        return
    }
    else{
        let sub = message.content.trim().toUpperCase()
        if(players.includes(message.member))
            return
        if(sub.length == 1 && (sub == 'A' || sub == 'B' || sub == 'C' || sub == 'D')){
            players.push(message.member)
            submissions += `\n${message.author.username}`
            client.user.lastMessage.edit("\`\`\`"+submissions+"\`\`\`")
            if(sub == answer)
                contestants.push(message.member)
        }
        else if(gifMessages.includes(sub)){
            gif_user = message
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
    eventChannel.send(`🎉🎉🎉${winner.toString()} is the new 24/7 Champion!! 🎉🎉🎉`)
    hc_role = eventChannel.guild.roles.get(ChampRoleID)
    side_role = eventChannel.guild.roles.get(SideRoleID)
    if(getCurrentChampion()){
    if(!preChamp)
        getCurrentChampion().removeRole(side_role)
    getCurrentChampion().removeRole(hc_role)
    }
    winner.addRole(hc_role)
    if(winner.roles.has(SideRoleID))
        preChamp = true
    else{
        preChamp = false
        winner.addRole(side_role)
    }
    }
}

//A function that sends a Steve Harvey GIF if a message listed in gifMessages is sent
function sendGif(){
    if(gif_user != ' '){
    gif = `https://media.giphy.com/media/${giflinks[Math.floor(Math.random()*giflinks.length)]}/giphy.gif`
    reply = gifReplies[Math.floor(Math.random()*gifReplies.length)]
    gif_user.reply(reply)
    gif_user.channel.send(gif)
    }
}
