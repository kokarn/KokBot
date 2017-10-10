'use strict';

let TelegramAPI = require( 'node-telegram-bot-api' );
let config = require( '../config.js' );
let botplug = require( './botplug.js' );

class telegram extends botplug {
    constructor( bot ){
        super( bot );

        if( config.bot.plugins.indexOf( 'telegram' ) > -1 ){
            this.telegramClient = new TelegramAPI(
                config.telegram.apiKey,
                {
                    polling: true
                }
            );

            super.detectMessageToUser( this.onUserMessage.bind( this ) );

            this.telegramClient.on( 'message', ( msg ) => {
                var chatId = msg.chat.id;

                this.telegramClient.sendMessage( chatId, 'Chat id: ' + chatId );
            });
        }
    }

    onUserMessage( users, from, message ){
        for( let i = 0; i < users.length; i = i + 1 ){
            if( config.telegram.users[ users[ i ] ] ){
                this.telegramClient.sendMessage( config.telegram.users[ users[ i ] ], '[' + from + '] ' + message );
                console.log( 'Telegram sent to ' + config.telegram.users[ users[ i ] ] );
            }
        }
    }
}

module.exports = telegram;
