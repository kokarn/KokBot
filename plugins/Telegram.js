'use strict';

let Telegram = require( 'node-telegram-bot-api' );
let config = require( '../config.js' ).telegram;
let BotPlug = require( './BotPlug.js' );
let telegramClient = new Telegram(
    config.apiKey,
    {
        polling: true
    }
);

class TelegramBotPlug extends BotPlug {
    constructor( bot ){
        super( bot );

        super.detectMessageToUser( this.onUserMessage );

        telegramClient.on( 'message', function( msg ){
            var chatId = msg.chat.id;

            telegramClient.sendMessage( chatId, 'Chat id: ' + chatId );
        });
    }

    onUserMessage( users, from, message ){
        for( let i = 0; i < users.length; i = i + 1 ){
            if( config.users[ users[ i ] ] ){
                telegramClient.sendMessage( config.users[ users[ i ] ], '[' + from + ']: ' + message );
                console.log( 'Telegram sent to ' + config.users[ users[ i ] ] );
            }
        }
    }
}

module.exports = TelegramBotPlug;
