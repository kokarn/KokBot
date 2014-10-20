'use strict';
var PushBullet = require( 'pushbullet' ),
    pusher = new PushBullet( 'v19INs18gL8IWynPqNbmWXns9TErz4k1aBujz7gGxaa4a' ),
    handlePushbulletRespone = function( error, response ){
        if( error ){
            console.log( 'Error!' );
            console.log( error );
        } else {
            console.log( response );
        }
    },
    localPushbullet = {
        bot : false,
        nameList : {
            'kokarn' : 'ujz7gGxaa4adjzWIEVDzOK',
            'gyran' : 'gustav.ahlberg@gmail.com',
            'theseal' : 'johancarlquist@gmail.com',
            'mcgurk' : 'jonathan.wilsson@gmail.com'
        },
        setup : function( bot ){
            var _this = this;

            _this.bot = bot;
            for( var channel in _this.bot.opt.channels ){
                if( _this.bot.opt.channels.hasOwnProperty( channel ) ){
                    bot.addListener( 'message' + this.bot.opt.channels[ channel ], _this.handleMessage );
                }
            }

        },
        handleMessage : function( from, text, message ){
            var name,
                _this = localPushbullet;

            for( name in _this.nameList ){
                if( _this.nameList.hasOwnProperty( name ) ){
                    if( text.toLowerCase().indexOf( name ) !== -1 ){
                        console.log( 'Trying to push to ' + _this.nameList[ name ] );
                        _this.sendMessage( _this.nameList[ name ], from, text );
                    }
                }
            }
        },
        sendMessage : function( to, from, message ){
            pusher.note( to, from + ' highlighted you in #kokarn', message, handlePushbulletRespone );
            console.log( 'Message sent to ' + to );
        }
    };

/*
PushBullet.prototype.friendNode = function friendNote( email, title, body, callback ) {
    this.push( {
        email: email,
        type: 'note',
        title: title,
        body: body
    }, callback );
};
*/

module.exports = localPushbullet;
