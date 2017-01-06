
async function main(ctx) {
    const url = ctx.request.url;
    ctx.boby = await `<p>haha : ${url}</p>`;
}

export default function(router) {
	router.get('/render1/*', main);
}
