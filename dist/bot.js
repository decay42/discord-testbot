'use strict';

var _discord = require('discord.js');

var _discord2 = _interopRequireDefault(_discord);

var _config = require('./config.js');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bot = new _discord2.default.Client();

bot.on('ready', function () {
  var serverList = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = bot.guilds.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var server = _step.value;

      serverList.push('  ' + server.name);
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

  console.log('Successfully connected to the following servers:\n' + serverList.join('\n'));
});

bot.on('message', function (message) {
  console.log(message);
});

bot.login(_config2.default.token);

process.on('unhandledRejection', console.error);