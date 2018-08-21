'use strict';

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const path = require('path');

/* Runs the server with live reload */
gulp.task('dev', ['server', 'watch']);

/* Watch for changes and recompile scss, reload browser */
gulp.task('watch', ['watch-scss', 'watch-livereload']);

/* Runs the server  */
gulp.task('server', function() {
  nodemon('debug', 'development');
});

/* Reload the server, giving 2 seconds before browser refresh */
gulp.task('reload', function() {
  return gulp
    .src('app')
    .pipe($.wait(2000))
    .pipe($.livereload());
});

/* Watch assets and reload the browser when any files change */
gulp.task('watch-livereload', function() {
  $.livereload({ start: true });
  gulp.watch(['public/**/*']).on('change', function(file) {
    if (!/\.(scss)$/i.test(file.path)) {
      $.util.log('Reloading browser. ' + path.basename(file.path) + ' changed');
      $.livereload.changed(file.path);
    }
  });
});

function nodemon(debug, env) {
  $.nodemon({
    ext: 'html js',
    ignore: [
      '.sass-cache',
      '.bower-*',
      '*-spec.js',
      '**/public/*',
      '**/node_modules/**',
      'gulpfile.js'
    ],
    env: { NODE_ENV: env },
    nodeArgs: ['--inspect'],
    exec: `node ${__dirname}/node_modules/@entrinsik/informer/index.js --hapi-plugin=${__dirname}`
  }).on('restart', 'reload');
}

/* Compile sass with the fast library or the slow one (needed for icons and charset UTF-8) */
function compileSass(source, compiler, dest) {
  console.log('Compiling ' + source + ' to ' + dest);
  return gulp
    .src(source)
    .pipe(compiler)
    .on('error', function(err) {
      console.error(err.toString());
      this.emit('end');
    })
    .pipe($.autoprefixer('last 1 version', '> 1%'))
    .pipe(gulp.dest(dest || '.'));
}

/* get the full path to the directory */
function getDir(dir, filePath) {
  const pos = filePath.indexOf('/' + dir + '/');
  if (pos < 0) {
    pos = filePath.indexOf('\\' + dir + '\\');
  }
  return pos >= 0 ? filePath.substr(0, pos) + '/' + dir : null;
}

/* Watch scss files and recompile into css when they change */
gulp.task('watch-scss', function() {
  gulp.watch(['public/styles/*.scss']).on('change', function(file) {
    const scss = path.basename(file.path);
    const scssDir = getDir('styles', file.path);
    if (scssDir) {
      if (scss && scss.indexOf('_') !== 0) {
        $.util.log('Recompiling ' + scss);
        compileSass(
          file.path,
          $.sass({ errLogToConsole: false }),
          path.dirname(file.path)
        );
      } else {
        const p = path.relative(__dirname, file.path);
        if (p.indexOf('public') === 0) {
          $.util.log('Recompiling module scss (' + scss + ' is a partial)');
          compileSass(
            scssDir + '/**/*.scss',
            $.sass({ errLogToConsole: true }),
            scssDir
          );
        }
      }
    }
  });
});
