import gulp from 'gulp';
import path from 'path';
import fs   from 'fs-extra';

gulp.task('clean', (done) => {
    fs.remove(path.join(__dirname, 'build'), done);
});

gulp.task('build:bin', ['clean'], () => {
    let replace = require('gulp-replace');
    return gulp.src('autoprefixer')
        .pipe(replace(/require\('\.\/enable-es6'\);\n/, ''))
        .pipe(gulp.dest('build/'));
});

gulp.task('build:lib', ['clean'], () => {
    let replace = require('gulp-replace');
    let babel   = require('gulp-babel');
    return gulp.src(['binary.js', 'index.js'])
        .pipe(replace(/require\('\.\/enable-es6'\);\n/, ''))
        .pipe(babel({ loose: 'all' }))
        .pipe(gulp.dest('build/'));
});

gulp.task('build:docs', ['clean'], () => {
    let ignore = require('fs').readFileSync('.npmignore').toString()
        .trim().split(/\n+/)
        .concat(['*.js', '.npmignore', 'package.json', 'autoprefixer'])
        .map( i => '!' + i );
    return gulp.src(['*'].concat(ignore))
        .pipe(gulp.dest('build'));
});

gulp.task('build:package', ['clean'], () => {
    let editor = require('gulp-json-editor');
    return gulp.src('./package.json')
        .pipe(editor( (d) => {
            d.devDependencies['babel-core'] = d.dependencies['babel-core'];
            delete d.dependencies['babel-core'];
            return d;
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('build', ['build:bin', 'build:lib', 'build:docs', 'build:package']);

gulp.task('lint', () => {
    let eslint = require('gulp-eslint');
    return gulp.src(['index.js',
                     'binary.js',
                     'test/*.js',
                     'gulpfile.babel.js',
                     'autoprefixer-cli',
                     'enable-es6.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('test', () => {
    require('./enable-es6');
    let mocha = require('gulp-mocha');
    return gulp.src('test/*.js', { read: false })
        .pipe(mocha({ timeout: 6000 }));
});

gulp.task('default', ['lint', 'test']);
