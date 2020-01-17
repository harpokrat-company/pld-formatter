const parseCSV = require('./parsing');
const formatProjectTree = require('./formatting.js');

const handleFile = (file, callback, error = () => {
}) => {
    const reader = new FileReader();
    reader.readAsText(file, 'utf-8');
    reader.onload = (event) => {
        callback(event.target.result);
    };
    reader.onerror = (event) => {
        error();
    };
};

module.exports = {
    loadCsvFile: (file, containerId) => handleFile(
        file,
        (content) =>
            parseCSV(content).then(projectTree => {
                formatProjectTree(projectTree, containerId)
            }),
        () => console.log('Aled oskour')
    ),
};
