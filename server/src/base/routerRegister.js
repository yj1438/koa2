'use strict';
import path from 'path';
import fs from 'fs';

/**
 * Register all controllers with provided router
 * @param  {KoaRouter} router API mount point
 */
const root = process.cwd();
const controllersDir = path.resolve(__dirname, '../controllers');		//server 常规路由
const clientBase = path.resolve(root, '../..', 'client');					//client 通一路由

function getProjects () {
    const clientProjects = [];
    return new Promise((resolve, reject) => {
        const fileArr = fs.readdirSync(clientBase);
        if (fileArr) {
            fileArr
			.filter((fileName) => {
                const fileState = fs.lstatSync(path.resolve(clientBase, fileName));
                return fileState.isDirectory();
            })
            .forEach((fileName, index, arr) => {
                console.log(fileName);
                // clientProjects.push('/' + fileName + '/*');
                clientProjects.push(fileName);
                if (index === arr.length - 1) {
                    resolve(clientProjects);
                }
            });
        }
		else {
			reject('have no project');
		}
    });
}

export default async function registerControllers (router) {
	// 加载每一个 controller
	fs.readdirSync(controllersDir)
		.filter((fileName) => fileName.endsWith('Ctrl.js'))
		.forEach((fileName) => {
			const ctrlFilePath = path.join(controllersDir, fileName);
			require(ctrlFilePath).default(router);
		});
	// 加载统一的 spa page
    try {
        const projects = await getProjects();
        projects.forEach((baseUrl) => {
            router.get('/' + baseUrl + '/*', async function (ctx) {
                ctx.body = await ctx.render('admin_common', { theme: baseUrl });
            });
        });
    }
    catch (err) {
        console.log(err);
    }
}
