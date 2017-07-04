var del     = require('del')
  , gulp    = require('gulp')
  , css     = require('gulp-clean-css')
  , header  = require('gulp-header')
  , iife    = require('gulp-iife')
  , rename  = require('gulp-rename')
  , stand   = require('gulp-standard')
  , trim    = require('gulp-trimlines')
  , uglify  = require('gulp-uglify')
  , pkg     = require('./package.json')


var headerLong = ['/*!'
  , '* <%= pkg.name %> - <%= pkg.description %>'
  , '* @version <%= pkg.version %>'
  , '* <%= pkg.homepage %>'
  , '*'
  , '* @copyright <%= pkg.author %>'
  , '* @license <%= pkg.license %>'
  , '*/;'
  , ''].join('\n')

var headerShort = '/*! <%= pkg.name %> v<%= pkg.version %> <%= pkg.license %>*/;'

gulp.task('clean', function() {
  return del([ 'dist/*' ])
})

gulp.task('copyJS', ['clean'], function() {
  return gulp.src('src/svg.select.js')
    .pipe(iife())
    .pipe(header(headerLong, { pkg: pkg }))
    .pipe(trim({ leading: false }))
    .pipe(gulp.dest('dist'))
})

gulp.task('copyCSS', ['clean'], function() {
  return gulp.src('src/svg.select.css')
    .pipe(trim({ leading: false }))
    .pipe(gulp.dest('dist'))
})

gulp.task('copy', ['copyJS', 'copyCSS'])


/**
 ‎* uglify the file
 * add the license info
 */
gulp.task('minifyJS', ['copy'], function() {
  return gulp.src('dist/svg.select.js')
    .pipe(uglify())
    .pipe(rename({ suffix:'.min' }))
    .pipe(header(headerShort, { pkg: pkg }))
    .pipe(gulp.dest('dist'))
})

gulp.task('minifyCSS', ['copy'], () => {
  return gulp.src('src/svg.select.css')
    .pipe(css({compatibility: 'ie8'}))
    .pipe(rename({ suffix:'.min' }))
    .pipe(gulp.dest('dist'))
})

gulp.task('minify', ['minifyJS', 'minifyCSS'])


gulp.task('standard', function () {
  return gulp.src(['./svg.select.js'])
    .pipe(stand())
    .pipe(stand.reporter('default', {
      breakOnError: true,
      quiet: false
    }))
})


gulp.task('default', ['standard', 'clean', 'copy', 'minify'])