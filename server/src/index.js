// import 'core-js';
// import 'harmony-reflect';
import path from 'path';
import { install } from 'source-map-support';
import Koa from 'koa';
import Router from 'koa-router';
import koaStatic from 'koa-static';

import logger from './lib/logger';
import template from './lib/artTemplate';
import routerRegister from './base/routerRegister';

install();

const app = new Koa();
const router = new Router({ prefix: '/admin' });
// const routerForDev = new Router({ prefix: '/dev' });
const staticPath = path.resolve(__dirname, '../../client/dist');

app.use(logger);
app.use(koaStatic(staticPath, {
	maxage: 0,
	hidden: false,
	gzip: true,
}));
app.use(template);
app.use(router.routes());
// app.use(routerForDev.routes());

routerRegister(router);
// routerRegister(routerForDev, true);

if (!module.parent) {
	const port = process.env.PORT || 6060;
	app.listen(port, () => console.log(`✅  Listening on port ${port}...`));
}
