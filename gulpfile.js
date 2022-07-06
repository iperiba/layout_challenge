const { src, dest, watch, series, parallel } = require('gulp');

let gulp = require('gulp'),
    sass = require('gulp-sass')(require('sass'));
sourcemaps = require('gulp-sourcemaps'),
    $ = require('gulp-load-plugins')(),
    cleanCss = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    postcssInlineSvg = require('postcss-inline-svg'),
    browserSync = require('browser-sync').create()
pxtorem = require('postcss-pxtorem'),
    babel = require('gulp-babel'),
    postcssProcessors = [
        postcssInlineSvg({
            removeFill: true,
            paths: ['./node_modules/bootstrap-icons/icons']
        }),
        pxtorem({
            propList: ['font', 'font-size', 'line-height', 'letter-spacing', '*margin*', '*padding*'],
            mediaQuery: true
        })
    ];

const paths = {
    scss: {
        src: ['./scss/style.scss','./scss/**/**/*.scss','./scss/**/**/**/*.scss'],
        dest: './css',
        watch: './scss/**/*.scss',
        bootstrap: './node_modules/bootstrap/scss/bootstrap.scss',
    },
    js: {
        bootstrap: './node_modules/bootstrap/dist/js/bootstrap.min.js',
        custom: './js/custom.es6.js',
        notices: './js/block-notices.es6.js',
        media_iframe: './js/media-iframe.es6.js',
        modal_blazy: './js/modal-image-video-blazy.es6.js',
        dest: './js/dist'
    }
}

// Compile scss into CSS & auto-inject into browsers
function styles () {
    return gulp.src(paths.scss.src)
        //.pipe(sourcemaps.init())
        .pipe(sass({includePaths: ['scss', 'node_modules']}).on('error', sass.logError))
        .pipe($.postcss(postcssProcessors))
        .pipe(postcss([autoprefixer()]))
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.scss.dest))
        .pipe(cleanCss())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.scss.dest))
        .pipe(browserSync.stream())
}

// Move the javascript files into our js folder
function js () {
    return gulp.src([paths.js.bootstrap ])
        .pipe(gulp.dest(paths.js.dest))
        .pipe(gulp.src([paths.js.custom]))
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(rename('custom.js'))
        .pipe(gulp.dest(paths.js.dest))
        .pipe(gulp.src([paths.js.notices]))
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(rename('block-notices.js'))
        .pipe(gulp.dest(paths.js.dest))
        .pipe(gulp.src([paths.js.media_iframe]))
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(rename('media-iframe.js'))
        .pipe(gulp.dest(paths.js.dest))

        .pipe(gulp.src([paths.js.modal_blazy]))
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(rename('modal-image-video-blazy.js'))
        .pipe(gulp.dest(paths.js.dest))

        .pipe(browserSync.stream())
}

// Static Server + watching scss/html files
function serve () {
    browserSync.init({
        proxy: 'http://serreria.docker.localhost',
    })

    gulp.watch([paths.scss.watch, paths.scss.bootstrap], styles).on('change', browserSync.reload)
}

function jswatch () {
    gulp.watch([paths.js.custom], js)
}

const build = gulp.series(styles, gulp.parallel(js, serve))

exports.styles = styles
exports.js = js
exports.serve = serve
exports.jswatch = jswatch

exports.default = build
