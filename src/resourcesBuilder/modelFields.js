// @flow
export default {
  /** @function
   * @name addDefaultFields
   * @param {object} sequelize
   * @param {object} userDefinedFieldsObj
   * @param {boolean} isGroup
   * @return {object}
   * @description Used in template/model.js
   */
  addDefaultFields(userDefinedFieldsObj: {}, sequelize: {}, isGroup: boolean): {} {
    const fields = userDefinedFieldsObj;
    fields.updatedBy = sequelize.STRING;
    if (isGroup) {
      fields.OwnerID = sequelize.INTEGER;
    }
    return fields;
  },
};
