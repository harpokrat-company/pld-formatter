let $ = require("jquery");

const getPackageId = (package) => {
    return '#' + package.id.toString();
};

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
        insertCard(subProjectsContainer, project);
    });
};

const insertEpicCards = (container, epic) => {
    if (epic.children) {
        const epicContainer = insertVerticalCardContainer(container);
        insertCard(epicContainer, epic.subject + ' (' + getPackageId(epic) + ')');
        epic.children.forEach((card) => {
            insertCard(epicContainer, card.subject + ' (' + getPackageId(card) + ')');
        });
    }
};

const insertProjectCards = (container, projectName, projectTree) => {
    const projectContainer = insertCardContainer(insertArticle(container, projectName));
    projectTree.forEach((epic) => {
        insertEpicCards(projectContainer, epic);
    });
};

const insertProjectsCards = (projectTree, container) => {
    const section = insertSection(container, 'Carte des livrables', 'projects-cards');
    Object.keys(projectTree).forEach((project, id) => {
        insertProjectCards(section, project, projectTree[project]);
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
    console.log(projects);
    insertOrganigram(projects, container);
    insertProjectsCards(projects, container);
    // TODO
};

module.exports = formatProjectTree;
