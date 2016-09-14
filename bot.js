'use strict';
let Notifyy = require( 'node-notifyy' );
let irc = require( 'irc' );
let plugins = require( './plugins' );
let config = require( './config.js' );

let notifyy = new Notifyy({
    users: config.notifyy,
    title: 'KokBot crashed!'
});

try {
    let bot = new irc.Client(
        config.bot.server,
        config.bot.botName,
        {
            channels: config.bot.channels
        }
    );

    for( let i = 0; i < config.bot.channels.length; i = i + 1 ){
        console.log( 'Joining', config.bot.channels[ i ], 'as', config.bot.botName );
    }

    bot.addListener( 'error', function( message ){
        console.log( 'error: ', message );
    });

    for( let i = 0; i < config.bot.plugins.length; i = i + 1 ){
        if( plugins[ config.bot.plugins[ i ] ] ){
            console.log( 'Starting plugin', config.bot.plugins[ i ] );
            new plugins[ config.bot.plugins[ i ] ]( bot );
        }
    }

} catch ( error ){
    notifyy.send( error );
}
