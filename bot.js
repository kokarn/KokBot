'use strict';
var config = {
        channels: [ '#kokarn' ],
        server: 'irc.freenode.net',
        botName: 'KokBot'
    },
    irc = require( 'irc' ),
    bot = new irc.Client( config.server, config.botName, {
        channels: config.channels
    } ),
    dagensMix = new ( require( './DagensMix.botplug.js' ) )(),
    gitHub = require( './GitHub.botplug.js' ),
    pushbullet = require( './Pushbullet.botplug.js' );

dagensMix.addBot( bot );
gitHub.setup( bot );
pushbullet.setup( bot );

bot.addListener( 'error', function( message ) {
    console.log( 'error: ', message );
});
