import Model from 'models/Model';

const sayHi = async (ctx) => {
	ctx.body = await ctx.render('temp', { msg: '好了，你成功了' });
};

async function loadData(ctx) {
	ctx.body = await Model.load();
}

export default function(router) {
	router.get('/load-data/*', loadData);
	router.get('/say-hi/*', sayHi);
}
