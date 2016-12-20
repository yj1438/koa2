const path = require('path');
const fs = require('fs');

const clientBase = path.resolve(__dirname, 'client');


function getProjects () {
    const clientProjects = [];
    return new Promise((resolve, reject) => {
        const fileArr = fs.readdirSync(clientBase);
        if (fileArr) {
            fileArr.filter((fileName) => {
                const fileState = fs.lstatSync(path.resolve(clientBase, fileName));
                return fileState.isDirectory();
            })
            .forEach((fileName, index, arr) => {
                console.log(fileName);
                clientProjects.push('/' + fileName + '/*');
                if (index === arr.length - 1) {
                    resolve(clientProjects);
                }
            });
        } else {
            reject('have no project');
        }
    });
}

(async function () {
    const projects = await getProjects();
    console.log(projects);
})();
