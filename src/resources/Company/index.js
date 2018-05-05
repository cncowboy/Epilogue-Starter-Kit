import extension from './extension';
import model from './model';
import milestones from './milestones';

const endpoints = ['/companies', '/companies/:id'];
const permissions = 'lcrud|-----|-----|-----';
const isGroup = true;
const autoAssociations = 'Department';

const exportArray = ['Company', permissions, model, endpoints, extension, autoAssociations, isGroup, milestones];

export default exportArray;
