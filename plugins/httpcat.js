'use strict';

let botplug = require( './botplug.js' );
let Telegram = require( 'node-telegram-bot-api' );
let config = require( '../config.js' );

class httpcat extends botplug {
    constructor( bot ){
        super( bot );

        this.dependencies = [ 'telegram' ];
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
            if( number > 0 ){
                this.sendCat( from, number );
            }
        });
    }

    sendCat( user, cat ){
        this.telegramClient.sendMessage( config.telegram.users[ user.toLowerCase() ], 'https://http.cat/' + cat );
    }

}

module.exports = httpcat;
