/*jslint node: true, white: true */

var config = {
        channels: [ "#kokarn" ],
        server: "irc.freenode.net",
        botName: "KokBot"
    },
/*
 names = [
 'kokarn',
 'gyran'
 ],
 */
    irc = require( "irc" ),
    bot = new irc.Client(config.server, config.botName, {
        channels: config.channels
    }),
    mix = "Kokarn: Lägg in dagens mix!";

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
/*
 bot.addListener( "message", function( from, to, text, message ) {
 "use strict";
 var i;
 for( i = 0; i < names.length; i = i + 1 ){
 if( text.toLowerCase().indexOf( names[ i ] ) !== -1 ){
 //bot.say( config.channels[0], 'Detected highlight "' + names[ i ] + '"' );
 } else {
 //console.log( names[ i ] + " in " + text.toLowerCase() + " " + text.toLowerCase().indexOf( names[ i ] ) );
 }
 }
 });
 */

// say todays mix
bot.addListener( "message", function( from, to, text, message ) {
    "use strict";
    if ( text === "!mix" ) {
        bot.say( config.channels[0], mix );
    }
});

// save todays mix
bot.addListener( "message", function( from, to, text, message ) {
    "use strict";
    if (text.substring(0, 7) === "!addmix") {
        mix = text.substring(8);
        bot.say(config.channels[0], "Tack " + from + " nu blir det dunkadunka!");
    }
});