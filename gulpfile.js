'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var mainBowerFiles = require('main-bower-files');
var browserSync =require('browser-sync');
var notifier = require('node-notifier');
var runSequence = require('run-sequence');

// �ݒ�
var config = {
  server : {
    port: 8282
  },
  html: {
    injectTarget: './app/index.html'
  },
  js: {
    output: {
      directory: './app',
      fileName: 'app.js'
    },
    files: [
      './app/js/*.js'
    ]
  },
  css: {
    output: {
      directory: './app',
      fileName: 'style.css'
    },
    files: [
      './app/scss/*.scss'
    ],
    prefixer: [
      'last 1 versions',
      'ie >= 10',
      'safari >= 8',
      'ios >= 8',
      'android >= 4'
    ]
  }
};

// �G���[����notify�\��
var notify = function(taskName, error) {
  var title = '[task]' + taskName + ' ' + error.plugin;
  var errorMsg = 'error: ' + error.message;
  console.error(title + '\n' + errorMsg);
  notifier.notify({
    title: title,
    message: errorMsg,
    time: 3000
  });
};

// �T�[�o�N��
gulp.task('server', function() {
  browserSync({
    port: config.server.port,
    server: {
      baseDir: './app/',
      index  : 'index.html'
    }
  });
});

// �T�[�o�ċN��
gulp.task('reloadServer', function () {
  browserSync.reload();
});

// css�n����
// css�A�� -> autoprefixer
gulp.task('css', function() {
  return gulp.src(config.css.files)
    .pipe($.plumber({
      errorHandler: function(error) {
        notify('css', error);
      }
    }))
    .pipe($.concat(config.css.output.fileName))
    .pipe($.pleeease({
      autoprefixer: {
        browsers: config.css.prefixer
      },
      minifier: false
    }))
    .pipe($.plumber.stop())
    .pipe(gulp.dest(config.css.output.directory));
});

// js�n����
// es6����es5�ւ̕ϊ� -> js�A��
gulp.task('js', ['lint'], function() {
  return gulp.src(config.js.files)
    .pipe($.plumber({
      errorHandler: function(error) {
        notify('js', error);
      }
    }))
    .pipe($.babel())
    .pipe($.concat(config.js.output.fileName))
    .pipe($.plumber.stop())
    .pipe(gulp.dest(config.js.output.directory));
});

// js��lint����
gulp.task('lint', function() {
  return gulp.src(config.js.files)
    .pipe($.plumber({
      errorHandler: function(error) {
        notify('lint', error);
      }
    }))
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failOnError())
    .pipe($.plumber.stop());
});

// bower�Ŏ擾�����t�@�C����index.html�ɑ}��
gulp.task('inject', function() {
  return gulp.src(config.html.injectTarget)
//    .pipe($.inject(gulp.src(mainBowerFiles()), {
//      name: 'inject',
//      relative: true
//    }))
    .pipe(gulp.dest('./app'));
});

// js��css�̃r���h����
gulp.task('build', ['js', 'inject', 'css'], function() {});

gulp.task('watch', function() {
  gulp.watch('./app/index.html', function() {
    runSequence('inject', 'reloadServer');
  });
  gulp.watch(config.js.files, function() {
    runSequence('js', 'reloadServer');
  });
  gulp.watch(config.css.files, function() {
    runSequence('css', 'reloadServer');
  });
});

gulp.task('default', ['build', 'watch', 'server']);