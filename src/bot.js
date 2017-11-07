import {} from 'dotenv/config'
import Discord from 'discord.js'
import config from './config.js'
import axios from 'axios'
import capitalize from 'lodash/capitalize'
import {} from 'colors'

const ax = axios.create({
  baseURL: 'http://de.wikipedia.org/api/rest_v1/',
  timeout: 1000,
  headers: {'User-Agent': 'decay42DiscordBot/1.0 (liberry@ymail.com)'}
})

const bot = new Discord.Client()

function parseCommand (message) {
  const commandRegEx = /!([^\s]+)(?:\s(.*))?/
  const paramsRegEx = /(\S+)/g
  let [, command, paramsStr] = commandRegEx.exec(message)
  let params = []
  if (paramsStr) {
    params = paramsRegEx[Symbol.match](paramsStr)
  }
  return [command, params]
}

function isValidCommand (cmd, params) {
  return (
    params.length >= cmd.minParams
  )
}

const commands = {
  wiki: {
    usage (channel) {
      channel.send(`**Usage:** !wiki <search term>`)
    },
    minParams: 1,
    execute (channel, query) {
      query = query.map(e => capitalize(e)).join('_')
      ax
        .get(`/page/summary/${query}`)
        .then(response => {
          const result = response.data
          let thumbnail = null

          if (result.thumbnail) {
            thumbnail = new Discord.Attachment(result.thumbnail.source)
          }
          const message = result.extract // `${result.extract}\n\nhttp://de.wikipedia.org/wiki/${result.title.replace(' ', '_')}`
          channel.send(message, thumbnail)
        })
        .catch(err => {
          if (err.response.status === 404) {
            channel.send(`*Kein Artikel zum Suchbegriff "${query}" gefunden.*`)
          } else {
            console.error(err.response)
          }
        })
    }
  }
}

bot
  .on('ready', () => {
    let serverList = []
    for (var server of bot.guilds.values()) {
      serverList.push(' » ' + server.name)
    }
    let readyAt = bot.readyAt.toLocaleTimeString()
    console.log(` CONNECTED `.bgGreen.black +
      ` [${readyAt}] Successfully connected to the following servers:`.green +
      `\n${serverList.join('\n')}`.green)
  })
  //
  .on('message', message => {
    if (message.author.id === bot.user.id) {
      return // always ignore self-messages
    }
    if (message.content.startsWith('!')) {
      let [command, params] = parseCommand(message.content)
      if (command in commands) {
        const cmd = commands[command]
        if (isValidCommand(cmd, params)) {
          cmd.execute(message.channel, params)
        } else {
          cmd.usage(message.channel)
        }
      }
    }
  })

bot.login(config.token)

process.on('unhandledRejection', (error) => {
  console.error(error)
  process.exit(1)
})
