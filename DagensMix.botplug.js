'use strict';
var util = require( 'util' ),
    twitterAPI = require( 'node-twitter-api' ),
    defaultConfig = {
        response: 'Tack %s! Nu blir det dunkadunka!',
        initMix: 'Kokarn: Lägg in dagens mix!',
        channel: '#kokarn',
        addCommand: '!addmix',
        sayCommand: '!mix',
        listCommands: [ '!listmix', '!mixlist' ]
    };

function configOption( config, option ){
    if ( option in config ) {
        return config[ option ];
    }
    return defaultConfig[ option ];
}

function today(){
    var now = new Date();
    return now - ( now % 86400000 );
}

function DagensMix( config ){
    if( !config ) {
        config = {};
    }

    this.mixes = [];

    this.initMix = configOption( config, 'initMix' );
    this.channel = configOption( config, 'channel' );
    this.addCommand = configOption( config, 'addCommand' );
    this.sayCommand = configOption( config, 'sayCommand' );
    this.listCommands = configOption( config, 'listCommands' );
    this.response = configOption( config, 'response' );

    this.resetTimer = 0;

    // start reset timeouts
    this.reset();
}

DagensMix.prototype.reset = function(){
    var instance = this;

    if ( this.dayMixAdded < today() ) {
        this.currentMix = false;
    }

    this.resetTimer = setTimeout( function(){
        instance.reset();
    }, 300000 );
};

DagensMix.prototype.addBot = function( bot ){
    this.bot = bot;

    var instance = this;

    // say mix
    this.addListener( function( from, text, message ){
        if ( text === instance.sayCommand ) {
            instance.say();
        }
    });

    // add mix
    this.addListener( function( from, text, message ){
        if ( text.indexOf( instance.addCommand ) === 0 ) {
            var mix = text.substring( instance.addCommand.length );
            instance.add( mix, from );
        }
    });

    // list mixes
    this.addListener( function( from, text, message ){
        for( var i = 0; i < instance.listCommands.length; i = i + 1 ){
            if ( text === instance.listCommands[ i ] ) {
                instance.list();
            }
        }
    });
};

DagensMix.prototype.tweetMix = function( mix ){
    var config = require( './config.json' )[ 0 ],
        twitter = new twitterAPI({
            consumerKey : config.twitterConsumerKey,
            consumerSecret : config.twitterConsumerSecret
        });

    twitter.statuses( 'update', {
            status: mix
        },
        config.twitterAccessToken,
        config.twitterAccessTokenSecret,
        function( error, data, response ){
            if( error ) {
                console.log( error );
            } else {
                console.log( 'Tweet successfull' );
                console.log( data );
            }
        }
    );
};

DagensMix.prototype.addMix = function( mix ){
    this.mixes.push( mix );
    this.currentMix = mix;
    this.dayMixAdded = today();

    this.tweetMix( mix );
};

DagensMix.prototype.addListener = function( cb ){
    this.bot.addListener( 'message' + this.channel, cb );
};

DagensMix.prototype.say = function say(){
    this.bot.say( this.channel, this.currentMix || this.initMix );
};

DagensMix.prototype.add = function add( mix, from ){
    this.addMix( mix );

    this.bot.say( this.channel, util.format( this.response, from ) );
};

DagensMix.prototype.list = function list(){
    var mixes = this.mixes.filter( function( item ){
        return item !== this.initMix;
    }, this );

    this.bot.say( this.channel, mixes.join( '\n' ) );
};

module.exports = DagensMix;
