import path from 'path';
import template from 'art-template';
import fs from 'fs';

export default function (app, settings) {
    if (app.context.render) {
        return;
    }
    settings = settings || {};
    settings.root = settings.root || 'views';
    app.context.template = template;
    app.context.render = function *(view, data) {
        // var theme = '/' + this.theme + '/' || '';
        const vPath = path.resolve(settings.root, view),
            ext = '.html';
        data = data || {};
        let html = '';
        const exist = yield new Promise((resolve, reject) => {
            fs.exists(vPath + ext, (exists) => {
                if (!exists) {
                    console.warn('template \'' + vPath + ext + '\' is not found');
                    reject();
                    return;
                }
                resolve(exists);
            });
        });
        html = exist ? template(vPath, data) : '';
        return html;
    };
}
