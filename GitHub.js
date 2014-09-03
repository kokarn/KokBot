'use strict';
var https = require( 'https' ),
    GitHub = {
        users : {
            kokarn : {
                nick : 'Kokarn',
                id : false
            },
            gyran : {
                nick: 'Gyran',
                id : false
            },
            theseal: {
                nick : 'TheSeal',
                id : false
            },
            jwilsson : {
                nick : 'McGurk',
                id : false
            }
        },
        loadInterval : false,
        githubConfig : false,
        start : function(){
            GitHub.getAllUsers();

            this.loadInterval = setInterval( function(){
                GitHub.getAllUsers();
            }, 60000 );
        },
        setup : function( bot ){
            this.githubConfig = require( './githubconfig.json' )[ 0 ];
            this.bot = bot;

            if( this.githubConfig === false ){
                console.log( 'Failed to load github config, skipping github setup' );
            } else {
                this.start();
            }
        },
        handleResponse : function( responseData, user ){
            var message = false,
                commitText = 'commit';

            if( this.users[ user ].id !== false ){
                switch( responseData[ 0 ].type ){
                    case 'PushEvent':

                        if( responseData[ 0 ].payload.commits.length > 1 ){
                            commitText = commitText + 's';
                        }

                        message = this.users[ user ].nick + ' pushed ' + responseData[ 0 ].payload.commits.length + ' ' + commitText + ' to ' + responseData[ 0 ].repo.name;
                        break;
                    case 'CreateEvent':
                        switch( responseData[ 0 ].payload.ref_type ){
                            case 'repository':
                                message = this.users[ user ].nick + ' created repository ' + responseData[ 0 ].repo.name;
                                break;
                            case 'branch':
                            default:
                                break;
                        }
                        break;
                    case 'PullRequestEvent' :
                        message = this.users[ user ].nick + ' created a pull request for ' + responseData[ 0 ].repo.name + ' titled "' + responseData[ 0 ].payload.pull_request.title + '"';
                        break;
                    case 'IssuesEvent':
                        switch( responseData[ 0 ].payload.action ){
                            case 'opened':
                                message = this.users[ user ].nick + ' created an issue for ' + responseData[ 0 ].repo.name + ' titled "' + responseData[ 0 ].payload.issue.title + '"';
                                break;
                            default:
                                break;
                        }
                        break;
                    case 'IssueCommentEvent':
                        //message = this.users[ user ].nick + ' commented on an issue for ' + responseData[ 0 ].repo.name;
                        //break;
                    default:
                        break;
                }
            }

            this.users[ user ].id = responseData[ 0 ].id;

            if( message !== false ){
                this.say( message );
            }
        },
        say : function( message ){
            message = '\u0002GitHub:\u000F ' + message;

            // Say this in every channel it's connected to
            for( var channel in this.bot.opt.channels ){
                if( this.bot.opt.channels.hasOwnProperty( channel ) ){
                    this.bot.say( this.bot.opt.channels[ channel ], message );
                }
            }
        },
        getAllUsers : function(){
            for( var user in GitHub.users ){
                if( GitHub.users.hasOwnProperty( user ) ){
                    GitHub.getUserEvents( user );
                }
            }
        },
        getUserEvents : function( user ){
            var latestResponse = '',
                latestParsedResponse = '';

            https.get( {
                    hostname: 'api.github.com',
                    port: 443,
                    path: '/users/' + user + '/events?client_id=' + this.githubConfig.client_id + '&client_secret=' + this.githubConfig.client_secret,
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Kokarn'
                    }
                }, function( response ) {
                    console.log( 'Got response ' + response.statusCode + ' for user "' + user + '". Request remaining until reset: ' + response.headers[ 'x-ratelimit-remaining' ] );

                    response.on( 'data' , function( chunk ) {
                        latestResponse = latestResponse + chunk.toString();
                    });

                    response.on( 'error' , function( data ) {
                        console.log( data );
                    });

                    response.on( 'end', function(){
                        latestParsedResponse = JSON.parse( latestResponse );

                        if( latestParsedResponse[ 0 ].id !== GitHub.users[ user ].id ){
                            GitHub.handleResponse( latestParsedResponse, user );
                        }
                    });
                }
            );
        }
    };

module.exports = GitHub;
