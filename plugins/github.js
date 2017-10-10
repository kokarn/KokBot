'use strict';
let https = require( 'https' );
let botplug = require( './botplug.js' );
let config = require('../config.js');

class github extends botplug {
    constructor( bot ){
        super( bot );

        this.characters = {
            'lastMessage': '┗',
            'message': '┣'
        };

        this.useridCache = {};

        this.loadInterval = false;

        if( config.bot.plugins.indexOf( 'github' ) > -1 ){
            if (config.github === false) {
                console.log('Failed to load github config, can\'t start');
            } else {
                this.start();
            }
        }
    }

    start() {
        this.getAllUsers();

        this.loadInterval = setInterval(() => {
            this.getAllUsers();
        }, 60000);
    }

    rightPad( myString, size, character ) {
        myString = myString.toString();

        while (myString.length < size) {
            myString = myString + character;
        }

        return myString;
    }

    apiUrlToRealUrl( apiUrl ) {
        var realUrl = apiUrl.replace( 'api.github', 'github' );

        realUrl = realUrl.replace( '/repos/', '/' );

        return realUrl;
    }

    handleResponse( responseData, user ) {
        var message = false,
            commitText = 'commit',
            messageStart,
            commitMessage,
            i;

        if ( this.useridCache[ user ] && this.useridCache[ user ] !== responseData[ 0 ].id ) {
            responseData[0].repo.html_url = this.apiUrlToRealUrl(responseData[0].repo.url);

            switch (responseData[0].type) {
                case 'PushEvent':

                    if (responseData[0].payload.commits.length > 1) {
                        commitText = commitText + 's';
                    }

                    message = user + ' pushed ' + responseData[0].payload.commits.length + ' ' + commitText + ' to ' + responseData[0].repo.html_url;
                    for (i = 0; i < responseData[0].payload.commits.length; i = i + 1) {
                        messageStart = '    ';
                        if (i === responseData[0].payload.commits.length - 1) {
                            messageStart = messageStart + this.characters.lastMessage + '   ';
                        } else {
                            messageStart = messageStart + this.characters.message + '   ';
                        }

                        commitMessage = responseData[0].payload.commits[i].message.replace(/(\r\n|\n\r|\n\n|\r\r|\r|\n)/gm, this.rightPad('\n', messageStart.length + 1, ' '));

                        message = message + '\n' + messageStart + commitMessage;
                    }
                    break;
                case 'CreateEvent':
                    switch (responseData[0].payload.ref_type) {
                        case 'repository':
                            message = user + ' created repository ' + responseData[0].repo.html_url;
                            break;
                        case 'branch':
                            message = user + ' created a branch for ' + responseData[0].repo.name + ' called ' + responseData[0].payload.ref;
                            break;
                        case 'tag':
                            message = user + ' created a tag for ' + responseData[0].repo.name + ' called ' + responseData[0].payload.ref;
                            break;
                        default:
                            break;
                    }
                    break;
                case 'PullRequestEvent':
                    switch (responseData[0].payload.action) {
                        case 'opened':
                            message = user + ' created a pull request for ' + responseData[0].repo.name + ' titled "' + responseData[0].payload.pull_request.title + '" (' + responseData[0].payload.pull_request.html_url + ')';
                            break;
                        default:
                            break;
                    }
                    break;
                case 'IssuesEvent':
                    switch (responseData[0].payload.action) {
                        case 'opened':
                            message = user + ' created an issue for ' + responseData[0].repo.name + ' titled "' + responseData[0].payload.issue.title + '" (' + responseData[0].payload.issue.html_url + ')';
                            break;
                        default:
                            break;
                    }
                    break;
                case 'ForkEvent':
                    message = user + ' forked repository ' + responseData[0].payload.forkee.name + ' from ' + responseData[0].repo.name;
                    break;
                case 'IssueCommentEvent':
                    //message = this.users[ user ].nick + ' commented on an issue for ' + responseData[ 0 ].repo.name;
                    //break;
                    /* falls through */
                default:
                    break;
            }
        }

        this.useridCache[ user ] = responseData[0].id;

        if ( message !== false ) {
            this.say( message );
        }
    }

    say( message ) {
        message = '\u0002GitHub:\u000F ' + message;

        super.sendMessageToAllChannels( message );
    }

    getAllUsers() {
        let index = 0;
        let usernames = super.getUsernames();

        for( let i = 0; i < usernames.length; i = i + 1 ){

            // Replace with optional aliases
            if( config.github.users && config.github.users[ usernames[ i ] ] ){
                usernames[ i ] = config.github.users[ usernames[ i ] ]
            }

            setTimeout(
                this.getUserEvents.bind( this, usernames[ i ] ),
                index * 1000
            );

            index = index + 1;
        }
    }

    getUserEvents( user ) {
        var latestResponse = '',
            latestParsedResponse = '',
            request,
            options = {
                hostname: 'api.github.com',
                port: 443,
                path: encodeURI( '/users/' + user + '/events?client_id=' + config.github.clientId + '&client_secret=' + config.github.clientSecret ),
                method: 'GET',
                headers: {
                    'User-Agent': 'KokBot'
                }
            };

        request = https.get( options );

        request.on('error', (data) => {
            console.log(data);
        });

        request.on('response', (response) => {
            console.log('Got response ' + response.statusCode + ' for user "' + user + '". Request remaining until reset: ' + response.headers['x-ratelimit-remaining']);

            if (response.statusCode !== 200) {
                return false;
            }

            response.on('data', (chunk) => {
                latestResponse = latestResponse + chunk.toString();
            });

            response.on('end', () => {

                try {
                    latestParsedResponse = JSON.parse(latestResponse);
                } catch (error) {
                    console.log(error);
                    return false;
                }

                if ( typeof latestParsedResponse[ 0 ] !== 'undefined' && typeof latestParsedResponse[ 0 ].id !== 'undefined' ) {
                    this.handleResponse(latestParsedResponse, user);
                }
            });
        });
    }
}

module.exports = github;
