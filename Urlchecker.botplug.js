'use strict';
var contentType = require( 'content-type' ),
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
        detectEncoding: function( body ){
            var $ = cheerio.load( body ),
                metaElement = $( 'meta[charset]' ),
                content;

            if( metaElement.length ){
                return metaElement.attr( 'charset' );
            }

            metaElement = $( 'meta[http-equiv="Content-Type"]' );
            if( metaElement.length ){
                content = contentType.parse( metaElement.attr( 'content' ) );

                return content.parameters.charset;
            }

            // Nothing found, fall back to UTF-8
            return 'utf8';
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
                    var pageTitle,
                        encoding,
                        $;

                    if( error ){
                        console.log( error );
                    }

                    // Make sure special chars are displayed correctly
                    encoding = urlChecker.detectEncoding( html );
                    html = iconv.decode( html, encoding );
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
