'use strict';
var config = {
        channels: [ '#kokarn' ],
        server: 'irc.freenode.net',
        botName: 'KokBot'
    },
    irc = require( 'irc' ),
    bot = new irc.Client(config.server, config.botName, {
        channels: config.channels
    }),
    names = {
        'kokarn' : 'ujz7gGxaa4adjzWIEVDzOK',
        'gyran' : 'gustav.ahlberg@gmail.com',
        'theseal' : 'johancarlquist@gmail.com',
        'mcgurk' : 'ujBOoNP894SsjzWIEVDzOK'
    },
    PushBullet = require( 'pushbullet' ),
    pusher = new PushBullet( 'v19INs18gL8IWynPqNbmWXns9TErz4k1aBujz7gGxaa4a' ),
    handlePushbulletRespone = function( error, response ){

    },
    dagensMix = new ( require( './DagensMix.js' ) )(),
    gitHub = require( './GitHub.js' );

PushBullet.prototype.friendNode = function friendNote( email, title, body, callback ) {
    this.push({
        email: email,
        type: 'note',
        title: title,
        body: body
    }, callback);
};

dagensMix.addBot( bot );
gitHub.setup( bot );

bot.addListener( 'message#kokarn', function( from, text, message ) {
    var name;
    for( name in names ){
        if( names.hasOwnProperty( name ) ){
            if( text.toLowerCase().indexOf( name ) !== -1 ){
                console.log( 'Trying to push to ' + names[ name ] );
                if( names[ name ].indexOf( '@' ) !== -1 ){
                    console.log( 'Notification type: Email' );
                    pusher.friendNode( names[ name ], from + ' highlighted you in #kokarn', text, handlePushbulletRespone );
                    console.log( 'Message sent to ' + names[ name ] );
                } else {
                    console.log( 'Notification type: Default' );
                    pusher.note( names[ name ], from + ' highlighted you in #kokarn', text, handlePushbulletRespone );
                    console.log( 'Message sent to ' + names[ name ] );
                }
            }
        }
    }
});

bot.addListener( 'error', function( message ) {
    console.log( 'error: ', message );
});
