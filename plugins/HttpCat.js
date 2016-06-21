'use strict';

let BotPlug = require( './BotPlug.js' );
let Telegram = require( 'node-telegram-bot-api' );
let config = require( '../config.js' );

class HttpCatBotPlug extends BotPlug {
    constructor( bot ){
        super( bot );

        this.dependencies = [ 'Telegram' ];
        this.catCommand = '!httpcat';

        if( config.bot.plugins.indexOf( 'httpcat' ) > -1 ){
            if( !this.hasDependencies( config, this.dependencies ) ){
                console.log( 'Plugin HttpCat depends on one or more plugins not included. Skipping.' );
            } else {
                this.setup();
            }
        }
    }

    setup(){
        this.telegramClient = new Telegram(
            config.telegram.apiKey
        );

        this.detectCommand( this.catCommand, ( from, text ) => {
            var number = Number( text.substring( this.catCommand.length ) );
            this.sendCat( from, number );
        });
    }

    sendCat( user, cat ){
        this.telegramClient.sendMessage( config.users[ user.toLowerCase() ], 'https://http.cat/' + cat );
    }

}

module.exports = HttpCatBotPlug;
