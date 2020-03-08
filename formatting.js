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

const getProgressBarFromPercent = (percent) =>
    ('<div class="progress-bar-container">' +
        '<div class="progress-bar" style="width:' + percent + '%"></div>' +
        '<span>' + percent + '%</span>' +
        '</div>');

const getPackagePercent = (workPackage) =>
    (workPackage['status'] === 'Done') ? '100' : workPackage['progress-'];

const getProgressBar = (workPackage) =>
    getProgressBarFromPercent(getPackagePercent(workPackage));

const insertUserStory = (container, userStory) => {
    let tableClasses = 'user-story';
    if (userStory['status'] === 'Rejected') {
        tableClasses += ' rejected';
    }
    const table = insertElement(container, '<table class="' + tableClasses + '"></table>');
    insertElement(table, '<thead><tr><th colspan="2">' + packageStr(userStory) + ' - ' + userStory['status'] + '</th></tr></thead>');
    const tableBody = insertElement(table, '<tbody></tbody>');
    if (userStory.assignee && userStory.assignee.length > 0) {
        insertElement(tableBody, '<tr><td colspan="2"><b>Assignee:</b> ' + userStory.assignee + '</td></tr>');
    }
    if (userStory.as.length > 0 && userStory['i-wantto'].length > 0) {
        insertElement(tableBody, '<tr><td><b>As:</b> ' + userStory.as + '</td><td><b>I want to:</b> ' + userStory['i-wantto'] + '</td></tr>');
    }
    if (userStory.description.length > 0) {
        insertElement(tableBody, '<tr><td colspan="2"><b>Description:</b><br>' + userStory.description + '</td></tr>');
    }
    let usersEstimatedTime = {'*': 0, 'Unassignee': 0};
    let progress = 0;
    let progressDivider = 0;
    if (checkPackage(userStory, 0)) {
        const dodTableContainer =
            insertElement(
                insertElement(
                    tableBody, '<tr></tr>'
                ), '<td colspan="2"></td>'
            );
        insertElement(dodTableContainer, '<b>Definition of done:</b>');
        const dodTable = insertElement(dodTableContainer, '<table class="definition-of-done"></table>');
        insertElement(dodTable, '<thead><tr><th>Task</th><th>Assignee</th><th>State</th><th>Estimated time</th><th>Progress</th></tr></thead>');
        const dodTableBody = insertElement(dodTable, '<tbody></tbody>');
        packageChildren(userStory).forEach((task) => {
            const estimatedTime = (task['estimated-time'] ? task['estimated-time'] : '0');
            progress += parseFloat(getPackagePercent(task));
            progressDivider += 1;
            if (task.assignee && task.assignee.length !== 0) {
                if (!usersEstimatedTime.hasOwnProperty(task.assignee)) {
                    usersEstimatedTime[task.assignee] = 0;
                }
                usersEstimatedTime[task.assignee] += parseFloat(estimatedTime);
            } else {
                usersEstimatedTime['Unassignee'] += parseFloat(estimatedTime);
            }
            usersEstimatedTime['*'] += parseFloat(estimatedTime);
            insertElement(dodTableBody, '<tr>' +
                '<td>' + packageStr(task) + '</td>' +
                '<td style="white-space:nowrap;">' + (task.assignee ? task.assignee : 'Unassignee') + '</td>' +
                '<td style="white-space:nowrap;">' + task.status + '</td>' +
                '<td>' + estimatedTime + ' h/H</td>' +
                '<td>' + getProgressBar(task) + '</td>' +
                '</tr>');
        });
    }
    if (progressDivider !== 0)
        progress = Math.round(progress / progressDivider);
    usersEstimatedTime['*'] = Math.round(usersEstimatedTime['*'] * 10) / 10;
    const tableFooter = insertElement(table, '<tfoot></tfoot>');
    insertElement(tableFooter, '<tr><td><b>Estimated time:</b></td><td>' + usersEstimatedTime['*'].toString() + ' h/H</td></tr>');
    insertElement(tableFooter, '<tr><td><b>Progress:</b></td><td>' + getProgressBarFromPercent(progress) + '</td></tr>');
    return usersEstimatedTime;
};

const mergeObjectsSum = (a, b) => {
    Object.keys(b).forEach((key) => {
        if (!a.hasOwnProperty(key)) {
            a[key] = 0;
        }
        a[key] += b[key];
    });
    return a;
};

const insertFeatureUserStories = (container, features) => {
    let totalEstimatedTime = {};
    if (checkPackage(features, 1)) {
        const featureContainer = insertArticle(container, packageStr(features), 'feature-user-stories', 'h4');
        packageChildren(features).forEach((userStory) => {
            if (checkPackage(userStory, 0)) {
                totalEstimatedTime = mergeObjectsSum(totalEstimatedTime, insertUserStory(featureContainer, userStory));
            }
        });
    }
    return totalEstimatedTime;
};

const insertEpicUserStories = (container, epic) => {
    let totalEstimatedTime = {};
    if (checkPackage(epic, 2)) {
        const epicContainer = insertArticle(container, packageStr(epic), 'epic-user-stories', 'h3');
        packageChildren(epic).forEach((feature) => {
            totalEstimatedTime = mergeObjectsSum(totalEstimatedTime, insertFeatureUserStories(epicContainer, feature));
        });
    }
    return totalEstimatedTime;
};

const insertProjectUserStories = (container, projectName, projectTree) => {
    const projectContainer = insertArticle(container, projectName, 'project-user-stories');
    let totalEstimatedTime = {};
    projectTree.forEach((epic) => {
        totalEstimatedTime = mergeObjectsSum(totalEstimatedTime, insertEpicUserStories(projectContainer, epic));
    });
    return totalEstimatedTime;
};

const insertUserStories = (projectTree, container) => {
    const section = insertSection(container, 'User stories', 'user-stories');
    let totalEstimatedTime = {};
    Object.keys(projectTree).forEach((project, id) => {
        if (projectTree[project].some((epic) => checkPackage(epic, 2))) {
            totalEstimatedTime = mergeObjectsSum(totalEstimatedTime, insertProjectUserStories(section, project, projectTree[project]));
        }
    });
    console.log(totalEstimatedTime);
    insertElement(container, '<h2>Total estimated time</h2>');
    const statisticsTable = insertElement(container, '<table class="final-statistics"></table>');
    insertElement(statisticsTable, '<thead><tr><th>Assignee</th><th>Estimated time</th></tr></thead>');
    const statisticsTableBody = insertElement(statisticsTable, '<tbody></tbody>');
    Object.keys(totalEstimatedTime).forEach((assignee) => {
        if (assignee !== '*' && assignee !== 'Unassignee') {
            insertElement(statisticsTableBody, '<tr>' +
                '<td>' + assignee + '</td>' +
                '<td>' + totalEstimatedTime[assignee].toString() + ' h/H</td>' +
                '</tr>');
        }
    });
    insertElement(statisticsTableBody, '<tr><td>Unassignee</td><td>' + totalEstimatedTime['Unassignee'].toString() + ' h/H</td></tr>');
    insertElement(statisticsTable, '<tfoot><tr><td>Total</td><td>' + totalEstimatedTime['*'].toString() + ' h/H</td></tr></tfoot>');
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
