
export default async function (ctx, next) {
	console.log(`${ctx.method} - ${ctx.url} start !!!`);
	const start = new Date();
	await next();
	const ms = new Date() - start;
	console.log(`${ctx.method} - ${ctx.url} end ${ms}ms ~~~`);
}
