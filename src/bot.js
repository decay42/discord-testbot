import Discord from 'discord.js'
import config from './config.js'

const bot = new Discord.Client()

bot.on('ready', () => {
  let serverList = []
  for (var server of bot.guilds.values()) {
    serverList.push('  ' + server.name)
  }
  console.log(`Successfully connected to the following servers:\n${serverList.join('\n')}`)
})

bot.on('message', message => {
  console.log(message)
})

bot.login(config.token)

process.on('unhandledRejection', console.error)
