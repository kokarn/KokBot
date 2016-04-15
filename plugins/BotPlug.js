'use strict';

class BotPlug {
    constructor( bot ) {
        this.bot = bot;

        this.aliasList = {
            gustin : 'gust1n',
            sälen : 'theseal',
            jwilsson : 'mcgurk'
        };

        this.names = {};

        this.setupNameDetection();
    }

    setupNameDetection(){
        this.bot.addListener( 'names', ( channel, nicks ) => {
            this.names[ channel ] = [];

            for( let name in nicks ){
                this.names[ channel ].push( name.toLowerCase() );
            }
        } );

        this.bot.addListener( 'join', ( channel, nick ) => {
            if( this.names[ channel ] ){
                this.names[ channel ].push( nick.toLowerCase() );
            }
        } );

        this.bot.addListener( 'quit', ( nick, reason, channels ) => {
            for( let i = 0; i < channels.length; i = i + 1 ){
                let channel = channels[ i ];

                if( this.names[ channel ] ){
                    this.names[ channel ].splice( this.names[ channel ].indexOf( nick ), 1 );
                }
            }
        } );

        this.bot.addListener( 'part', ( channel, nick ) => {
            if( this.names[ channel ] ){
                this.names[ channel ].splice( this.names[ channel ].indexOf( nick ), 1 );
            }
        } );

        this.bot.addListener( 'kick', ( channel, nick ) => {
            if( this.names[ channel ] ){
                this.names[ channel ].splice( this.names[ channel ].indexOf( nick ), 1 );
            }
        } );

        this.bot.addListener( 'kill', ( nick, reason, channels ) => {
            for( let i = 0; i < channels.length; i = i + 1 ){
                let channel = channels[ i ];

                if( this.names[ channel ] ){
                    this.names[ channel ].splice( this.names[ channel ].indexOf( nick ), 1 );
                }
            }
        } );

        this.bot.addListener( 'nick', ( oldnick, newnick, channels ) => {
            for( let i = 0; i < channels.length; i = i + 1 ){
                let channel = channels[ i ];

                if( this.names[ channel ] ){
                    this.names[ channel ][ this.names[ channel ].indexOf( oldnick ) ] = newnick.toLowerCase();
                }
            }
        } );
    }

    sendMessage( channel, message ) {
        this.bot.say( channel, message.trim() );
    }

    detectMessage( callback ){
        // callback gets called with nick, text, message
        for( let channel in this.bot.opt.channels ){
            if( this.bot.opt.channels.hasOwnProperty( channel ) ){
                this.bot.addListener( 'message' + this.bot.opt.channels[ channel ], callback );
            }
        }
    }

    detectMessageToUser( callback ){
        this.detectMessage( ( nick, text, message ) => {
            let usersInMessage = this.checkIfMessageToUser( nick, message.args[ 0 ], text );
            if( usersInMessage.length > 0 ){
                callback( usersInMessage, nick, text );
            }
        });
    }

    checkIfMessageToUser( from, channel, message ){
        let formattedMessage = message.toLowerCase();
        let namesInMessage = [];
        let formattedFrom = from.toLowerCase();
        let validNamesInMessage = [];

        // Add any user that might be in the channel
        for( let i = 0; i < this.names[ channel ].length; i = i + 1 ){
            if( formattedMessage.indexOf( this.names[ channel ][ i ] ) > -1 ){
                if( namesInMessage.indexOf( this.names[ channel ][ i ] ) === -1 ){
                    namesInMessage.push( this.names[ channel ][ i ] );
                }
            }
        }

        // Add some aliases
        for( let name in this.aliasList ){
            if( formattedMessage.indexOf( name ) !== -1 ){
                if( namesInMessage.indexOf( name ) === -1 ){
                    namesInMessage.push( this.aliasList[ name ] );
                }
            }
        }

        // Remove the sender if it's there
        for( let i = 0; i < namesInMessage.length; i = i + 1 ){
            if( namesInMessage[ i ] === formattedFrom ){
                console.log( 'Found a message from ' + from + ' with ' + from + ' in it, skipping that user.' );
            } else {
                validNamesInMessage.push( namesInMessage[ i ] );
            }
        }

        return validNamesInMessage;
    }
}

module.exports = BotPlug;
