let $ = require("jquery");

const insertElement = (container, rawElement) => {
    const element = $(rawElement);
    container.append(element);
    return element;
};

const insertSection = (container, title = '', classes = '') => {
    const section = insertElement(
        container,
        '<section class="' + classes + '"></section>'
    );
    if (title.length > 0) {
        insertElement(section, '<h1>' + title + '</h1>');
    }
    return section;
};

const insertArticle = (container, title = '', classes = '') => {
    const section = insertElement(
        container,
        '<article class="' + classes + '"></article>'
    );
    if (title.length > 0) {
        insertElement(section, '<h2>' + title + '</h2>');
    }
    return section;
};

const insertCardContainer = (container, classes = '') =>
    insertElement(
        container,
        '<div class="cards-container' + (classes.length > 0 ? ' ' + classes : '') + '"></div>'
    );

const insertVerticalCardContainer = (container, classes = '') =>
    insertElement(
        container,
        '<div class="vertical-cards-container' + (classes.length > 0 ? ' ' + classes : '') + '"></div>'
    );

const insertCard = (container, content, classes = '') =>
    insertElement(
        container,
        '<div class="card' + classes + '">' + content + '</div>'
    );

const insertOrganigram = (projectTree, container) => {
    const section = insertSection(container, 'Organigramme', 'organigram');
    const mainProjectContainer = insertCardContainer(section, 'main-project');
    const subProjectsContainer = insertCardContainer(section, 'sub-projects');
    insertCard(mainProjectContainer, 'Harpokrat'); // TODO dynamic name
    Object.keys(projectTree).forEach((project, id) => {
        insertCard(subProjectsContainer, (id + 1).toString() + '. ' + project);
    });
};

const insertEpicCards = (container, epic, epicId) => {
    if (epic.children) {
        const epicContainer = insertVerticalCardContainer(container);
        insertCard(epicContainer, epicId + ' ' + epic.subject);
        epic.children.forEach((card, id) => {
            const cardId = epicId + '.' + (id + 1).toString();
            insertCard(epicContainer, cardId + ' ' + card.subject);
        });
    }
};

const insertProjectCards = (container, projectName, projectId, projectTree) => {
    const projectContainer = insertCardContainer(insertArticle(container, projectId + '. ' + projectName));
    projectTree.forEach((epic, id) => {
        const epicId = projectId + '.' + (id + 1).toString();
        insertEpicCards(projectContainer, epic, epicId);
    });
};

const insertProjectsCards = (projectTree, container) => {
    const section = insertSection(container, 'Carte des livrables', 'projects-cards');
    Object.keys(projectTree).forEach((project, id) => {
        const projectId = (id + 1).toString();
        insertProjectCards(section, project, projectId, projectTree[project]);
    });
};

const splitInProjects = (projectTree) => {
    const projectsNames = [...new Set(projectTree.map(rootPackage => rootPackage.project))];
    const projects = {};
    for (const project of projectsNames) {
        projects[project] = projectTree.filter(rootPackage => rootPackage.project === project);
    }
    return projects;
};

const formatProjectTree = (projectTree, containerId) => {
    let container = $('#' + containerId);
    container.empty();
    const projects = splitInProjects(projectTree);
    insertOrganigram(projects, container);
    insertProjectsCards(projects, container);
    // TODO
};

module.exports = formatProjectTree;
