'use strict';
var PushBullet = require( 'pushbullet' ),
    pusher = new PushBullet( 'v19INs18gL8IWynPqNbmWXns9TErz4k1aBujz7gGxaa4a' ),
    handlePushbulletRespone = function( error, response ){

    },
    localPushbullet = {
        bot : false,
        names : {
            'kokarn' : 'ujz7gGxaa4adjzWIEVDzOK',
            'gyran' : 'gustav.ahlberg@gmail.com',
            'theseal' : 'johancarlquist@gmail.com',
            'mcgurk' : 'jonathan.wilsson@gmail.com'
        },
        setup : function( bot ){
            var _this = this;

            _this.bot = bot;
            bot.addListener( 'message#kokarn', _this.handleMessage );
        },
        handleMessage : function( from, text, message ){
            var name,
                _this = this;

            for( name in _this.names ){
                if( _this.names.hasOwnProperty( name ) ){
                    if( text.toLowerCase().indexOf( name ) !== -1 ){
                        console.log( 'Trying to push to ' + _this.names[ name ] );
                        if( _this.names[ name ].indexOf( '@' ) !== -1 ){
                            console.log( 'Notification type: Email' );
                            pusher.friendNode( _this.names[ name ], from + ' highlighted you in #kokarn', text, handlePushbulletRespone );
                            console.log( 'Message sent to ' + _this.names[ name ] );
                        } else {
                            console.log( 'Notification type: Default' );
                            pusher.note( _this.names[ name ], from + ' highlighted you in #kokarn', text, handlePushbulletRespone );
                            console.log( 'Message sent to ' + _this.names[ name ] );
                        }
                    }
                }
            }
        }
    };

PushBullet.prototype.friendNode = function friendNote( email, title, body, callback ) {
    this.push({
        email: email,
        type: 'note',
        title: title,
        body: body
    }, callback);
};

module.exports = localPushbullet;
