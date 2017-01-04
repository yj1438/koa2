export default async function (ctx, next) {
	console.log(`logger2 start !!!`);
	const start = new Date();
	await next();
	const ms = new Date() - start;
	console.log(`logger2 end ${ms}ms ~~~`);
}
