import path from 'path';
import { readdirSync } from 'fs';

/**
 * Register all controllers with provided router
 * @param  {KoaRouter} router API mount point
 */
const controllersDir = path.resolve(__dirname, '../controllers');

export default function registerControllers (router) {
	readdirSync(controllersDir)
		.filter((fileName) => fileName.endsWith('Ctrl.js'))
		.forEach((fileName) => {
			const ctrlFilePath = path.join(controllersDir, fileName);
			require(ctrlFilePath).default(router);
		});
}
