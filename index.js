
const csv = require('csv-parser');
const _ = require('lodash');
const fs = require('fs');
const content = [];
const arrayToTree = require('array-to-tree');

const config = {
    separator: '.',
};



function main() {
    fs.createReadStream('test.csv')
        .pipe(csv(config))
        .on('data', (data) => {
            data.id = parseInt(data.id, 10);
            data.parent_id = parseInt(data.Parent.replace(/\D/g, ''), 10) || undefined;
            //content.push({ ...data, children: [] })
            content.push(data);
        })
        .on('end', () => {
            tree = arrayToTree(content);
            // Balancer le tree en HTML
        });
}

main();
