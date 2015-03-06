// ==UserScript==
// @name        InstaSynchP Timestamp
// @namespace   InstaSynchP
// @description Adds timestamps to the chat

// @version     1.0.1
// @author      Zod-
// @source      https://github.com/Zod-/InstaSynchP-Timestamp
// @license     MIT

// @include     *://instasync.com/r/*
// @include     *://*.instasync.com/r/*
// @grant       none
// @run-at      document-start

// @require     https://greasyfork.org/scripts/5647-instasynchp-library/code/InstaSynchP%20Library.js?version=37716
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
    'default': '\\[hh:mm\\] ',
    'size': 10,
    'section': ['Chat', 'Timestamp']
  }, {
    'id': 'timestamp-format-reset',
    'type': 'hidden',
    'value': 'true'
  }];
}

Timestamp.prototype.executeOnce = function () {
  "use strict";
  var th = this;

  //one time reset for people who already got it installed
  //remove after couple weeks or so
  if (gmc.get('timestamp-format-reset')) {
    gmc.set('timestamp-format-reset', '');
    gmc.set('chat-timestamp-format', '\\[hh:mm\\] ');
    gmc.save();
  }

  //add/remove timestamps when changing the setting
  events.on(th, 'SettingChange[chat-timestamp],SettingChange[chat-timestamp-format]', function () {
    $('.timestamp').each(function () {
      var unix, timestamp;
      unix = $(this).attr('unix');
      timestamp = moment.unix(unix).format(gmc.get('chat-timestamp-format'));
      $(this).css('display', gmc.get('chat-timestamp') ? 'initial' : 'none').text(timestamp);
    });
    scrollDown();
  });

  events.on(th, 'AddMessage', function (user, message) {
    //filtered greynames don't get added at all
    if (!isUdef(user.loggedin) && !user.loggedin && room.filterGreyname) {
      return;
    }

    try {
      var unix, timestamp, span;
      //create the timestamp
      unix = moment().unix();
      timestamp = moment.unix(unix).format(gmc.get('chat-timestamp-format'));
      //create the span
      span = $('<span>', {
          'unix': unix,
          'class': 'timestamp'
        }).text(timestamp).css('margin', '0px 6px 0px -6px')
        .css('display', gmc.get('chat-timestamp') ? 'initial' : 'none');
      //add it
      $('#chat_messages >:last-child >:first-child').before(span);
      //scroll chat down since the longer line can cause a line break
      if (window.room.autoscroll) {
        scrollDown();
      }
    } catch (err) {
      //ignore?
      //when (new moment()) fails because of a loading issue
      //it causes a endless spam of errors in chat
    }
  });
};

window.plugins = window.plugins || {};
window.plugins.timestamp = new Timestamp('1.0.1');
