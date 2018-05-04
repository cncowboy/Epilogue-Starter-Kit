// @flow
import passport from 'passport';
import Auth0Strategy from 'passport-auth0';
import FacebookStrategy from 'passport-facebook';
import GoogleStrategy from 'passport-google-oauth20';
import TwitterStrategy from 'passport-twitter';
import config from '../config';
import utilities from '../utilities';

import { Strategy as LocalStrategy } from 'passport-local';

export default {
  /**
   @name passportOptions
   @type object
   @description Storing the passport strategy for easier iteration
   */
  passportOptions: {
    auth0: Auth0Strategy,
    facebook: FacebookStrategy,
    google: GoogleStrategy,
    twitter: TwitterStrategy,
  },
  /** @function
   * @name getFromProfile
   * @param {object} profile
   * @return {object}
   * @description Makes the profile objects from many strategies uniform
   */
  getFromProfile(profile: {}): {} {
    const returnObj = {};
    /* eslint no-underscore-dangle: ["error", { "allow": ["_json"] }] */
    const profileJson = ((profile || {})._json || {});
    returnObj.username = this.getUsername(profile, profileJson);
    returnObj.signName = returnObj.username;
    returnObj.emailAddress = this.getEmailAddress(profileJson);
    returnObj.profilePicture = this.getProfilePicture(profileJson);
    return returnObj;
  },
  /** @function
   * @name getUsername
   * @param {object} profile
   * @param {object} profileJson
   * @return {string}
   * @description Helper function for getFromProfile
   */
  getUsername(profile: {}, profileJson: {}): string {
    let username = (profile || {}).displayName;
    if (!username) {
      username = profileJson.first_name;
      if (username) {
        username += ' ';
      }
      username += profileJson.last_name;
    }
    return username;
  },
  /** @function
   * @name getEmailAddress
   * @param {object} profileJson
   * @return {string}
   * @description Helper function for getFromProfile
   */
  getEmailAddress(profileJson: {}): string {
    let emailAddress = profileJson.email;
    if (!emailAddress) {
      emailAddress = profileJson.emails;
      if (emailAddress) {
        emailAddress = (emailAddress[0] || {}).value;
      }
    }
    return emailAddress;
  },
  /** @function
   * @name getProfilePicture
   * @param {object} profileJson
   * @return {string}
   * @description Helper function for getFromProfile
   */
  getProfilePicture(profileJson: {}): string {
    let profilePicture = ((profileJson.picture || {}).data || {}).url;
    if (!profilePicture) {
      profilePicture = profileJson.profile_image_url_https;
    }
    if (!profilePicture) {
      profilePicture = (profileJson.image || {}).url;
    }
    if (!profilePicture) {
      profilePicture = profileJson.picture;
    }
    return profilePicture;
  },
  /** @function
   * @name getId
   * @param {object} req
   * @param {object} profile
   * @return {string}
   * @description Helper function for setup
   */
  getId(req: {}, profile: {}): string {
    const { id } = ((req || {}).user || {});
    if (!id) {
      return (profile || {}).id;
    }
    return id;
  },
  /** @function
   * @name buildUserObj
   * @param {object} user
   * @param {*} id
   * @return {object}
   * @description Helper function for setup
   */
  buildUserObj(user: {}, id: any): {} {
    const userCopy = user;
    if (typeof id === 'string') {
      userCopy.id = id;
    }
    if (!userCopy.id) {
      utilities.winstonWrapper('Invalid user id in buildUserObj');
    }
    if (!userCopy.username) {
      userCopy.username = userCopy.id;
    }
    return {
      id: userCopy.id,
      username: userCopy.username,
      emailAddress: userCopy.emailAddress,
      profilePicture: userCopy.profilePicture,
      updatedBy: userCopy.id,
    };
  },
  /** @function
   * @name setup
   * @param {map} resourcesFromSetup
   * @return {object}
   * @description Sets up passport
   */
  setup(resourcesFromSetup: Map): {} {
    let passportConfig = {};
    Object.entries(this.passportOptions).forEach(([passportOptionName, PassportStrategy]) => {
      passportConfig = {
        callbackURL: config.authMethods[passportOptionName].callbackURL,
        passReqToCallback: true,
      };
      if (passportOptionName === 'twitter') {
        passportConfig.consumerKey = config.authMethods[passportOptionName].id;
        passportConfig.consumerSecret = config.authMethods[passportOptionName].secret;
        passportConfig.userProfileURL = 'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true';
      } else {
        passportConfig.clientID = config.authMethods[passportOptionName].id;
        passportConfig.clientSecret = config.authMethods[passportOptionName].secret;
      }
      if (passportOptionName === 'auth0') {
        passportConfig.domain = config.authMethods[passportOptionName].domain;
      }
      if (passportOptionName === 'facebook') {
        passportConfig.profileFields = config.authMethods[passportOptionName].profileFields;
      }
      if (!(Array.isArray(config.authOptionsDisabled) && config.authOptionsDisabled.indexOf(passportOptionName) !== -1)) {
        console.log(passportOptionName);

        passport.use(new PassportStrategy(passportConfig, (req, accessToken, refreshToken, extraParams, profile, done) => {
          const authAttempt = async () => {
            const id = this.getId(req, profile);
            const awaitedResourcesFromSetup = await resourcesFromSetup;
            const userResource = awaitedResourcesFromSetup.get('User')[2];
            let userErrorMessage = config.messages.userResourceNotFound;
            if (config.environment === 'development' || config.environment === 'testing') {
              userErrorMessage = config.messages.userResourceNotFoundDev;
            }
            utilities.throwErrorConditionally(userResource, userErrorMessage);
            let foundUser = await userResource.findOne({
              attributes: ['id', 'username', 'emailAddress', 'profilePicture'],
              where: {id},
            });
            if (!id) {
              foundUser = false;
            }
            if (foundUser) {
              if (foundUser.id && foundUser.username && foundUser.emailAddress && foundUser.profilePicture) {
                done(null, this.buildUserObj(foundUser, false));
              } else if (foundUser.id) {
                const userData = this.getFromProfile(profile);
                done(null, this.buildUserObj(userData, foundUser.id));
              } else {
                done();
              }
            } else {
              const userData = this.getFromProfile(profile);
              const user = await userResource.create(this.buildUserObj(userData, id));
              done(null, this.buildUserObj(user, false));
            }
          };
          authAttempt().catch(done);
        }));
      }

      passport.use(new PassportStrategy(passportConfig, (username, password, done) => {
        const authAttempt = async () => {
          const awaitedResourcesFromSetup = await resourcesFromSetup;
          const userResource = awaitedResourcesFromSetup.get('User')[2];
          const authenticate = userResource.authenticate();
          authenticate(username, password, done);
        };
        authAttempt().catch(done);
      }));
    });

    return passport;
  },
};
