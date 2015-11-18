'use strict';
var jschardet = require( 'jschardet' ),
    iconv = require( 'iconv-lite' ),
    request = require( 'request' ),
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
                    encoding: null,
                    headers: {
                        'User-Agent': 'request'
                    }
                };

            url = text.match( urlRegex );

            if( url !== null ){
                options.url = url[ 0 ];
                request( options, function( error, response, html ){
                    var encoding = jschardet.detect( html ),
                        pageTitle,
                        $;

                    if( error ){
                        console.log( error );
                    }

                    // Make sure special chars are displayed correctly
                    html = iconv.decode( html, encoding.encoding );
                    $ = cheerio.load( html );

                    pageTitle = $( 'title' ).text();

                    // Remove all newlines in the title
                    pageTitle = pageTitle.replace( /\n/g, ' ' );

                    // Remove multiple spaces in the title
                    pageTitle = pageTitle.replace( / +(?= )/g, '' );

                    urlChecker.sendMessage( message.args[ 0 ], pageTitle );
                });
            }
        },
        sendMessage : function( channel, message ){
            this.bot.say( channel, message.trim() );
        }
    };

module.exports = urlChecker;
