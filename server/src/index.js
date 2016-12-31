// import 'core-js';
// import 'harmony-reflect';
'use strict';
import { install } from 'source-map-support';
import Koa from 'koa';
import Router from 'koa-router';
import logger from './lib/logger';
import template from './lib/artTemplate';
import routerRegister from './base/routerRegister';

install();

const app = new Koa();
const router = new Router({ prefix: '/admin' });

app.use(logger);
app.use(template);
app.use(router.routes());

routerRegister(router);

if (!module.parent) {
	const port = process.env.PORT || 6060;
	app.listen(port, () => console.log(`✅  Listening on port ${port}...`));
}
