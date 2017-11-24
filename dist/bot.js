'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

require('dotenv/config');

var _discord = require('discord.js');

var _discord2 = _interopRequireDefault(_discord);

var _config = require('./config.js');

var _config2 = _interopRequireDefault(_config);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _capitalize = require('lodash/capitalize');

var _capitalize2 = _interopRequireDefault(_capitalize);

require('colors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ax = _axios2.default.create({
  baseURL: 'http://de.wikipedia.org/api/rest_v1/',
  timeout: 1000,
  headers: { 'User-Agent': 'decay42DiscordBot/1.0 (liberry@ymail.com)' }
});

var bot = new _discord2.default.Client();

function parseCommand(message) {
  var commandRegEx = /!([^\s]+)(?:\s(.*))?/;
  var paramsRegEx = /(\S+)/g;

  var _commandRegEx$exec = commandRegEx.exec(message),
      _commandRegEx$exec2 = _slicedToArray(_commandRegEx$exec, 3),
      command = _commandRegEx$exec2[1],
      paramsStr = _commandRegEx$exec2[2];

  var params = [];
  if (paramsStr) {
    params = paramsRegEx[Symbol.match](paramsStr);
  }
  return [command, params];
}

function isValidCommand(cmd, params) {
  return params.length >= cmd.minParams;
}

var commands = {
  wiki: {
    usage: function usage(channel) {
      channel.send('**Usage:** !wiki <search term>');
    },

    minParams: 1,
    execute: function execute(channel, query) {
      query = query.map(function (e) {
        return (0, _capitalize2.default)(e);
      }).join('_');
      ax.get('/page/summary/' + query).then(function (response) {
        var result = response.data;
        var thumbnail = null;

        if (result.thumbnail) {
          thumbnail = new _discord2.default.Attachment(result.thumbnail.source);
        }
        var message = result.extract; // `${result.extract}\n\nhttp://de.wikipedia.org/wiki/${result.title.replace(' ', '_')}`
        channel.send(message, thumbnail);
      }).catch(function (err) {
        if (err.response.status === 404) {
          channel.send('*Kein Artikel zum Suchbegriff "' + query + '" gefunden.*');
        } else {
          console.error(err.response);
        }
      });
    }
  }
};

bot.on('ready', function () {
  var serverList = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = bot.guilds.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var server = _step.value;

      serverList.push(' » ' + server.name);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var readyAt = bot.readyAt.toLocaleTimeString();
  console.log(' CONNECTED '.bgGreen.black + (' [' + readyAt + '] Successfully connected to the following servers:').green + ('\n' + serverList.join('\n')).green);
})
//
.on('message', function (message) {
  if (message.author.bot) {
    return; // always ignore self-messages
  }
  if (message.content.startsWith('!')) {
    var _parseCommand = parseCommand(message.content),
        _parseCommand2 = _slicedToArray(_parseCommand, 2),
        command = _parseCommand2[0],
        params = _parseCommand2[1];

    if (command in commands) {
      var cmd = commands[command];
      if (isValidCommand(cmd, params)) {
        cmd.execute(message.channel, params);
      } else {
        cmd.usage(message.channel);
      }
    }
  }
});

bot.login(_config2.default.token);

process.on('unhandledRejection', function (error) {
  console.error(error);
  process.exit(1);
});