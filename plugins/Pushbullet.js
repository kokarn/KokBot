'use strict';

let BotPlug = require( './BotPlug.js' );
let PushBullet = require('pushbullet');
let pushbulletConfig = require('../config.js').pushbullet;

class PushbulletBotPlug extends BotPlug {
    constructor( bot ){
        super( bot );

        this.pusher = new PushBullet( pushbulletConfig.apiKey );

        this.detectMessageToUser( this.sendMessage.bind( this ) );
    }

    handlePushbulletRespone(error, response) {
        if (error) {
            console.log('Error!');
            console.log(error);
        } else {
            console.log(response);
        }
    }

    handleMessage(users, from, message) {
        for( let i = 0; i < users.length; i = i + 1 ){
            if( pushbulletConfig.users[ users[ i ] ] ){
                this.sendMessage( pushbulletConfig.users[ users[ i ] ], from,  message );
                console.log('Trying to push message from ' + from + ' to ' + users[i] );
            }
        }
    }

    sendMessage(to, from, message) {
        let messageParts;
        let sendMessage;

        if (message.indexOf('http://') !== -1 || message.indexOf('https://') !== -1) {
            messageParts = message.match(/(http.+)/);

            if (typeof messageParts[0] !== 'undefined' && messageParts[0].length > 7) {
                sendMessage = messageParts[0];

                this.pusher.link(to, from + ' sent you a link in #kokarn', sendMessage, (error) => {
                    if (error) {
                        console.log('Failed to send link, sending as note instead');
                        this.pusher.note(to, from + ' highlighted you in #kokarn', message, this.handlePushbulletRespone);
                    } else {
                        console.log('Link sent to ' + to);
                    }
                });
            }
        } else {
            sendMessage = message;
            this.pusher.note(to, from + ' highlighted you in #kokarn', sendMessage, this.handlePushbulletRespone);
            console.log('Note sent to ' + to);
        }
    }
}
module.exports = PushbulletBotPlug;
