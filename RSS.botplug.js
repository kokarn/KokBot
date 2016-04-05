'use strict';
function arrayContainsObjectWithSameDescription( list, obj ){
    var i;
    for( i = 0; i < list.length; i = i + 1 ){
        if( obj.description === list[ i ].description ){
            return true;
        }
    }

    return false;
}

/*
function defaultFormatter( description ){
    return description;
}

function emptyFormatter( description ){
    return '';
}
*/

function EBFormatter( item ){
    var statusRegex = new RegExp( 'Status:(.+?)\<.+?', 'gim' ),
        sourceRegex = new RegExp( 'Source:.+?href="(.+?)"', 'gim' ),
        status = statusRegex.exec( item.description ),
        source = sourceRegex.exec( item.description ),
        extend = require( 'util' )._extend,
        returnObject = extend( {}, item );

    returnObject.formattedTitle = status[ 1 ].trim() + ' | ' + item.title;

    returnObject.formattedDescription = false;

    returnObject.formattedLink = source[ 1 ].trim();

    return returnObject;
}

var feedparser = require( 'feedparser' ),
    request = require( 'request' ),
    rss = {
        bot : false,
        feeds : [
            {
                title: 'LIF Transfers',
                url: 'http://www.eliteprospects.com/rss_team.php?team=28',
                formatter: EBFormatter
            }
        ],
        setup : function( bot ){
            var _this = this;

            _this.bot = bot;

            _this.loadFeeds();
        },
        loadFeed : function( index ){
            var _this = this,
                currentRequest = request( this.feeds[ index ].url ),
                currentFeedParser = new feedparser(),
                printed = 0;

            currentRequest.on( 'error', function( error ){
                console.log( error );
            });

            currentRequest.on( 'response', function( response ){
                var stream = this;

                if( response.statusCode !== 200 ){
                    console.log( 'Bad status code' );
                }

                stream.pipe( currentFeedParser );
            });

            currentFeedParser.on( 'error', function( error ){
                console.log( error );
            });

            currentFeedParser.on( 'readable', function(){
                var stream = this,
                    item,
                    message,
                    formattedItem;

                if( typeof _this.feeds[ index ].items === 'undefined' ){
                    _this.feeds[ index ].items = [];
                }

                while( ( item = stream.read() ) !== null ){

                    // Only print if we haven't seen the item before
                    if( arrayContainsObjectWithSameDescription( _this.feeds[ index ].items, item ) ){
                        console.log( 'Skipping' );
                        continue;
                    }

                    _this.feeds[ index ].items.push( item );

                    // Only print max one item per feed
                    if( printed <= 0 ){
                        formattedItem = _this.feeds[ index ].formatter( item );
                        message = '\u0002' + _this.feeds[ index ].title + '\u000F | ' + formattedItem.formattedTitle;

                        if( formattedItem.formattedDescription ){
                            message = message + '\n' + formattedItem.formattedDescription;
                        }

                        if( formattedItem.formattedLink ){
                            message = message + '\n' + formattedItem.formattedLink;
                        }

                        _this.sendMessage( message );
                        printed = printed + 1;
                    }
                }
            });
        },
        loadFeeds : function(){
            var _this = this,
                i;

            console.log( 'Loading feeds' );

            for( i = 0; i < _this.feeds.length; i = i + 1 ){
                this.loadFeed( i );
            }

            // Load this again in 30 minutes
            setTimeout( _this.loadFeeds.bind( _this ), 1800000 );
        },
        sendMessage : function( message ){
            var channel;

            // Say this in every channel it's connected to
            for( channel in this.bot.opt.channels ){
                if( this.bot.opt.channels.hasOwnProperty( channel ) ){
                    this.bot.say( this.bot.opt.channels[ channel ], message );
                }
            }
        }
    };

module.exports = rss;
