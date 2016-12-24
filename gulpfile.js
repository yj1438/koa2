
'use strict';
const path = require('path');
const respawn = require('respawn');
const program = require('commander');

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

const PATH_SRC = 'src',
	PATH_DIST = 'dist',
	PATH_SOURCE = path.resolve(__dirname, 'src');

const PATH_JS = `${PATH_SRC}/**/*.js`,
	PATH_TPL = `${PATH_SRC}/**/*.html`;

/**
 * babel 编译
 * @param {any} src
 * @returns
 */
function transpile () {
	console.log(gutil.colors.cyan('⚒ Transpiling...'));
	return gulp.src(PATH_JS, { base: PATH_SRC })
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
		.pipe(sourcemaps.write('.', { sourceRoot: PATH_SOURCE }))
		.pipe(gulp.dest(PATH_DIST));
}

/**
 * eslint
 * @param {any} src
 * @returns
 */
function lint () {
	console.log(gutil.colors.cyan('⚒ Linting...'));
	return gulp.src(PATH_JS)
		.pipe(cache('lint'))
		.pipe(eslint({ useEslintrc: true }))
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
}


/**
 * 所有的模板文件移动到 dist
 * @param {any} src
 * @returns
 */
function moveTpl () {
	console.log(gutil.colors.cyan('⚒ Moving tpl...'));
	return gulp.src(PATH_TPL, { base: PATH_SRC })
		.pipe(gulp.dest(PATH_DIST));
}


/**
 * 将老的构建好的文件删掉
 * @returns
 */
function clean () {
	 return del([ PATH_DIST ]);
}


function startServe(done) {
	console.log(gutil.colors.green('Start server ...'));

	const command = [ 'node', '--harmony' ];
	// debug 模式
	if (program.debug) {
		command.push('--debug');
	}
	command.push('index.js');

	const monitor = respawn(command, {
		env,
		cwd: PATH_DIST,
		maxRestarts: 10,
		sleep: 300,
		stdio: 'inherit',
	});
	monitor
		.on('stdout', (data) => console.log(data.toString()))
		.on('stderr', (err) => console.error(err.toString()));

	function restartMonitor () {
		monitor.stop(() => monitor.start());
	}
	monitor.start();

	gulp.watch([ PATH_JS, PATH_TPL ], (event) => {
		gutil.log(`File changed: ${gutil.colors.yellow(event.path)}`);

		let isLintError = false;

		lint(PATH_JS)
			.resume()
			.on('error', () => isLintError = true)
			.on('end', () => {
				if (isLintError) {
					return;
				}
				transpile(PATH_JS).on('end', restartMonitor);
			});
	});

	done();
}

gulp.task('default', gulp.series(
	gulp.parallel(clean, lint),
	gulp.parallel(transpile, moveTpl),
	startServe
));
