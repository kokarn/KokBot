module.exports = function( grunt ){
    'use strict';

    var srcFiles = [
        'bot.js',
        '*.botplug.js',
        'Gruntfile.js'
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON( 'package.json' ),
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            src: srcFiles
        },
        jscs: {
            options: {
                config: '.jscsrc'
            },
            src: srcFiles
        }
    });

    grunt.loadNpmTasks( 'grunt-contrib-jshint' );
    grunt.loadNpmTasks( 'grunt-jscs' );

    grunt.registerTask( 'test', [ 'jshint', 'jscs' ] );
    grunt.registerTask( 'default', [ 'test' ] );
};
