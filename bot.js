'use strict';
let irc = require( 'irc' );
let plugins = require( './plugins' );

const config = {
    channels: [ '#kokarn' ],
    plugins: [ 'Telegram', 'Urlchecker', 'Github', 'RSS', 'DagensMix', 'Pushbullet', 'HttpCat' ],
    server: 'irc.freenode.net',
    botName: 'BoilBot'
};

if( process.argv.indexOf( '--dev' ) > -1 ){
    console.log( 'Starting in debug mode' );
    config.channels[ 0 ] = config.channels[ 0 ] + 'dev';
    config.botName = config.botName + 'dev';
}

let bot = new irc.Client(
    config.server,
    config.botName,
    {
        channels: config.channels
    }
);

for( let i = 0; i < config.channels.length; i = i + 1 ){
    console.log( 'Joining', config.channels[ i ], 'as', config.botName );
}

bot.addListener( 'error', function( message ){
    console.log( 'error: ', message );
});

for( let i = 0; i < config.plugins.length; i = i + 1 ){
    if( plugins[ config.plugins[ i ] ] ){
        console.log( 'Starting plugin', config.plugins[ i ] );
        new plugins[ config.plugins[ i ] ]( bot );
    }
}
