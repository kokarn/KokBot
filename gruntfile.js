module.exports = function( grunt ){
    'use strict';
    grunt.initConfig({
        pkg: grunt.file.readJSON( 'package.json' ),
        watch: {
            plugins: {
                files: [ 'plugins/**/*.js' ],
                tasks: [ 'eslint:plugins' ]
            },
            bot: {
                files: [ 'bot.js' ],
                tasks: [ 'eslint:default' ]
            }
        },
        eslint: {
            default: {
                src: [ 'bot.js' ]
            },
            plugins: {
                src: [ 'plugins/**/*.js' ]
            }
        }
    });

    require( 'load-grunt-tasks' )( grunt );

    grunt.registerTask( 'test', [ 'eslint:default', 'eslint:plugins' ] );
};
