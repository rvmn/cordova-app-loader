module.exports = function(grunt) {
  grunt.initConfig({
    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'build/app.min.css': ["dev/css/*.css"]
        }
      }
    },
    uglify: {
      build: {
        src: ['dev/js/*.js'],
        dest: 'build/app.min.js'
      }
    },
    watch: {
      dev: {
        files: ['dev/*'],
        tasks: ['cssmin','uglify','copy:build','copy:serve','manifest']
      }
    },
    manifest: {
      server:{
        options: {
          basePath: __dirname+'/server/www',
          exclude: [],
          loadall: true,
          files: {},
          load: [],
          root: "./"
        },

          src: [
            '*.css',
            '*.html',
            '*.js',
            '*/*.png',
            '*/*.jpg'
          ],
          dest: ['server/www/manifest.json']

      },
      app: {
        options: {
          basePath: __dirname+'/www',
          exclude: [],
          loadall: true,
          files: {},
          load: [],
          root: "./"
        },
        src: [
            '*.css',
            '*.html',
            '*.js',
            '*/*.png',
            '*/*.jpg'
          ],
          dest: ['www/manifest.json']
      }
    },
    copy: {
      build: {
        files: [
          {expand: true, cwd: 'dev/', src: ['*.html'], dest: 'build/', filter: 'isFile'},
          {expand: true, cwd: 'dev/', src: ['**/**'], dest: 'build/', filter: 'isFile'},
          {expand: true, cwd: 'dev/', src: ['img/*'], dest: 'build/img/', filter: 'isFile'}
        ]
      },
      serve: {
        files: [
          {expand: true, cwd: 'build/', src: ['**'], dest: 'www/'},
          {expand: true, cwd: 'build/', src: ['**'], dest: 'server/www/'},
        ]
      },
      install: {
        files: [
          {expand: true, cwd: 'node_modules/bluebird/js/browser/', src: ['bluebird.js'], dest: 'dev/js/'},
          {expand: true, cwd: 'node_modules/cordova-app-loader/', src: ['bootstrap.js'], dest: 'dev/js/'},
          {expand: true, cwd: 'node_modules/cordova-app-loader/', src: ['autoupdate.js'], dest: 'dev/js/'},
          {expand: true, cwd: 'node_modules/cordova-app-loader/dist/', src: ['CordovaAppLoader.js'], dest: 'dev/js/'},
          {expand: true, cwd: 'node_modules/cordova-app-loader/dist/', src: ['CordovaPromiseFS.js'], dest: 'dev/js/'},
          {expand: true, cwd: 'node_modules/cordova-app-loader/www/', src: ['app.js'], dest: 'dev/js/'},
          {expand: true, cwd: 'node_modules/jquery/dist/', src: ['jquery.js'], dest: 'dev/js/'}
        ]
      }
    }
  });
  // Load required modules npm install grunt-loadNpmTasks
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
 
  //GRUNT TASK TO BUILD A JSON MANIFEST FILE FOR HOT CODE UPDATES
  grunt.registerMultiTask('manifest', 'Generate JSON Manifest for Hot Updates', function () {
    var options = this.options({loadall:true, root: "./", files: {}, load: []});
    var done = this.async();
 
    var path = require('path');
    
    this.files.forEach(function (file) {
      var files;

      var json = {
        "files": options.files,
        "load": options.load,
        "root": options.root
      };
 
      //clear load array if loading all found assets
      if(options.loadall) {
        json.load = [];
      }
 
      // check to see if src has been set
      if (typeof file.src === "undefined") {
        grunt.fatal('Need to specify which files to include in the json manifest.', 2);
      }
 
      // if a basePath is set, expand using the original file pattern
      if (options.basePath) {
        files = grunt.file.expand({cwd: options.basePath}, file.orig.src);
      } else {
        files = file.src;
      }
 
      // Exclude files
      if (options.exclude) {
        files = files.filter(function (item) {
          return options.exclude.indexOf(item) === -1;
        });
      }
 
      // Set default destination file
      if (!file.dest) {
        file.dest = ['manifest.json'];
      }      
      // add files
      if (files) {
        files.forEach(function (item) {
            var hasher = require('crypto').createHash('sha256');
            var filename = encodeURI(item);
            var key = filename.split("/").pop();
            console.log(key);
            json.files[key] = {}
            json.files[key]['filename'] = filename;
            json.files[key]['version'] = hasher.update(grunt.file.read(path.join(options.basePath, item))).digest("hex")
            if(options.loadall) {
              json.load.push(filename);  
            }
        });
      }
      //write out the JSON to the manifest files
      file.dest.forEach(function(f) {
      	grunt.file.write(f, JSON.stringify(json, null, 2));
      });

 
      done();
    });
 
  });

  // Task definitions
  grunt.registerTask('default', ['cssmin','uglify','copy:build','copy:serve','manifest']);
  grunt.registerTask('install', ['copy:install']);
  grunt.registerTask('nodev', ['manifest']);
  grunt.registerTask('dev', ['watch']);
};
