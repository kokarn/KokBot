'use strict';
var config = {
        channels: [ '#kokarn' ],
        server: 'irc.freenode.net',
        botName: 'BoilBot'
    },
    irc = require( 'irc' ),
    bot = new irc.Client( config.server, config.botName, {
        channels: config.channels
    } ),
    dagensMix = new ( require( './DagensMix.botplug.js' ) )(),
    gitHub = require( './GitHub.botplug.js' ),
    pushbullet = require( './Pushbullet.botplug.js' ),
    rss = require( './RSS.botplug.js' ),
    urlchecker = require( './Urlchecker.botplug.js' );

dagensMix.addBot( bot );
gitHub.setup( bot );
pushbullet.setup( bot );
urlchecker.setup( bot );
rss.setup( bot );

bot.addListener( 'error', function( message ){
    console.log( 'error: ', message );
});
