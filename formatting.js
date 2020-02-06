let $ = require("jquery");

const getPackageId = (workPackage) => {
    return '#' + workPackage.id.toString();
};

const packageStr = (workPackage) => {
    return workPackage.subject + ' (' + getPackageId(workPackage) + ')'
};

const packageChildren = workPackage => {
    if (typeof workPackage.children === 'undefined')
        return [];
    return workPackage.children.filter(child => child.status !== 'On hold');
};

const checkPackage = (workPackage, depth) => {
    if (depth <= 0)
        return packageChildren(workPackage).length > 0;
    if (packageChildren(workPackage).length === 0)
        return false;
    return packageChildren(workPackage).some((child) => checkPackage(child, depth - 1));
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
    const section = insertSection(container, 'Organizational chart', 'organigram');
    const mainProjectContainer = insertCardContainer(section, 'main-project');
    const subProjectsContainer = insertCardContainer(section, 'sub-projects');
    insertCard(mainProjectContainer, 'Harpokrat'); // TODO dynamic name
    Object.keys(projectTree).forEach((project) => {
        if (projectTree[project].some((epic) => checkPackage(epic, 2))) {
            insertCard(subProjectsContainer, project);
        }
    });
};

const insertEpicCards = (container, epic) => {
    if (checkPackage(epic, 2)) {
        const epicContainer = insertVerticalCardContainer(container);
        insertCard(epicContainer, packageStr(epic));
        packageChildren(epic).forEach((feature) => {
            if (checkPackage(feature, 1)) {
                insertCard(epicContainer, packageStr(feature));
            }
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
    const section = insertSection(container, 'Projects cards', 'projects-cards');
    Object.keys(projectTree).forEach((project, id) => {
        if (projectTree[project].some((epic) => checkPackage(epic, 2))) {
            insertProjectCards(section, project, projectTree[project]);
        }
    });
};

const getProgressBar = (workPackage) => {
    const percent = workPackage['status'] === 'Done' ? '100%' : (workPackage['progress-'] + '%');
    return '<div class="progress-bar-container">' +
        '<div class="progress-bar" style="width:' + percent + '"></div>' +
        '<span>' + percent + '</span>' +
        '</div>';
};

const insertUserStory = (container, userStory) => {
    let tableClasses = 'user-story';
    if (userStory['status'] === 'Rejected') {
        tableClasses += ' rejected';
    }
    const table = insertElement(container, '<table class="' + tableClasses + '"></table>');
    insertElement(table, '<thead><tr><th colspan="2">' + packageStr(userStory) + ' - ' + userStory['status'] + '</th></tr></thead>');
    const tableBody = insertElement(table, '<tbody></tbody>');
    if (userStory.as.length > 0 && userStory['i-wantto'].length > 0) {
        insertElement(tableBody, '<tr><td><b>As:</b> ' + userStory.as + '</td><td><b>I want to:</b> ' + userStory['i-wantto'] + '</td></tr>');
    }
    if (userStory.description.length > 0) {
        insertElement(tableBody, '<tr><td colspan="2"><b>Description:</b><br>' + userStory.description + '</td></tr>');
    }
    let userStoryEstimatedTime = 0;
    if (checkPackage(userStory, 0)) {
        const dodTableContainer =
            insertElement(
                insertElement(
                    tableBody, '<tr></tr>'
                ), '<td colspan="2"></td>'
            );
        insertElement(dodTableContainer, '<b>Definition of done:</b>');
        const dodTable = insertElement(dodTableContainer, '<table class="definition-of-done"></table>');
        insertElement(dodTable, '<thead><tr><th>Task</th><th>State</th><th>Estimated time</th><th>Progress</th></tr></thead>');
        const dodTableBody = insertElement(dodTable, '<tbody></tbody>');
        packageChildren(userStory).forEach((task) => {
            const estimatedTime = (task['estimated-time'] ? task['estimated-time'] : '0');
            userStoryEstimatedTime += parseFloat(estimatedTime);
            insertElement(dodTableBody, '<tr>' +
                '<td>' + packageStr(task) + '</td>' +
                '<td>' + task.status + '</td>' +
                '<td>' + estimatedTime + ' h/H</td>' +
                '<td>' + getProgressBar(task) + '</td>' +
                '</tr>');
        });
    }
    userStoryEstimatedTime = Math.round(userStoryEstimatedTime * 10) / 10;
    const tableFooter = insertElement(table, '<tfoot></tfoot>');
    insertElement(tableFooter, '<tr><td><b>Estimated time:</b></td><td>' + userStoryEstimatedTime.toString() + ' h/H</td></tr>');
    insertElement(tableFooter, '<tr><td><b>Progress:</b></td><td>' + getProgressBar(userStory) + '</td></tr>');
};

const insertFeatureUserStories = (container, features) => {
    if (checkPackage(features, 1)) {
        const featureContainer = insertArticle(container, packageStr(features), 'feature-user-stories', 'h4');
        packageChildren(features).forEach((userStory) => {
            if (checkPackage(userStory, 0)) {
                insertUserStory(featureContainer, userStory);
            }
        });
    }
};

const insertEpicUserStories = (container, epic) => {
    if (checkPackage(epic, 2)) {
        const epicContainer = insertArticle(container, packageStr(epic), 'epic-user-stories', 'h3');
        packageChildren(epic).forEach((feature) => {
            insertFeatureUserStories(epicContainer, feature);
        });
    }
};

const insertProjectUserStories = (container, projectName, projectTree) => {
    const projectContainer = insertArticle(container, projectName, 'project-user-stories');
    projectTree.forEach((epic) => {
        insertEpicUserStories(projectContainer, epic);
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
};

module.exports = formatProjectTree;
