'use strict';
var request = require( 'request' ),
    cheerio = require( 'cheerio' ),
    urlChecker = {
        bot : false,
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
            var url,
                urlRegex = /(https?:\/\/[^\s]+)/g,
                options = {
                    headers: {
                        'User-Agent': 'request'
                    }
                };

            url = text.match( urlRegex );

            if( url !== null ){
                options.url = url[ 0 ];
                request( options, function( error, response, html ){
                    var $ = cheerio.load( html ),
                        pageTitle;

                    if( error ){
                        console.log( error );
                    }

                    pageTitle = $( 'title' ).text();

                    urlChecker.sendMessage( message.args[ 0 ], pageTitle );
                });
            }
        },
        sendMessage : function( channel, message ){
            this.bot.say( channel, message.trim() );
        }
    };

module.exports = urlChecker;
