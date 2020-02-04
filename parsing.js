const csv = require('csv-parser');
const arrayToTree = require('array-to-tree');

const parseCSV = (raw_csv) => {
    const flat_csv = [];
    const parser = csv(
        {
            mapHeaders: ({header}) => header
                .toLowerCase()
                .replace(' ', '-')
                .replace(/[^0-9a-z\-]/gi, ''), // Slugify column header
            separator: ',',
        });
    const promise = new Promise((resolve) => {
        parser
            .on('data', (data) => {
                data.id = parseInt(data.id, 10);
                if (typeof data.parent !== 'undefined' && data.parent.length > 0)
                    data.parent_id = parseInt(data.parent.match(/#(\d+):/)[1], 10) || undefined;
                flat_csv.push(data);
            })
            .on('end', () => {
                const tree = arrayToTree(flat_csv);
                resolve(tree);
            });
    });
    parser.write(raw_csv);
    parser.end();
    return promise;
};

module.exports = parseCSV;
