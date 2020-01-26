let $ = require("jquery");

const getPackageId = (workPackage) => {
    return '#' + workPackage.id.toString();
};

const packageStr = (workPackage) => {
    return workPackage.subject + ' (' + getPackageId(workPackage) + ')'
};

const checkPackage = (workPackage, depth) => {
    if (depth < 0)
        return true;
    if (depth === 1)
        return workPackage.children && workPackage.children.length > 0;
    if (!workPackage.children || workPackage.children.length === 0)
        return false;
    return workPackage.children.some((child) => checkPackage(child, depth - 1));
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

const insertArticle = (container, title = '', classes = '', titleElement = 'h2') => {
    const section = insertElement(
        container,
        '<article class="' + classes + '"></article>'
    );
    if (title.length > 0) {
        insertElement(section, '<' + titleElement + '>' + title + '</' + titleElement + '>');
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
        if (projectTree[project].some((epic) => checkPackage(epic, 1))) {
            insertCard(subProjectsContainer, project);
        }
    });
};

const insertEpicCards = (container, epic) => {
    if (checkPackage(epic, 1)) {
        const epicContainer = insertVerticalCardContainer(container);
        insertCard(epicContainer, packageStr(epic));
        epic.children.forEach((card) => {
            insertCard(epicContainer, packageStr(card));
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
        if (projectTree[project].some((epic) => checkPackage(epic, 1))) {
            insertProjectCards(section, project, projectTree[project]);
        }
    });
};

const getProgressBar = (workPackage) => {
    const percent = workPackage['progress-'] + '%';
    return '<div class="progress-bar-container">' +
        '<div class="progress-bar" style="width:' + percent + '"></div>' +
        '<span>' + percent + '</span>' +
        '</div>';
};

const insertUserStory = (container, userStory) => {
    const table = insertElement(container, '<table class="user-story"></table>');
    insertElement(table, '<thead><tr><th colspan="2">' + packageStr(userStory) + '</th></tr></thead>');
    const tableBody = insertElement(table, '<tbody></tbody>');
    if (userStory.description.length > 0) {
        insertElement(tableBody, '<tr><td colspan="2"><b>Description:</b><br>' + userStory.description + '</td></tr>');
    }
    if (checkPackage(userStory, 1)) {
        const dodTableContainer =
            insertElement(
                insertElement(
                    tableBody, '<tr></tr>'
                ), '<td colspan="2"></td>'
            );
        insertElement(dodTableContainer, '<b>Definition of done:</b>');
        const dodTable = insertElement(dodTableContainer, '<table class="definition-of-done"></table>');
        insertElement(dodTable, '<thead><tr><th>Tache</th><th>État</th><th>Charge</th><th>Avancement</th></tr></thead>');
        const dodTableBody = insertElement(dodTable, '<tbody></tbody>');
        userStory.children.forEach((task) => {
            insertElement(dodTableBody, '<tr>' +
                '<td>' + packageStr(task) + '</td>' +
                '<td>' + task.status + '</td>' +
                '<td>' + (task['estimated-time'] ? task['estimated-time'] : '?') + ' h/H</td>' +
                '<td>' + getProgressBar(task) + '</td>' +
                '</tr>');
        });
    }
    const tableFooter = insertElement(table, '<tfoot></tfoot>');
    insertElement(tableFooter, '<tr><td><b>Charge estimée:</b></td><td>' + (userStory['estimated-time'] ? userStory['estimated-time'] : '?') + ' h/H</td></tr>');
    insertElement(tableFooter, '<tr><td><b>Avancement:</b></td><td>' + getProgressBar(userStory) + '</td></tr>');
};

const insertFeatureUserStories = (container, features) => {
    if (checkPackage(features, 1)) {
        const featureContainer = insertArticle(container, packageStr(features), 'feature-user-stories', 'h4');
        features.children.forEach((userStory) => {
            insertUserStory(featureContainer, userStory);
        });
    }
};

const insertEpicUserStories = (container, epic) => {
    if (checkPackage(epic, 2)) {
        const epicContainer = insertArticle(container, packageStr(epic), 'epic-user-stories', 'h3');
        epic.children.forEach((feature) => {
            insertFeatureUserStories(epicContainer, feature);
        });
    }
};

const insertProjectUserStories = (container, projectName, projectTree) => {
    const projectContainer = insertArticle(container, projectName, 'project-user-stories');
    projectTree.forEach((epic) => {
        if (checkPackage(epic, 2)) {
            insertEpicUserStories(projectContainer, epic);
        }
    });
};

const insertUserStories = (projectTree, container) => {
    const section = insertSection(container, 'User stories', 'user-stories');
    Object.keys(projectTree).forEach((project, id) => {
        if (projectTree[project].some((epic) => checkPackage(epic, 2))) {
            insertProjectUserStories(section, project, projectTree[project]);
        }
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
    insertUserStories(projects, container);
    // TODO
};

module.exports = formatProjectTree;
