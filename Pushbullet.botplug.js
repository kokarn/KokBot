'use strict';
var PushBullet = require( 'pushbullet' ),
    pusher = new PushBullet( 'v19INs18gL8IWynPqNbmWXns9TErz4k1aBujz7gGxaa4a' ),
    handlePushbulletRespone = function( error, response ){
        if( error ){
            console.log( 'Error!' );
            console.log( error );
        } else {
            console.log( response );
        }
    },
    localPushbullet = {
        bot : false,
        nameList : {
            kokarn : 'ujz7gGxaa4adjzWIEVDzOK',
            gyran : 'gustav.ahlberg@gmail.com',
            theseal : 'johancarlquist@gmail.com',
            mcgurk : 'jonathan.wilsson@gmail.com',
            gust1n : 'jocke.gustin@gmail.com'
        },
        aliasList : {
            gustin : 'gust1n',
            sälen : 'theseal',
            jwilsson : 'mcgurk'
        },
        setup : function( bot ){
            var _this = this,
                channel;

            _this.bot = bot;
            for( channel in _this.bot.opt.channels ){
                if( _this.bot.opt.channels.hasOwnProperty( channel ) ){
                    bot.addListener( 'message' + this.bot.opt.channels[ channel ], _this.handleMessage );
                }
            }

        },
        handleMessage : function( from, text, message ){
            var name,
                _this = localPushbullet,
                namesInMessage = [],
                i,
                formattedText = text.toLowerCase();

            for( name in _this.nameList ){
                if( _this.nameList.hasOwnProperty( name ) ){
                    if( formattedText.indexOf( name ) !== -1 ){
                        if( namesInMessage.indexOf( name ) === -1 ){
                            namesInMessage.push( name );
                        }
                    }
                }
            }

            for( name in _this.aliasList ){
                if( _this.aliasList.hasOwnProperty( name ) ){
                    if( formattedText.indexOf( name ) !== -1 ){
                        if( namesInMessage.indexOf( name ) === -1 ){
                            namesInMessage.push( _this.aliasList[ name ] );
                        }
                    }
                }
            }

            for( i = 0; i < namesInMessage.length; i = i + 1 ){
                if( namesInMessage[ i ] === from.toLowerCase() ){
                    console.log( 'Found a message from ' + from + ' with ' + from + ' in it, skipping push to that recipient.' );
                } else {
                    console.log( 'Trying to push message from ' + from + ' to ' + namesInMessage[ i ] + ' (' + _this.nameList[ namesInMessage[ i ] ] + ')' );
                    _this.sendMessage( _this.nameList[ namesInMessage[ i ] ], from, text );
                }
            }
        },
        sendMessage : function( to, from, message ){
            var messageParts,
                sendMessage;

            if( message.indexOf( 'http://' ) !== -1 || message.indexOf( 'https://' ) !== -1 ){
                messageParts = message.match( /(http.+)/ );

                if( typeof messageParts[ 0 ] !== 'undefined' && messageParts[ 0 ].length > 7 ){
                    sendMessage = messageParts[ 0 ];

                    pusher.link( to, from + ' sent you a link in #kokarn', sendMessage, function( error, response ){
                        if( error ){
                            console.log( 'Failed to send link, sending as note instead' );
                            pusher.note( to, from + ' highlighted you in #kokarn', message, handlePushbulletRespone );
                        } else {
                            console.log( 'Link sent to ' + to );
                        }
                    } );
                }
            } else {
                sendMessage = message;
                pusher.note( to, from + ' highlighted you in #kokarn', sendMessage, handlePushbulletRespone );
                console.log( 'Note sent to ' + to );
            }
        }
    };

module.exports = localPushbullet;
