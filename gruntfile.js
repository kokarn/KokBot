module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON( 'package.json' ),
        jshint: {
            all: [
                'Gruntfile.js',
                'bot.js',
                'DagensMix.js',
                'GitHub.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        }
    });

    grunt.loadNpmTasks( 'grunt-contrib-jshint' );

    grunt.registerTask( 'test', [ 'jshint' ] );
    grunt.registerTask( 'default', [ 'test' ] );
};
