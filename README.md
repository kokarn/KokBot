KokBot
======

[![Build Status](https://travis-ci.org/kokarn/KokBot.svg?branch=master)](https://travis-ci.org/kokarn/KokBot)

Just a basic node bot for our irc channel.

It sports a pretty decent plugin system with the following support:

* Notifications via [Telegram](https://telegram.org)
* Notifications via [Pushbullet](https://www.pushbullet.com)
* RSS Feed subscriptions and notifications
* Todays music mix
* Github activity monitoring and notification
* Url identification
* Http status codes as cats over Telgram

If you want to build your own plugin, look at the HttpCat plugin. That's the basics

## Installing
`npm i`

OSX might need [extra things for iconv](https://github.com/mooz/node-icu-charset-detector#osx)
```
brew install icu4c
brew link icu4c --force
```


Example `config.js`

```javascript
'use strict';

module.exports = {
    bot: {
        channels: [ '#mychannel' ],
        plugins: [ 'Telegram', 'Urlchecker', 'Github', 'RSS', 'DagensMix', 'Pushbullet', 'HttpCat' ],
        server: 'irc.freenode.net',
        botName: 'mybotname'
    },
    github: {
        clientId: "",
        clientSecret: "",
        users: {
            usernameOnIrc: 'username-on-github'
        }
    },
    twitter: {
        consumerKey: "",
        consumerSecret: "",
        accessToken: "",
        accessTokenSecret: ""
    },
    pushbullet: {
        apiKey: '',
        users: {
            usernameOnIrc: 'email-or-id-on-pushbullet'
        }
    },
    telegram: {
        apiKey: '',
        users: {
            usernameOnIrc : 'client-id-on-telegram'
        }
    },
    rss: {
        feeds: [
            {
                title: 'My first RSS feed',
                url: 'http://www.example.com/feed.rss',
                formatter: 'my-custom-formatter',
                encoding: 'iso-8859-1'
            },
            {
                title: 'My second RSS feed',
                url: 'https://www.example2.github.com/messages.rss',
                interval: 60000
            }
        ]
    }
};
```

Developed with regrets by [@Kokarn](https://github.com/kokarn/), [@gyran](https://github.com/gyran/) & [@jwilsson](https://github.com/jwilsson/)
