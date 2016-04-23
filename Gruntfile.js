var grunt = require('grunt');
require('load-grunt-tasks')(grunt);

var files = ['modules/**/*.js', 'middleware/**/*.js', 'routes/**/*.js', 'models/**/*.js', 'test/**/*.js'];

grunt.initConfig({
  mochacli: {
      options: {
          reporter: 'spec',
          bail: false
      },
      all: ['test/modules/*.js', 'test/routes/*.js']
  },
  jshint: {
      files: files,
      options: {
          jshintrc: '.jshintrc'
      }
  },
  jscs: {
      files: {
          src: files
      },
      options: {
          config: '.jscsrc',
          esnext: true
      }
  },
  jsbeautifier: {
      write: {
          files: {
              src: files
          },
          options: {
              config: '.beautifyrc'
          }
      }
  }
});
grunt.registerTask('test', ['mochacli', 'jshint', 'jscs']);
grunt.registerTask('validate', ['jshint', 'jscs']);

