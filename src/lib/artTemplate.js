import path from 'path';
import template from 'art-template';
import fs from 'fs';

const basePath = process.cwd(),
    viewRoot = path.resolve(basePath, 'views');

export default async function (ctx, next) {
    if (ctx.render) {
        return;
    }
    ctx.template = template;
    ctx.render = function (view, data) {
        console.log(ctx.request.url);
        const vPath = path.resolve(viewRoot, view),
            ext = '.html';
        data = data || {};
        let html = '';
        const exist = fs.existsSync(vPath + ext);
        html = exist ? template(vPath, data) : ('模板错误' + vPath);
        return html;
    };
    await next();
}
