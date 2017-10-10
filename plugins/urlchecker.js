'use strict';

let contentType = require( 'content-type' );
let iconv = require( 'iconv-lite' );
let request = require( 'request' );
let cheerio = require( 'cheerio' );

let botplug = require( './botplug.js' );
let config = require( '../config.js' );

class urlchecker extends botplug {
    constructor( bot ){
        super( bot );

        if( config.bot.plugins.indexOf( 'urlchecker' ) > -1 ){
            super.detectMessage( this.onMessage.bind( this ) );
        }
    }

    detectEncoding( body ) {
        var $ = cheerio.load( body );
        let metaElement = $( 'meta[charset]' );
        let content;

        if ( metaElement.length ) {
            return metaElement.attr( 'charset' );
        }

        metaElement = $( 'meta[http-equiv="Content-Type"]' );

        if ( metaElement.length ) {
            content = contentType.parse( metaElement.attr( 'content' ) );

            return content.parameters.charset;
        }

        // Nothing found, fall back to UTF-8
        return 'utf8';
    }

    onMessage( from, text, message ) {
        let url;
        let urlRegex = /(https?:\/\/[^\s]+)/g;
        let options = {
            encoding: null,
            headers: {
                'User-Agent': 'request'
            },
            rejectUnauthorized: false
        };

        url = text.match( urlRegex );

        if ( url === null ) {
            return false;
        }

        options.url = url[ 0 ];
        request( options, ( error, response, html ) => {
            let pageTitle;
            let encoding;
            let $;

            if ( error ) {
                console.log( error );
            }

            // Make sure special chars are displayed correctly
            encoding = this.detectEncoding( html );
            html = iconv.decode( html, encoding );
            $ = cheerio.load( html );

            pageTitle = $( 'head title' ).text();

            // Remove all newlines in the title
            pageTitle = pageTitle.replace( /\n/g, ' ' );

            // Remove multiple spaces in the title
            pageTitle = pageTitle.replace( / +(?= )/g, '' );

            this.sendMessageToChannel( message.args[ 0 ], pageTitle );
        });
    }
}

module.exports = urlchecker;
