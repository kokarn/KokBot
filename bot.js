// Create the configuration
var config = {
		channels: [ "#kokarn" ],
		server: "irc.freenode.net",
		botName: "KokBot"
	},
	names = [
		'kokarn',
		'gyran'
	],
	irc = require( "irc" ),
	bot = new irc.Client(config.server, config.botName, {
		channels: config.channels
	});

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

// Listen for any message, say to him/her in the room
bot.addListener( "message", function( from, to, text, message ) {
	for( var i = 0; i < names.length; i = i + 1 ){
		if( text.toLowerCase().indexOf( names[ i ] ) !== -1 ){
			bot.say( config.channels[0], 'Detected highlight "' + names[ i ] + '"' );
		} else {
			//console.log( names[ i ] + " in " + text.toLowerCase() + " " + text.toLowerCase().indexOf( names[ i ] ) );
		}
	}
});