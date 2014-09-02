'use strict';
var util = require( 'util' ),
    https = require( 'https' ),
    GitHub = {
        userActions : {
            'kokarn': false,
            'gyran' : false,
            'theseal' : false,
            'jwilsson' : false
        },
        channel : '#kokarndev',
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

            if( this.userActions[ user ] !== false ){
                switch( responseData[ 0 ].type ){
                    case 'PushEvent':

                        if( responseData[ 0 ].payload.commits.length > 1 ){
                            commitText = commitText + 's';
                        }

                        message = responseData[ 0 ].actor.login + ' pushed ' + responseData[ 0 ].payload.commits.length + ' ' + commitText + ' to ' + responseData[ 0 ].repo.name;
                        break;
                    case 'CreateEvent':
                        switch( responseData[ 0 ].payload.ref_type ){
                            case 'repository':
                                message = responseData[ 0 ].actor.login + ' created repository ' + responseData[ 0 ].repo.name;
                                break;
                            case 'branch':
                            default:
                                break;
                        }
                        break;
                    case 'PullRequestEvent' :
                        message = responseData[ 0 ].actor.login + ' created a pull request for ' + responseData[ 0 ].repo.name + ' titled "' + responseData[ 0 ].payload.pull_request.title + '"';
                        break;
                    case 'IssueCommentEvent':
                    default:
                        break;
                }
            }

            this.userActions[ user ] = responseData[ 0 ].id;

            if( message !== false ){
                this.say( message );
            }
        },
        say : function( message ){
            this.bot.say( this.channel, message );
        },
        getAllUsers : function(){
            for( var user in GitHub.userActions ){
                if( GitHub.userActions.hasOwnProperty( user ) ){
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

                        if( latestParsedResponse[ 0 ].id !== GitHub.userActions[ user ] ){
                            GitHub.handleResponse( latestParsedResponse, user );
                        }
                    });
                }
            );
        }
    };

module.exports = GitHub;
