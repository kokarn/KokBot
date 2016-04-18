'use strict';
let irc = require( 'irc' );
let plugins = require( './plugins' );

const config = {
    channels: [ '#kokarn' ],
    plugins: [ 'Telegram', 'Urlchecker', 'Github', 'RSS', 'DagensMix' ],
    server: 'irc.freenode.net',
    botName: 'BoilBot'
};

let bot = new irc.Client(
    config.server,
    config.botName,
    {
        channels: config.channels
    }
);

bot.addListener( 'error', function( message ){
    console.log( 'error: ', message );
});

for( let i = 0; i < config.plugins.length; i = i + 1 ){
    if( plugins[ config.plugins[ i ] ] ){
        console.log( 'Starting plugin', config.plugins[ i ] );
        new plugins[ config.plugins[ i ] ]( bot );
    }
}
