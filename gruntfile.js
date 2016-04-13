module.exports = function( grunt ){
    'use strict';
    grunt.initConfig({
        pkg: grunt.file.readJSON( 'package.json' ),
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

    grunt.registerTask( 'default', [ 'eslint:default', 'eslint:plugins' ] );
};
