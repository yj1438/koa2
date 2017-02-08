
import Model from 'models/Model';

//
import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import routes from '../../../client/src/demo/routers.jsx';

const sayHi = async (ctx) => {
	console.log(132312);
	ctx.body = await ctx.render('temp', { msg: '好了，你成功了!!!!！' });
};

async function loadData(ctx) {
	ctx.body = await Model.load();
}

async function say(ctx) {
    const url = ctx.request.url;
	const res = ctx.response;
	match({ routes, location: url }, (error, redirectLocation, renderProps) => {
		if (error) {
			ctx.body = 'error';
			res.status(500).send(error.message);
		}
		else if (redirectLocation) {
			ctx.body = 'redirectLocation';
			// res.redirect(302, redirectLocation.pathname + redirectLocation.search);
		}
		else if (renderProps) {
			// You can also check renderProps.components or renderProps.routes for
			// your "not found" component or route respectively, and send a 404 as
			// below, if you're using a catch-all route.
			ctx.body = renderToString(<RouterContext {...renderProps} />);
		}
		else {
			ctx.body = 'Not found';
			// res.status(404).send('Not found');
		}
	});
	// ctx.body = `The url is : ${url}`;
}

export default function(router) {
	router.get('/say', say);
	router.get('/load-data/*', loadData);
	router.get('/say-hi', sayHi);
}
