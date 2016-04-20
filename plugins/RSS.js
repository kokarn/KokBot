'use strict';

let BotPlug = require( './BotPlug.js' );
let feedparser = require( 'feedparser' );
let request = require( 'request' );
let extend = require( 'util' )._extend;
let iconv = require( 'iconv-lite' );

class RSSBotPlug extends BotPlug {
    constructor( bot ){
        super( bot );

        this.feeds = [
            {
                title: 'LIF Transfers',
                url: 'http://www.eliteprospects.com/rss_team.php?team=28',
                formatter: 'eliteprospects',
                encoding: 'iso-8859-1'
            }
        ];

        this.loadFeeds();
    }

    loadFeed( feed ) {
        let currentRequest = request( feed.url );
        let currentFeedParser = new feedparser();
        let printed = 0;

        console.log( 'Loading feed', feed.title );

        currentRequest.on('error', (error) => {
            console.log(error);
        });

        currentRequest.on('response', (response) => {
            let charset;

            if (response.statusCode !== 200) {
                console.log('Bad status code');
            }

            charset = this.getParams( response.headers['content-type'] || '' ).charset;
            response = this.maybeConvert( response, charset, this.feeds[index].encoding );

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
            }

            while ((item = currentFeedParser.read()) !== null) {
                // Only print if we haven't seen the item before
                if (this.arrayContainsObjectWithSameDescription( feed.items, item )) {
                    console.log('Skipping');
                    continue;
                }

                feed.items.push(item);

                // Only print max one item per feed
                if (printed <= 0) {
                    formattedItem = this.format( item, feed.formatter );
                    message = '\u0002' + feed.title + '\u000F | ' + formattedItem.formattedTitle;

                    if (formattedItem.formattedDescription) {
                        message = message + '\n' + formattedItem.formattedDescription;
                    }

                    if (formattedItem.formattedLink) {
                        message = message + '\n' + formattedItem.formattedLink;
                    }

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
        let returnObject = extend({}, item);

        switch ( formatter ) {
            case 'eliteprospects': {
                let statusRegex = new RegExp('Status:(.+?)\<.+?', 'gim');
                let sourceRegex = new RegExp('Source:.+?href="(.+?)"', 'gim');
                let status = statusRegex.exec(item.description);
                let source = sourceRegex.exec(item.description);

                returnObject.formattedTitle = status[1].trim() + ' | ' + item.title;
                returnObject.formattedDescription = false;
                returnObject.formattedLink = source[1].trim();

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

module.exports = RSSBotPlug;
