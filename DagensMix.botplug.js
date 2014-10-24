'use strict';
var util = require( 'util' ),
    defaultConfig = {
        response: 'Tack %s! Nu blir det dunkadunka!',
        initMix: 'Kokarn: Lägg in dagens mix!',
        channel: '#kokarn',
        addCommand: '!addmix',
        sayCommand: '!mix',
        listCommand: '!listmix'
    };

function configOption ( config, option ) {
    if ( option in config ) {
        return config[ option ];
    }
    return defaultConfig[ option ];
}

function today () {
    var now = new Date();
    return now - ( now % 86400000 );
}

function DagensMix ( config ) {
    if ( !config ) {
        config = {};
    }
    this.mixes = [];

    this.initMix = configOption( config, 'initMix' );
    this.channel = configOption( config, 'channel' );
    this.addCommand = configOption( config, 'addCommand' );
    this.sayCommand = configOption( config, 'sayCommand' );
    this.listCommand = configOption( config, 'listCommand' );
    this.response = configOption( config, 'response' );

    this.resetTimer = 0;
    this.addMix(this.initMix);

    // start reset timeouts
    this.reset();
}

DagensMix.prototype.reset = function() {
    var instance = this;

    if ( this.dayMixAdded < today() ) {
        this.addMix( this.initMix );
    }

    this.resetTimer = setTimeout( function () {
        instance.reset();
    }, 300000 );
};

DagensMix.prototype.addBot = function( bot ) {
    this.bot = bot;

    var instance = this;

    // say mix
    this.addListener( function ( from, text, message ) {
        if ( text === instance.sayCommand ) {
            instance.say();
        }
    });

    // add mix
    this.addListener( function ( from, text, message ) {
        if ( text.indexOf( instance.addCommand ) === 0 ) {
            var mix = text.substring( instance.addCommand.length );
            instance.add( mix, from );
        }
    });

    // list mixes
    this.addListener( function ( from, text, message ) {
        if ( text === instance.listCommand ) {
            instance.list();
        }
    });
};

DagensMix.prototype.addMix = function ( mix ) {
    this.mixes.push( mix );
    this.currentMix = mix;
    this.dayMixAdded = today();
};

DagensMix.prototype.addListener = function( cb ) {
    this.bot.addListener( 'message' + this.channel, cb );
};

DagensMix.prototype.say = function say() {
    this.bot.say( this.channel, this.currentMix );
};

DagensMix.prototype.add = function add( mix, from ) {
    this.addMix( mix );

    this.bot.say( this.channel, util.format( this.response, from ) );
};

DagensMix.prototype.list = function list() {
    var mixes = this.mixes.filter( function ( item ) {
        return item !== this.initMix;
    }, this );

    this.bot.say( this.channel, mixes.join( '\n' ) );
};

module.exports = DagensMix;
