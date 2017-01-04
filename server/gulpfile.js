'use strict';
const path = require('path');

// const program = require('commander');
const respawn = require('respawn');
const gulp = require('gulp');
const gutil = require('gulp-util');
const plumber = require('gulp-plumber');
const eslint = require('gulp-eslint');
const cache = require('gulp-cached');
const del = require('del');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');

// program.option('-d, --debug', 'Debug mode on');
// program.parse(process.argv);

/**
 * 主要路径
 */
const PATH_SRC = 'src',					// 源代码路径
	PATH_DIST = 'dist',					// 目标文件夹
	PATH_SOURCE = path.resolve(__dirname, 'src');			// source-map 路径
const PATH_JS = `${PATH_SRC}/**/*.js`,
	PATH_TPL = `${PATH_SRC}/**/*.html`;

const env = process.env;
env.NODE_PATH = env.NODE_PATH || path.resolve(__dirname, PATH_DIST);
env.NODE_ENV = env.NODE_ENV || 'development';

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
		.pipe(cache('tpl'))
		.pipe(gulp.dest(PATH_DIST));
}


/**
 * 将老的构建好的文件删掉
 * @returns
 */
function clean () {
	 return del([ PATH_DIST ]);
}

/**
 * 启动服务
 */
function startServe(done) {
	console.log(gutil.colors.green('Start server ...'));

	const command = [ 'node', '--harmony' ];
	// debug 模式
	// if (program.debug) {
	// 	command.push('--debug');
	// }
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

	/**
	 * 开始监听任务
	 */
	const watchIns = gulp.watch([ PATH_JS, PATH_TPL ], (watchDone) => {
		gutil.log(`Watch project is doing ...`);
		watchDone();
	});
	watchIns.on('change', (evt) => {
		gutil.log(`File change : ${evt}`);
		if (evt.endsWith('.html')) {
			moveTpl()
				.resume()
				.on('end', () => {
					transpile().on('end', restartMonitor);
				});
		}
		else {
			let isLintError = false;
			lint()
				.resume()
				.on('error', () => {
					isLintError = true;
				})
				.on('end', () => {
					if (isLintError) {
						return;
					}
					transpile().on('end', restartMonitor);
				});
		}
	});
	done();
}

/**
 * 默认任务
 * @module gulp#4.0
 */
gulp.task('default', gulp.series(
	// 第一步：clean + lint
	gulp.parallel(clean, lint),
	// 第二步：编译 + 移动模板
	gulp.parallel(transpile, moveTpl),
	// 第三步：启动服务
	startServe
));
