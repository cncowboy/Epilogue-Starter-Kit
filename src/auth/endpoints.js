// @flow
import jwt from 'jsonwebtoken';
import session from 'express-session';
import config from '../config';
import utilities from '../utilities';

export default {
  /** @function
   * @name setup
   * @param {object} app
   * @param {object} passport
   * @description Creates auth endpoints
   */
  setup(app: {}, passport: {}) {
    if (!config.authOptionsDisabled.indexOf('twitter') || config.authOptionsDisabled.indexOf('twitter') === -1) {
      const sessionObj = {
        secret: config.sessionSecret,
        resave: utilities.yesTrueNoFalse(config.sessionResave),
        saveUninitialized: utilities.yesTrueNoFalse(config.sessionSaveUninitialized),
      };
      sessionObj.cookie = { secure: Boolean(config.protocol.toLowerCase() === 'https') };
      app.use(session(sessionObj));
      passport.serializeUser((user, done) => {
        done(null, user);
      });

      passport.deserializeUser((user, done) => {
        done(null, user);
      });
    }
    app.get('/register',
      passport.authenticate('local.register', {
        successRedirect: '/registerSuccess',
        failureRedirect: '/registerFailure',
        failureFlash: true
      }), function(req, res, next) {

      });
    const authMethods = Object.keys(config.authMethods);
    authMethods.forEach((authMethod) => {
      if (!(Array.isArray(config.authOptionsDisabled) && config.authOptionsDisabled.indexOf(authMethod) !== -1)) {
        const passportSession = utilities.yesTrueNoFalse(config.passportSession);
        const failureRedirect = config.authFailureRedirect;
        const { authSuccessRedirect } = config;
        const authOptionsObj = { failureRedirect };
        let passportAuthenticate = '';
        if (authMethod !== 'twitter') {
          const authMethodObj = config.authMethods[authMethod];
          const { scope } = authMethodObj;
          passportAuthenticate = passport.authenticate(authMethod, { scope, session: passportSession });
          authOptionsObj.session = passportSession;
        } else {
          passportAuthenticate = passport.authenticate(authMethod);
        }

        app.get(
          `/login/${authMethod}`,
          passportAuthenticate,
        );
        app.get(
          `/login/${authMethod}/callback`,
          passport.authenticate(authMethod, authOptionsObj),
          (req, res) => {
            const expiresIn = parseInt(config.tokenExpiresIn, 10);
            const maxAge = parseInt(config.cookieMaxAge, 10);
            const httpOnly = utilities.yesTrueNoFalse(config.httpOnlyCookie);
            const cookieOptions = { maxAge, httpOnly };
            const token = jwt.sign(req.user, config.jwt.secret, { expiresIn });
            res.cookie('id_token', token, cookieOptions);
            res.redirect(authSuccessRedirect);
          },
        );
      }
    });
    app.get(
      '/logout',
      (req, res) => {
        req.logout();
        res.clearCookie('id_token');
        const domainCheck = Boolean(config && config.authMethods.auth0 && config.authMethods.auth0.domain);
        const auth0Logout = utilities.yesTrueNoFalse(config.auth0Logout);
        const host = ((config.port === 443 || config.port === 80) ? config.host : `${config.host}:${config.port}`);
        if (!(Array.isArray(config.authOptionsDisabled) && config.authOptionsDisabled.indexOf('auth0') !== -1) && domainCheck && auth0Logout) {
          res.redirect(`https://${config.auth0.domain}/v2/logout?returnTo=${config.protocol}%3A%2F%2F${host}${config.loggedOutScreen}`);
        } else {
          res.redirect(`${config.protocol}://${host}${config.loggedOutScreen}`);
        }
      },
    );
    app.get(
      '/authFailure',
      (req, res) => {
        res.end(config.messages.authFailure);
      },
    );
    if (config.environment === 'development' || config.environment === 'testing') {
      app.get(
        '/getUserDataTest',
        (req, res) => {
          if (req.user) {
            res.json(req.user);
          } else {
            res.end(config.messages.getUserDataTestError);
          }
        },
      );

      app.get(
        '/loggedOutScreen',
        (req, res) => {
          if (req.user) {
            res.end(config.messages.loggedOutScreenError);
          } else {
            res.end(config.messages.loggedOutScreenSuccess);
          }
        },
      );
    }
  },
};
