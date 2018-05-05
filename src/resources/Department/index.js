import extension from './extension';
import model from './model';
import milestones from './milestones';

const endpoints = ['/departments', '/departments/:id'];
const permissions = 'lcrud|-----|-----|-----';
const isGroup = true;
const autoAssociations = 'Department,Employee';

const exportArray = ['Department', permissions, model, endpoints, extension, autoAssociations, isGroup, milestones];

export default exportArray;
