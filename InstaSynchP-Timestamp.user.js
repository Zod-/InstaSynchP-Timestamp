// ==UserScript==
// @name        InstaSynchP Timestamp
// @namespace   InstaSynchP
// @description Adds timestamps to the chat

// @version     1
// @author      Zod-
// @source      https://github.com/Zod-/InstaSynchP-Timestamp
// @license     MIT

// @include     http://*.instasynch.com/*
// @include     http://instasynch.com/*
// @include     http://*.instasync.com/*
// @include     http://instasync.com/*
// @grant       none
// @run-at      document-start

// @require     https://greasyfork.org/scripts/5647-instasynchp-library/code/InstaSynchP%20Library.js?version=30464
// @require     https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.4/moment.min.js
// ==/UserScript==

function Timestamp(version) {
  "use strict";
  this.version = version;
  this.name = 'InstaSynchP Timestamp';
  this.settings = [{
    'label': 'Timestamp',
    'id': 'chat-timestamp',
    'type': 'checkbox',
    'default': true,
    'section': ['Chat', 'Timestamp']
  }, {
    'label': 'Timestamp Format',
    'id': 'chat-timestamp-format',
    'type': 'text',
    'default': 'hh:mm:ss',
    'size': 10,
    'section': ['Chat', 'Timestamp']
  }];
}

Timestamp.prototype.executeOnce = function () {
  "use strict";
  var th = this;

  function getFormattedText(data, isEmote) {
    var timestamp;
    timestamp = moment.unix(data.unix).format(gmc.get('chat-timestamp-format'));
    if (isEmote) {
      if (gmc.get('chat-timestamp')) {
        return '{0} - {1} {2}'.format(timestamp, data.username, data.message);
      } else {
        return '{0} {1}'.format(data.username, data.message);
      }
    } else {
      if (gmc.get('chat-timestamp')) {
        return '{0} - {1}: '.format(timestamp, data.username);
      } else {
        return '{0}: '.format(data.username);
      }
    }
  }

  //add/remove timestamps when changing the setting
  events.on(th, 'SettingChange[chat-timestamp],SettingChange[chat-timestamp-format]', function () {
    $('#chat-messages').children().each(function () {
      var data, newText;
      data = JSON.parse($(this).attr('data'));
      // /me message
      if ($(this).find('.emote').length > 0) {
        $(this).find('.emote').text(getFormattedText(data, true));
      } else {
        $(this).find('.username').text(getFormattedText(data, false));
      }

    });
    scrollDown();
  });

  events.on(th, 'AddMessage', function (user, message) {
    var now, timestamp, lastMessage, data;
    now = new moment();
    lastMessage = $('#chat-messages > :last-child');
    data = {
      'unix': now.unix(),
      'username': user.username,
      'message': message.replace(/^\/me /, '')
    };

    lastMessage.attr('data', JSON.stringify(data));

    if (lastMessage.find('.emote').length > 0) {
      lastMessage.find('.emote').text(getFormattedText(data, true));
    } else {
      lastMessage.find('.username').text(getFormattedText(data, false));
    }

    if (window.autoscroll) {
      scrollDown();
    }
  });
};

window.plugins = window.plugins || {};
window.plugins.timestamp = new Timestamp('1');
