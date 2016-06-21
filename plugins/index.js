'use strict';

let telegram = require( './telegram.js' );
let urlchecker = require( './urlchecker.js' );
let github = require( './github.js' );
let rss = require( './rss.js' );
let dagensmix = require( './dagensmix.js' );
let pushbullet = require( './pushbullet.js' );
let httpcat = require( './httpcat.js' );

module.exports.telegram = telegram;
module.exports.urlchecker = urlchecker;
module.exports.github = github;
module.exports.rss = rss;
module.exports.dagensmix = dagensmix;
module.exports.pushbullet = pushbullet;
module.exports.httpcat = httpcat;
