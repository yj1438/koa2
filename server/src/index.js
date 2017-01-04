// import 'core-js';
// import 'harmony-reflect';
import path from 'path';
import { install } from 'source-map-support';
import Koa from 'koa';
import Router from 'koa-router';
import koaStatic from 'koa-static';
import logger from './lib/logger';
import logger2 from './lib/logger2';
import template from './lib/artTemplate';
import routerRegister from './base/routerRegister';

install();

const app = new Koa();
const router = new Router({ prefix: '/admin' });
const staticPath = path.resolve(__dirname, '../../client/dist');

app.use(logger);
app.use(logger2);

app.use(koaStatic(staticPath, {
	maxage: 0,
	hidden: false,
	gzip: true,
}));
app.use(template);
app.use(router.routes());

routerRegister(router);

if (!module.parent) {
	const port = process.env.PORT || 6060;
	app.listen(port, () => console.log(`✅  Listening on port ${port}...`));
}
