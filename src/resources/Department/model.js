import modelFields from '../../resourcesBuilder/modelFields';

export default {
  setup(database, sequelize, name, isGroup) {
    let fields = {
      name: sequelize.String,
    };
    fields = modelFields.addDefaultFields(fields, sequelize, isGroup);
    return database.define(name, fields);
  },
};
