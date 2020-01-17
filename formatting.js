let $ = require("jquery");

const insertCart = (container, content) => {
    let card = $('<div>' + content + '</div>');
    container.append(card);
    return card;
};

const insertOrganigram = (projectTree, container) => {
    for (const epic of projectTree) {
        insertCart(container, epic.subject);
    }
};

const formatProjectTree = (projectTree, containerId) => {
    let container = $('#' + containerId);
    container.innerHTML = "";
    console.log(projectTree);
    insertOrganigram(projectTree, container);
    // TODO
};

module.exports = formatProjectTree;
