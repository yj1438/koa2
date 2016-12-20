/* eslint-disable strict, no-console */
'use strict';

// require('shelljs/global');
// require('shelljs').config.fatal = true;

const path = require('path');
// const fs = require('fs');
const respawn = require('respawn');
// const spawn = require('child_process').spawn;
const program = require('commander');
const runSequence = require('run-sequence');
const gulp = require('gulp');
const gutil = require('gulp-util');
const plumber = require('gulp-plumber');
const eslint = require('gulp-eslint');
const cache = require('gulp-cached');
const del = require('del');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');

program.option('-d, --debug', 'Debug mode on');
program.parse(process.argv);

const env = process.env;

env.NODE_PATH = env.NODE_PATH || path.resolve(__dirname, 'dist');
env.NODE_ENV = env.NODE_ENV || 'development';

const paths = {
	src: 'src',
	dist: 'dist',
	sourceRoot: path.join(__dirname, 'src'),
};

// const babelOptions = JSON.parse(fs.readFileSync('./.babelrc', 'utf8'));

function transpile (src, dest) {
	console.log(gutil.colors.cyan('⚒ Transpiling...'));
	return gulp.src(src)
		.pipe(plumber())
		.pipe(cache('transpile'))
		.pipe(sourcemaps.init())
		.pipe(babel({
            // presets: [
            //     "latest"
            // ],
			plugins: [
                // "transform-runtime",
				'transform-es2015-modules-commonjs',
			],
		}))
		.pipe(sourcemaps.write('.', { sourceRoot: paths.sourceRoot }))
		.pipe(gulp.dest(dest));
}

function lint (src) {
	console.log(gutil.colors.cyan('⚒ Linting...'));
	return gulp.src(src)
		.pipe(cache('lint'))
		.pipe(eslint({ useEslintrc: true }))
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
}

function copyTpl (src) {
	src = src || `${paths.src}/views/**/*.html`;
	return gulp.src(src, { base: './src' })
		.pipe(gulp.dest('dist'));
}

gulp.task('copyTpl', () => copyTpl(`${paths.src}/views/**/*.html`));

/**
 * 源码编译
 */
gulp.task('transpile', () => transpile(`${paths.src}/**/*.js`, paths.dist));

/**
 * ESLINT 代码校验
 */
gulp.task('lint', () => lint([ `${paths.src}/**/*.js`, 'gulpfile.js' ]));

/**
 * 清除老旧编译成果
 */
gulp.task('clean', (done) => del([ paths.dist ], done));

/**
 * 统一任务
 */
gulp.task('default', (done) => {
	const command = [ 'node', '--harmony' ];
	// if debug flag was specified, run node in debug mode
	if (program.debug) {
		command.push('--debug');
	}
	command.push('index.js');

	const monitor = respawn(command, {
		env,
		cwd: paths.dist,
		maxRestarts: 10,
		sleep: 300,
		stdio: 'inherit',
	});

	runSequence([ 'clean', 'lint' ], 'copyTpl', 'transpile', () => {
		monitor.start();
		done();
	});

	monitor
		.on('stdout', (data) => console.log(data.toString()))
		.on('stderr', (err) => console.error(err.toString()));

	function restartMonitor () {
		monitor.stop(() => monitor.start());
	}

	gulp.watch(`${paths.src}/**/*.js`, (event) => {
		gutil.log(`File changed: ${gutil.colors.yellow(event.path)}`);

		let isLintError = false;

		lint(`${paths.src}/**/*.js`)
			.resume()
			.on('error', () => isLintError = true)
			.on('end', () => {
				if (isLintError) {
					return;
				}

				transpile(`${paths.src}/**/*.js`, paths.dist).on('end', restartMonitor);
			});
	});
});
