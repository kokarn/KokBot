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
            theseal : {
                nick : 'TheSeal',
                id : false
            },
            jwilsson : {
                nick : 'McGurk',
                id : false
            },
            gust1n : {
                nick : 'gust1n',
                id : false
            }
        },
        loadInterval : false,
        githubConfig : false,
        characters : {
            'lastMessage' : '┗',
            'message' : '┣'
        },
        start : function(){
            GitHub.getAllUsers();

            this.loadInterval = setInterval( function(){
                GitHub.getAllUsers();
            }, 60000 );
        },
        setup : function( bot ){
            this.githubConfig = require( './config.js' ).github;
            this.bot = bot;

            if( this.githubConfig === false ){
                console.log( 'Failed to load github config, skipping github setup' );
            } else {
                this.start();
            }
        },
        rightPad : function( myString, size, character ){
            myString = myString.toString();

            while( myString.length < size ) {
                myString = myString + character;
            }

            return myString;
        },
        apiUrlToRealUrl : function( apiUrl ){
            var realUrl = apiUrl.replace( 'api.github', 'github' );

            realUrl = realUrl.replace( '/repos/', '/' );

            return realUrl;
        },
        handleResponse : function( responseData, user ){
            // We can't use camelCase here because of the vars coming from GitHub
            /*jshint camelcase: false */
            var message = false,
                commitText = 'commit',
                messageStart,
                commitMessage,
                i;

            if( this.users[ user ].id !== false ){
                responseData[ 0 ].repo.html_url = this.apiUrlToRealUrl( responseData[ 0 ].repo.url );

                switch( responseData[ 0 ].type ){
                    case 'PushEvent':

                        if( responseData[ 0 ].payload.commits.length > 1 ){
                            commitText = commitText + 's';
                        }

                        message = this.users[ user ].nick + ' pushed ' + responseData[ 0 ].payload.commits.length + ' ' + commitText + ' to ' + responseData[ 0 ].repo.html_url;
                        for( i = 0; i < responseData[ 0 ].payload.commits.length; i = i + 1 ){
                            messageStart = '    ';
                            if( i === responseData[ 0 ].payload.commits.length - 1 ){
                                messageStart = messageStart + this.characters.lastMessage + '   ';
                            } else {
                                messageStart = messageStart + this.characters.message + '   ';
                            }

                            commitMessage = responseData[ 0 ].payload.commits[ i ].message.replace( /(\r\n|\n\r|\n\n|\r\r|\r|\n)/gm, this.rightPad( '\n', messageStart.length + 1, ' ' ) );

                            message = message + '\n' + messageStart + commitMessage;
                        }
                        break;
                    case 'CreateEvent':
                        switch( responseData[ 0 ].payload.ref_type ){
                            case 'repository':
                                message = this.users[ user ].nick + ' created repository ' + responseData[ 0 ].repo.html_url;
                                break;
                            case 'branch':
                                message = this.users[ user ].nick + ' created a branch for ' + responseData[ 0 ].repo.html_url + ' called ' + responseData[ 0 ].payload.ref;
                                break;
                            case 'tag':
                                message = this.users[ user ].nick + ' created a tag for ' + responseData[ 0 ].repo.html_url + ' called ' + responseData[ 0 ].payload.ref;
                                break;
                            default:
                                break;
                        }
                        break;
                    case 'PullRequestEvent' :
                        message = this.users[ user ].nick + ' created a pull request for ' + responseData[ 0 ].repo.html_url + ' titled "' + responseData[ 0 ].payload.pull_request.title + '"';
                        break;
                    case 'IssuesEvent':
                        switch( responseData[ 0 ].payload.action ){
                            case 'opened':
                                message = this.users[ user ].nick + ' created an issue for ' + responseData[ 0 ].repo.html_url + ' titled "' + responseData[ 0 ].payload.issue.title + '"';
                                break;
                            default:
                                break;
                        }
                        break;
                    case 'ForkEvent':
                        message = this.users[ user ].nick + ' forked repository ' + responseData[ 0 ].payload.forkee.name + ' from ' + responseData[ 0 ].repo.name;
                        break;
                    case 'IssueCommentEvent':
                        //message = this.users[ user ].nick + ' commented on an issue for ' + responseData[ 0 ].repo.name;
                        //break;
                        /* falls through */
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
            var channel;

            message = '\u0002GitHub:\u000F ' + message;

            // Say this in every channel it's connected to
            for( channel in this.bot.opt.channels ){
                if( this.bot.opt.channels.hasOwnProperty( channel ) ){
                    this.bot.say( this.bot.opt.channels[ channel ], message );
                }
            }
        },
        getAllUsers : function(){
            var index = 0,
                user;

            for( user in GitHub.users ){
                if( GitHub.users.hasOwnProperty( user ) ){
                    setTimeout( GitHub.getUserEvents( user ), index * 1000 );
                    index = index + 1;
                }
            }
        },
        getUserEvents : function( user ){
            var latestResponse = '',
                latestParsedResponse = '',
                request;

            request = https.get({
                hostname: 'api.github.com',
                port: 443,
                path: '/users/' + user + '/events?client_id=' + this.githubConfig.clientId + '&client_secret=' + this.githubConfig.clientSecret,
                method: 'GET',
                headers: {
                    'User-Agent': 'KokBot'
                }
            });

            request.on( 'error', function( data ){
                console.log( data );
            });

            request.on( 'response', function( response ){
                console.log( 'Got response ' + response.statusCode + ' for user "' + user + '". Request remaining until reset: ' + response.headers[ 'x-ratelimit-remaining' ] );

                if( response.statusCode !== 200 ){
                    console.log( 'INVALID RESPONSE, service might be unavailable' );
                    return false;
                }

                response.on( 'data' , function( chunk ){
                    latestResponse = latestResponse + chunk.toString();
                });

                response.on( 'end', function(){

                    try {
                        latestParsedResponse = JSON.parse( latestResponse );
                    } catch ( error ) {
                        console.log( error );
                        return false;
                    }

                    if( typeof latestParsedResponse[ 0 ].id !== 'undefined' && latestParsedResponse[ 0 ].id !== GitHub.users[ user ].id ){
                        GitHub.handleResponse( latestParsedResponse, user );
                    }
                });
            });
        }
    };

module.exports = GitHub;
