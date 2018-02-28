var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var webserver = require('gulp-webserver');
var watchify = require('watchify');

var PATHS = {
  SASS: ['./css/sass/**/*.scss'],
  DIST: 'dist/',
  DIST_JS: 'dist/js/',
  DIST_CSS: 'dist/css/'
};

function compile(watch) {
  var bundler = browserify('./src/app.js', {
    debug: true, // write own sourcemaps
    extensions: [ '.js', '.jsx', '.json' ]
  });
  
  return bundler
    .transform('babelify', { presets: ['babel-preset-env', 'babel-preset-react'] })
    .bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true })) // load browserify's sourcemaps
    .pipe(uglify()) // uglify js
    .pipe(sourcemaps.write('.')) // write .map files near scripts
    .pipe(gulp.dest(PATHS.DIST_JS));
}

gulp.task('build:js', function() {
  return compile();
});

gulp.task('build:html', function() {
  return gulp.src('index.html')
    .pipe(gulp.dest(PATHS.DIST));
});

gulp.task('sass', function() {
  return gulp.src(PATHS.SASS)
    .pipe(sass())
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest(PATHS.DIST_CSS))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest(PATHS.DIST_CSS));
});

gulp.task('webserver', function() {
  return gulp.src(PATHS.DIST)
    .pipe(webserver({
      livereload: true
    }));
});

gulp.task('watch:js', function() {
  return gulp.watch(['./src/**/*.js'], compile);
});

gulp.task('watch:html', function() {
  return gulp.watch(['index.html'], ['build:html']);
});

gulp.task('watch:scss', function () {
  return gulp.watch(PATHS.SASS, ['sass']);
});

gulp.task('default', ['build:js', 'webserver', 'watch:js', 'watch:html', 'watch:scss']);