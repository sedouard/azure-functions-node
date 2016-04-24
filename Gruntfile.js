var grunt = require('grunt');
require('load-grunt-tasks')(grunt);

var jsFiles = ['modules/**/*.js', 'test/**/*.js'];

grunt.initConfig({
  mochacli: {
      mockTests: {
          options: {
            reporter: 'spec',
            grep: '.*-mock',
            recursive: true,
            bail: false
        },
        all: jsFiles
      },
      liveTests: {
          options: {
            reporter: 'spec',
            grep: '.*-live',
            recursive: true,
            bail: false
        },
        all: jsFiles
      }
  },
  jshint: {
      files: jsFiles,
      options: {
          jshintrc: '.jshintrc'
      }
  },
  jscs: {
      files: {
          src: jsFiles
      },
      options: {
          config: '.jscsrc',
          esnext: true
      }
  },
  jsbeautifier: {
      write: {
          files: {
              src: jsFiles
          },
          options: {
              config: '.beautifyrc'
          }
      }
  }
});
grunt.registerTask('ci', ['mochacli:mockTests', 'jshint', 'jscs']);
grunt.registerTask('live-test', ['mochacli:liveTests', 'jshint', 'jscs']);
grunt.registerTask('validate', ['jshint', 'jscs']);

