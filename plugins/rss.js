'use strict';

let botplug = require( './botplug.js' );
let feedparser = require( 'feedparser' );
let request = require( 'request' );
let iconv = require( 'iconv-lite' );
let config = require( '../config.js' );

class rss extends botplug {
    constructor( bot ){
        super( bot );

        this.feeds = config.rss.feeds;

        if( config.bot.plugins.indexOf( 'rss' ) > -1 ){
            this.loadFeeds();
        }
    }

    loadFeed( feed ) {
        let currentRequest = request( feed.url );
        let currentFeedParser = new feedparser();
        let printed = 0;
        let isNewFeed = false;

        console.log( 'Loading feed', feed.title );

        currentRequest.on('error', (error) => {
            console.log(error);
        });

        currentRequest.on('response', (response) => {
            let charset;

            if (response.statusCode !== 200) {
                console.log('Bad status code');
            }

            // Check if it's with some other encoding than utf-8
            if( feed.encoding ){
                charset = this.getParams( response.headers['content-type'] || '' ).charset;
                response = this.maybeConvert( response, charset, feed.encoding );
            }

            response.pipe(currentFeedParser);
        });

        currentFeedParser.on('error', (error) => {
            console.log(error);
        });

        currentFeedParser.on('readable', () => {
            var item,
                message,
                formattedItem;

            if (typeof feed.items === 'undefined') {
                feed.items = [];
                isNewFeed = true;
            }

            while ((item = currentFeedParser.read()) !== null) {
                // Only print if we haven't seen the item before
                if (this.arrayContainsObjectWithSameDescription( feed.items, item )) {
                    console.log('Skipping');
                    continue;
                }

                feed.items.push(item);

                // Only print max one item per feed
                if (printed <= 0 && !isNewFeed) {
                    formattedItem = this.format( item, feed.formatter );
                    message = '\u0002' + feed.title + '\u000F | ';

                    message = message + formattedItem.title;

                    if ( formattedItem.description ) {
                        message = message + '\n' + formattedItem.description;
                    }

                    message = message + '\n' + formattedItem.link;

                    this.sendMessageToAllChannels( message );
                    printed = printed + 1;
                }
            }
        });
    }

    maybeConvert( response, charset, currentEncoding ) {
        // Use iconv if its not utf8 already.
        if ( !/utf-*8/i.test( charset ) ) {
            try {
                let converterStream = iconv.decodeStream( currentEncoding );
                response = response.pipe( converterStream );
            } catch( error ) {
                response.emit( 'error', error );
            }
        }

        return response;
    }

    getParams( string ) {
        var params = string.split(';').reduce(
            function (params, param) {
                var parts = param.split('=').map(
                    function (part) {
                        return part.trim();
                    }
                );

                if (parts.length === 2) {
                    params[parts[0]] = parts[1];
                }
                return params;
            }, {}
        );

        return params;
    }

    arrayContainsObjectWithSameDescription(list, obj) {
        var i;
        for (i = 0; i < list.length; i = i + 1) {
            if (obj.description === list[i].description) {
                return true;
            }
        }

        return false;
    }

    format( item, formatter ){
        let returnObject = Object.assign( {}, item );

        returnObject.rawTitle = returnObject.title;
        returnObject.rawDescription = returnObject.description;
        returnObject.rawLink = returnObject.link;

        returnObject.description = false;

        switch ( formatter ) {
            case 'eliteprospects': {
                let statusRegex = new RegExp('Status:(.+?)\<.+?', 'gim');
                let sourceRegex = new RegExp('Source:.+?href="(.+?)"', 'gim');
                let status = statusRegex.exec(item.description);
                let source = sourceRegex.exec(item.description);

                returnObject.title = status[1].trim() + ' | ' + item.title;
                returnObject.link = source[1].trim();

                break;
            }
            case 'empty': {
                break;
            }
            default: {
                break;
            }
        }

        return returnObject;
    }

    loadFeeds() {
        for ( let i = 0; i < this.feeds.length; i = i + 1 ) {
            // Run it once
            this.loadFeed( this.feeds[ i ] );

            // Set interval to run it on the defined interval or every 30 minutes
            setInterval( this.loadFeed.bind( this, this.feeds[ i ] ), this.feeds[ i ].interval || 1800000 );
        }
    }
}

module.exports = rss;
