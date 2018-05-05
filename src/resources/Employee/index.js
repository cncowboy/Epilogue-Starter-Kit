import extension from './extension';
import model from './model';
import milestones from './milestones';

const endpoints = ['/employees', '/employees/:id'];
const permissions = 'lcrud|-----|-----|-----';
const isGroup = false;
const autoAssociations = { belongsTo: 'User' };

const exportArray = ['Employee', permissions, model, endpoints, extension, autoAssociations, isGroup, milestones];

export default exportArray;
