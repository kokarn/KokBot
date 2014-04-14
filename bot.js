var config = {
        channels: [ '#kokarn' ],
        server: 'irc.freenode.net',
        botName: 'KokBot'
    },
    irc = require( 'irc' ),
    bot = new irc.Client(config.server, config.botName, {
        channels: config.channels
    }),
    mix = 'Kokarn: Lägg in dagens mix!',
    names = {
        'kokarn' : 'ujz7gGxaa4adjzWIEVDzOK',
        'gyran' : 'gustav.ahlberg@gmail.com',
        'theseal' : 'carlquist@gmail.com'
    },
    PushBullet = require( 'pushbullet' ),
    pusher = new PushBullet( 'v19INs18gL8IWynPqNbmWXns9TErz4k1aBujz7gGxaa4a' );

    PushBullet.prototype.friendNode = function friendNote( email, title, body, callback ) {
        this.push({
            email: email,
            type: 'note',
            title: title,
            body: body
        }, callback);
    };

/*
 // Listen for joins
 bot.addListener("join", function(channel, who) {
 // Welcome them in!
 bot.say(channel, who + "...dude...welcome back!");
 });
 */

/*
 // Listen for any message, PM said user when he posts
 bot.addListener( "message", function(from, to, text, message) {
 bot.say(from, "¿Que?");
 });
 */

bot.addListener( 'message#kokarn', function( from, text, message ) {
    'use strict';
    var name;
    for( name in names ){
        if( names.hasOwnProperty( name ) ){
            if( text.toLowerCase().indexOf( name ) !== -1 ){
                console.log( 'Trying to push to ' + names[ name ] );
                if( names[ name ].indexOf( '@' ) !== -1 ){
                    console.log( 'Notification type: Email' );
                    pusher.friendNode( names[ name ], 'Message from #kokarn', text, function( error, response ) {
                        //console.log( 'Error: %j', error );
                        //console.log( response );
                    });
                    console.log( 'Message sent to ' + names[ name ] );
                } else {
                    console.log( 'Notification type: Default' );
                    pusher.note( names[ name ], 'Message from #kokarn', text, function( error, response ){
                        //console.log( error );
                        //console.log( response );
                    });
                    console.log( 'Message sent to ' + names[ name ] );
                }
            }
        }
    }
});

// say todays mix
bot.addListener( 'message', function( from, to, text, message ) {
    'use strict';
    if ( text === '!mix' ) {
        bot.say( config.channels[ 0 ], mix );
    }
});

// save todays mix
bot.addListener( 'message#kokarn', function( from, text, message ) {
    'use strict';
    if ( text.substring( 0, 7 ) === '!addmix' ) {
        mix = text.substring( 8 );
        bot.say( config.channels[ 0 ], 'Tack ' + from + ' nu blir det dunkadunka!' );
    }
});

bot.addListener( 'error', function( message ) {
    'use strict';
    console.log( 'error: ', message );
});