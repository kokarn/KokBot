'use strict';

let util = require('util');
let twitterAPI = require('node-twitter-api');
let validUrl = require('valid-url');

let BotPlug = require( './BotPlug.js' );
let config = require( '../config.js' );

class DagensMixBotPlug extends BotPlug {
    constructor( bot ){
        super( bot );

        this.mixes = [];

        this.initMix = 'Kokarn: Lägg in dagens mix!';
        this.addCommand = '!addmix';
        this.sayCommand = '!mix';
        this.listCommands = ['!listmix', '!mixlist'];
        this.response = 'Tack %s! Nu blir det dunkadunka!';
        this.failResponse = 'Sorry %s! Det där är ingen URL så det blir inge me de!';

        this.resetTimer = 0

        if( config.bot.plugins.indexOf( 'dagensmix' ) > -1 ){
            this.setup();
        }
    }

    setup() {
        this.detectCommand( this.sayCommand, ( from, text, message ) => {
            if( this.currentMix ){
                this.sendMessageToChannel( message.args[ 0 ], this.currentMix );
            } else {
                this.sendMessageToChannel( message.args[ 0 ], this.initMix );
            }
        });

        for ( let i = 0; i < this.listCommands.length; i = i + 1) {
            this.detectCommand( this.listCommands[ i ], ( from, text, message ) => {
                this.list( message.args[ 0 ] );
            });
        }

        this.detectCommand( this.addCommand, ( from, text, message ) => {
            var mix = text.substring( this.addCommand.length ).trim();
            if( validUrl.isUri( mix ) ){
                this.add( mix, from, message.args[ 0 ] );
            } else {
                this.sendMessageToChannel( message.args[ 0 ], util.format( this.failResponse, from ) );
                console.log( 'Not adding', mix, 'as a mix because it\'s not a valid URI' );
            }
        });

        // start reset timeouts
        this.reset();
    }

    reset() {
        if (this.dayMixAdded < today()) {
            this.currentMix = false;
        }

        this.resetTimer = setTimeout(() => {
            this.reset();
        }, 300000 );
    }

    tweetMix(mix) {
        let twitter = new twitterAPI({
            consumerKey: config.twitter.consumerKey,
            consumerSecret: config.twitter.consumerSecret
        });

        twitter.statuses('update', {
                status: mix
            },
            config.twitter.accessToken,
            config.twitter.accessTokenSecret,
            ( error, data ) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Tweet successfull');
                    console.log(data);
                }
            }
        );
    }

    addMix(mix) {
        this.mixes.push(mix);
        this.currentMix = mix;
        this.dayMixAdded = today();

        this.tweetMix(mix);
    }

    list( channel ) {
        var mixes = this.mixes.filter( (item) => {
            return item !== this.initMix;
        }, this );

        this.sendMessageToChannel( channel, mixes.join( '\n' ) );
    }

    add( mix, from, channel ) {
        this.addMix( mix );

        this.sendMessageToChannel( channel, util.format( this.response, from ) );
    }
}

function today() {
    var now = new Date();
    return now - (now % 86400000);
}

module.exports = DagensMixBotPlug;
