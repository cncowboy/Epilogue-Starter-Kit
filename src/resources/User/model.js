import modelFields from '../../resourcesBuilder/modelFields';
import PassportLocalSequelize from 'passport-local-sequelize';

export default {
  setup(database, sequelize, name, isGroup) {
    let fields = {
      id: { type: sequelize.STRING, unique: true },
      username: sequelize.STRING,
      emailAddress: sequelize.STRING,
      profilePicture: sequelize.STRING,
      userid: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      signName: {
        type: sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      hash: {
        type: sequelize.TEXT,
        allowNull: false,
      },
      salt: {
        type: sequelize.STRING,
        allowNull: false,
      },
      activationKey: {
        type: sequelize.STRING,
        allowNull: true,
      },
      resetPasswordKey: {
        type: sequelize.STRING,
        allowNull: true,
      },
      verified: {
        type: sequelize.BOOLEAN,
        allowNull: true,
      },
    };
    fields = modelFields.addDefaultFields(fields, sequelize, isGroup);
    const model = database.define(name, fields);

    PassportLocalSequelize.attachToUser( model, {
      usernameField: 'signName',
      hashField: 'hash',
      saltField: 'salt',
    });

    return model;
  },
};
