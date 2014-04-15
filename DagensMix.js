'use strict';
var util = require( 'util' ),
    defaultConfig = {
        response: 'Tack %s! Nu blir det dunkadunka!',
        initMix: 'Kokarn: Lägg in dagens mix!',
        channel: '#kokarn',
        addCommand: '!addmix',
        sayCommand: '!mix'
    };

function configOption ( config, option ) {
    if ( option in config ) {
        return config[option];
    }
    return defaultConfig[option];
}

function DagensMix ( config ) {
    if ( !config ) {
        config = {};
    }

    this.bot = bot;
    this.currentMix = configOption( config, 'initMix' );
    this.mixes = [];
    this.channel = configOption( config, 'channel' );
    this.addCommand = configOption( config, 'addCommand' );
    this.sayCommand = configOption( config, 'sayCommand' );
    this.response = configOption( config, 'response' );
}

DagensMix.prototype.addBot = function(bot) {
    this.bot = bot;

    var instance = this;
    // say mix
    this.addListener( function ( from, text, message) {
        if (text === instance.sayCommand) {
            instance.say();
        }
    });

    // add mix
    this.addListener( function ( from, text, message) {
        if ( text.indexOf( instance.addCommand ) === 0 ) {
            var mix = text.substring( instance.addCommand.length );
            instance.add( mix, from );
        }
    });
};

DagensMix.prototype.addListener = function(cb) {
    this.bot.addListener( 'message' + this.channel, cb);
};

DagensMix.prototype.say = function say () {
    this.bot.say( this.channel, this.currentMix );
}

DagensMix.prototype.add = function( mix, from ) {
    this.mixes.push(this.currentMix);
    this.currentMix = mix;

    this.bot.say( this.channel, util.format(this.response, from));
};

module.exports = DagensMix;

