var gulp = require('gulp'),
    gutil = require('gulp-util'),
    jsTransform = require('gulp-jstransform');

gulp.task('es6', function () {
    gulp.src(['./src/*.js', '!./src/bundle-modules.js'])
        .pipe(jsTransform().on('error', gutil.log))
        .pipe(gulp.dest('./build'));
});