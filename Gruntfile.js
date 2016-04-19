var grunt = require('grunt');
require('load-grunt-tasks')(grunt);

var files = ['modules/**/*.js', 'middleware/**/*.js', 'routes/**/*.js', 'models/**/*.js', 'test/**/*.js'];

grunt.initConfig({
  mochacli: {
      mockTests: {
          options: {
            reporter: 'spec',
            g: '.*-mock',
            bail: false
        },
        all: ['test/modules/*.js', 'test/routes/*.js']
      },
      liveTests: {
          options: {
            reporter: 'spec',
            g: '.*-live',
            bail: false
        },
        all: ['test/modules/*.js', 'test/routes/*.js']
      },
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
grunt.registerTask('ci', ['mochacli:mockTests', 'jshint', 'jscs']);
grunt.registerTask('live', ['mochacli:liveTests', 'jshint', 'jscs']);
grunt.registerTask('validate', ['jshint', 'jscs']);

