import merge from 'deepmerge';
import epilogueAuth from './epilogueAuth';
import utilities from '../utilities';
import config from '../config';

export default {
  /** @function
   * @name addMilestones
   * @param {object} milestoneParamObj
   * @param {Array} sharedParameters
   * @param {object} authMilestone
   * @return object
   * @description Returns all of the allowed default milestones plus the milestones the function was given
   */
  addMilestones(milestoneParamObj, sharedParameters, authMilestone) {
    let totalParameters = [];
    let authMilestoneReturn = authMilestone;
    Object.entries(milestoneParamObj).forEach(([milestoneParamObjKey, milestoneParamObjVal]) => {
      if (!(Array.isArray(config.disabledDefaultMilestones) && config.disabledDefaultMilestones.indexOf(milestoneParamObjKey) !== -1)) {
        totalParameters = sharedParameters.concat(milestoneParamObjVal);
        authMilestoneReturn = this[milestoneParamObjKey](authMilestoneReturn, ...totalParameters);
      }
    });
    return authMilestoneReturn;
  },
  /** @function
   * @name returnUserId
   * @param {object} req
   * @param {boolean} guestIfNoUser
   * @return object
   * @description Helper function that returns a user's id conditionally. Note that if guest is returned, a guest user must exist
   */
  returnUserId(req, guestIfNoUser) {
    if (((req || {}).body) && ((req || {}).user || {}).id) {
      return req.user.id;
    } else if (guestIfNoUser === true) {
      return 'guest';
    }
    return null;
  },
  /** @function
   * @name ownResource
   * @param {object} totalAuthMilestone
   * @param {Array} actionsList
   * @param {number} i
   * @param {*} aa
   * @param {string} name
   * @param {Array} userAAs
   * @param {boolean} isGroup
   * @param {boolean} isHttpTest
   * @param {boolean} validTestNumber
   * @param {*} permissionsInput
   * @param {object} sequelize
   * @return object
   * @description Returns a possibly modified version of totalAuthMilestone. When an instance of a resource is created,
   *  the UserID and/or OwnerID column is updated
   */
  ownResource(totalAuthMilestone, actionsList, i, aa, name, userAAs, isGroup, isHttpTest, validTestNumber, permissionsInput, sequelize) {
    if (actionsList[i] === 'create') {
      const authMilestone = {};
      authMilestone[actionsList[i]] = {};
      authMilestone[actionsList[i]].write = {};
      // eslint-disable-next-line
      authMilestone[actionsList[i]].write.before = ((req, res, context) => new Promise(async (resolve) => {
        const userId = this.returnUserId(req, false);
        const permissions = epilogueAuth.convertRealOrTestPermissions(permissionsInput, name, isHttpTest, validTestNumber);
        const isAdminResult = await this.isAdmin(userId, sequelize);
        if ((isAdminResult === true) || (this.adminsOnly(permissions) === false)) {
          if (isGroup === true) {
            req.body.OwnerID = userId;
          }
          if ((userAAs.indexOf(name) >= 0) || (epilogueAuth.belongsToUserResourceCheck(aa))) {
            req.body.UserId = userId;
          }
          req.body.updatedBy = userId;
          resolve(context.continue);
        } else {
          res.status(401).send({ message: 'Unauthorized' });
          resolve(context.stop);
        }
      }));
      return merge(authMilestone, totalAuthMilestone);
    }
    return totalAuthMilestone;
  },
  /** @function
   * @name isAdmin
   * @param {string} userId
   * @param {object} sequelize
   * @return promise
   */
  isAdmin(userId, sequelize) {
    return sequelize.query(`SELECT * FROM "Admins" where "AdminId" = '${userId}'`, { type: sequelize.QueryTypes.SELECT })
      .then((adminResults) => {
        utilities.winstonWrapper(`admin user check: ${adminResults}`);
        return Boolean(adminResults.length);
      });
  },
  /** @function
   * @name adminsOnly
   * @param {Array} permissions
   * @return boolean
   */
  adminsOnly(permissions) {
    return Boolean((permissions[1] === true) && (permissions[6] === false) && (permissions[11] === false) && (permissions[16] === false));
  },
  /** @function
   * @name ownResource
   * @param {object} totalAuthMilestone
   * @param {Array} actionsList
   * @param {number} i
   * @param {*} aa
   * @param {string} name
   * @param {Array} userAAs
   * @param {object} model
   * @param {boolean} isHttpTest
   * @param {boolean} validTestNumber
   * @param {*} permissionsInput
   * @return object
   * @description Returns a possibly modified version of totalAuthMilestone. Only list owned resources under certain permissions
   */
  listOwned(totalAuthMilestone, actionsList, i, aa, name, userAAs, model, isHttpTest, validTestNumber, permissionsInput) {
    if ((actionsList[i] === 'list')) {
      const authMilestone = {};
      authMilestone[actionsList[i]] = {};
      authMilestone[actionsList[i]].fetch = {};
      // eslint-disable-next-line
      authMilestone[actionsList[i]].fetch.before = ((req, res, context) => new Promise(async(resolve) => {
        const permissions = epilogueAuth.convertRealOrTestPermissions(permissionsInput, name, isHttpTest, validTestNumber);
        if (permissions[0] === true && permissions[10] === false && permissions[15] === false) {
          if ((((req || {}).user || {}).id)) {
            if ((name === 'User') || (userAAs.indexOf(name) >= 0) || (epilogueAuth.belongsToUserResourceCheck(aa))) {
              const findAllObj = {
                all: true,
              };
              if (name === 'User') {
                findAllObj.where = { id: req.user.id };
              } else {
                findAllObj.where = { UserId: req.user.id };
              }
              return model.findAll(findAllObj)
                .then((result) => {
                  // eslint-disable-next-line
                  context.instance = result;
                })
                .then(() => resolve(context.skip));
            } else {
              let longMessage = 'With these permissions, users can only list resources that belong to them, ';
              longMessage += 'but this resource can not belong to anyone';
              utilities.winstonWrapper(longMessage, 'warning');
              // eslint-disable-next-line
              context.include = [];
            }
          } else {
            // eslint-disable-next-line
            context.include = null;
          }
        }
        resolve(context.continue);
      }));
      return merge(authMilestone, totalAuthMilestone);
    }
    return totalAuthMilestone;
  },
  /** @function
   * @name deleteGroup
   * @param {object} totalAuthMilestone
   * @param {Array} actionsList
   * @param {number} i
   * @param {*} aa
   * @param {string} name
   * @param {Array} userAAs
   * @param {object} awaitedGroupXrefModel
   * @param {boolean} isGroup
   * @return object
   * @description Returns a possibly modified version of totalAuthMilestone. Deletes GroupXref rows
   */
  deleteGroup(totalAuthMilestone, actionsList, i, aa, name, userAAs, awaitedGroupXrefModel, isGroup) {
    if ((actionsList[i] === 'delete') && (isGroup === true)) {
      const authMilestone = {};
      authMilestone[actionsList[i]] = {};
      authMilestone[actionsList[i]].delete = {};
      // eslint-disable-next-line
      authMilestone[actionsList[i]].delete.before = ((req, res, context) => new Promise(async (resolve) => {
        awaitedGroupXrefModel.destroy({
          where: {
            groupId: req.body.id,
            groupResourceName: name,
          },
        });
        resolve(context.continue);
      }));
      return merge(authMilestone, totalAuthMilestone);
    }
    return totalAuthMilestone;
  },
  /** @function
   * @name deleteGroup
   * @param {object} totalAuthMilestone
   * @param {Array} actionsList
   * @param {number} i
   * @return object
   * @description Returns a possibly modified version of totalAuthMilestone. Adds updatedBy to body
   */
  updateAsLoggedInUser(totalAuthMilestone, actionsList, i) { //  aa, name, userAAs
    if ((actionsList[i] === 'update')) {
      const authMilestone = {};
      authMilestone[actionsList[i]] = {};
      authMilestone[actionsList[i]].update = {};
      // eslint-disable-next-line
      authMilestone[actionsList[i]].update.before = ((req, res, context) => new Promise(async (resolve) => {
        req.body.updatedBy = this.returnUserId(req, false);
        resolve(context.continue);
      }));
      return merge(authMilestone, totalAuthMilestone);
    }
    return totalAuthMilestone;
  },
};
