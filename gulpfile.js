var gulp = require('gulp'),
    sass = require('gulp-sass'),
    minifyCss = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps');

gulp.task('style',function(){
    return gulp
        .src('sass/*.scss')
        .pipe(sass({style: 'expanded'}))
        .pipe(sourcemaps.init())
        .pipe(autoprefixer('last 2 versions'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifyCss())
        .pipe(gulp.dest('assets'));
});

gulp.task('express', function() {
  // var express = require('express');
  // var app = express();
  // app.use(express.static(__dirname));
  // app.listen(4000);
});

gulp.task('watch', function() {
  gulp.watch('sass/*.scss', ['style']);
});

gulp.task('default', ['express','watch'], function() {

});