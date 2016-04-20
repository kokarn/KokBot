'use strict';

let BotPlug = require( './BotPlug.js' );
let Telegram = require( 'node-telegram-bot-api' );
let config = require( '../config.js' ).telegram;
let telegramClient = new Telegram(
    config.apiKey
);

class HttpCatBotPlug extends BotPlug {
    constructor( bot ){
        super( bot );

        this.catCommand = '!httpcat';

        this.detectCommand( this.catCommand, ( from, text ) => {
            var number = Number( text.substring( this.catCommand.length ) );
            this.sendCat( from, number );
        });
    }

    sendCat( user, cat ){
        telegramClient.sendMessage( config.users[ user.toLowerCase() ], 'https://http.cat/' + cat );
    }

}

module.exports = HttpCatBotPlug;
