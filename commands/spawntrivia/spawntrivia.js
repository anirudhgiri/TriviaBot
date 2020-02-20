const discord = require("discord.js")

const fs = require("fs")
const questions = JSON.parse(fs.readFileSync("./commands/spawntrivia/questions.json"))

/**
 * 
 * @param {discord.Message} message The message that triggered the trivia event
 */
function spawnTrivia(message){
    trivia = questions[Math.floor(Math.random()*questions.length)]
    let embed = new discord.RichEmbed()
    .setColor("#FFD700")
    .setDescription(`:trophy::rotating_light::rotating_light: ***TRIVIA TIME!!*** :rotating_light::rotating_light::trophy:\n\n**QUESTION :**\n*${trivia.Question}*\n\nA) ${trivia.A}\nB) ${trivia.B}\nC) ${trivia.C}\nD) ${trivia.D}\n\n:trophy::trophy::trophy::trophy::trophy::trophy::trophy::trophy::trophy::trophy:`)
    .setFooter("Which option (A/B/C/D) do you think is correct? You have 10 seconds to enter the correct answer for a chance to win the Hardcore Championship!")
    message.channel.send(embed)
}

module.exports.spawnTrivia = spawnTrivia