'use strict';

const config = require( '../config.js' );

class botplug {
    constructor( bot ) {
        this.bot = bot;

        this.names = [];

        for ( const configKey in config ) {
            if ( !config[ configKey ].users ) {
                continue;
            }

            for ( const username in config[ configKey ].users ) {
                this.names.push( username );
            }
        }

        this.names = [ ...new Set( this.names ) ];
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

    sendMessageToAllChannels( message ){
        for( let i = 0; i < this.bot.opt.channels.length; i = i + 1 ){
            this.sendMessageToChannel( this.bot.opt.channels[ i ], message );
        }
    }

    sendMessageToChannel( channel, message ) {
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

    detectCommand( command, callback ){
        this.detectMessage( ( from, text, message ) => {
            if( text.trim().indexOf( command ) === 0 ){
                callback( from, text, message );
            }
        });
    }

    checkIfMessageToUser( from, channel, message ){
        let formattedMessage = message.toLowerCase();
        let namesInMessage = [];
        let formattedFrom = from.toLowerCase();
        let validNamesInMessage = [];

        // Add any user that might be in the channel
        for( let i = 0; i < this.names.length; i = i + 1 ){
            if( formattedMessage.indexOf( this.names[ i ] ) > -1 ){
                if( namesInMessage.indexOf( this.names[ i ] ) === -1 ){
                    namesInMessage.push( this.names[ i ] );
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

    normalizeName( name ){
        if( name.substr( -1 ) === '_' ){
            name = name.substr( 0, name.length - 1 );
        }

        return name;
    }

    normalizeNames( nameList ){
        let normalizedNames = [];

        for( let i = 0; i < nameList.length; i = i + 1 ){
            normalizedNames.push( this.normalizeName( nameList[ i ] ) );
        }

        return normalizedNames;
    }

    getUsersInChannel( channel ){
        let usernames = [];

        for( let i = 0; i < this.names[ channel ].length; i = i + 1 ){
            usernames.push( this.names[ channel ][ i ] );
        }

        return usernames;
    }

    getUsernames(){
        return this.names;
    }

    getAllUsers(){
        let usernames = [];
        for ( let channel in this.names ) {
            if ( this.names.hasOwnProperty( channel ) ) {
                usernames = usernames.concat( this.getUsersInChannel( channel ) );
            }
        }

        usernames = this.normalizeNames( usernames );

        usernames = usernames.filter( ( value, index, self ) => {
            return self.indexOf( value ) === index;
        } );

        return usernames;
    }

    hasDependencies( config, dependencies ){
        for( let i = 0; i < dependencies.length; i = i + 1 ){
            if( config.bot.plugins.indexOf( dependencies[ i ] ) < 0 ){
                return false;
            }
        }

        return true;
    }
}

module.exports = botplug;
