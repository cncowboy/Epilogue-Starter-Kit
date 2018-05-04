const config = {
  // if process.env is not being set, you may need to set 'Defaults env_keep +=' in the /etc/sudoers
  environment: process.env.NODE_ENV || 'development', // development, testing, staging or production
  protocol: process.env.PROTOCOL || 'http',
  httpsCert: process.env.HTTPS_CERT || '<path/to/https/server.crt>',
  httpsKey: process.env.HTTPS_KEY || '<path/to/https/key.pem>',
  allowBadCertForDev: process.env.ALLOW_BAD_CERT_FOR_DEV || 'YES',
  relativePaths: process.env.RELATIVE_PATHS || 'YES',
  auth0Logout: process.env.AUTH0_LOGOUT || 'NO',
  port: process.env.PORT || 4000,
  host: process.env.WEBSITE_HOSTNAME || 'localhost',
  dbString: process.env.DATABASE_URL || {
    database: 'sport_corp', username: 'root', password: '123456', host : '127.0.0.1', port : '3306', dialect : 'mysql'
  },
  urlencodedExtended: process.env.URL_ENCODED_EXTENDED || 'NO',
  force: process.env.FORCE || 'YES', // YES to clear the db on server restart
  sessionSecret: process.env.SESSION_SECRET || '<SESSION_SECRET>',
  sessionResave: process.env.SESSION_RESAVE || 'NO',
  sessionSaveUninitialized: process.env.SESSION_SAVE_UNINITIALIZED || 'YES',
  authOptionsDisabled: (process.env.AUTH_OPTIONS_DISABLED ? process.env.AUTH_OPTIONS_DISABLED.split(' ') : false) || ['twitter'], // OAuth 2.0 preferred
  disabledDefaultMilestones: (process.env.DISABLED_DEFAULT_MILESTONES ? process.env.DISABLED_DEFAULT_MILESTONES.split(' ') : false) || [],
  tokenExpiresIn: process.env.TOKEN_EXPIRES_IN || (60 * 60 * 24 * 180), // 180 days
  cookieMaxAge: process.env.COOKIE_MAX_AGE || (60 * 60 * 24 * 180 * 1000), // 180,000 days
  authFailureRedirect: process.env.AUTH_FAILURE_REDIRECT || '/authFailure',
  authSuccessRedirect: process.env.AUTH_SUCCESS_REDIRECT || '/getUserDataTest',
  loggedOutScreen: process.env.LOGGED_OUT_SCREEN || '/loggedOutScreen',
  passportSession: process.env.PASSPORT_SESSION || 'NO',
  httpOnlyCookie: process.env.HTTP_ONLY_COOKIE || 'YES',
  authMethods: {
    auth0: {
      id: process.env.AUTH0_CLIENT_ID || '<AUTH0_CLIENT_ID>',
      secret: process.env.AUTH0_CLIENT_SECRET || '<AUTH0_CLIENT_SECRET>',
      domain: process.env.AUTH0_DOMAIN || '<DOMAIN>.auth0.com',
      callbackURL: process.env.AUTH0_CALLBACK_URL || '/login/auth0/callback',
      scope: (process.env.AUTH0_SCOPE ? process.env.AUTH0_SCOPE.split(' ') : false) || ['email'],
    },
    facebook: {
      id: process.env.FACEBOOK_CLIENT_ID || '<FACEBOOK_CLIENT_ID>',
      secret: process.env.FACEBOOK_CLIENT_SECRET || '<FACEBOOK_CLIENT_SECRET>',
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/login/facebook/callback',
      // eslint-disable-next-line
      profileFields: (process.env.FACEBOOK_PROFILE_FIELDS ? process.env.FACEBOOK_PROFILE_FIELDS.split(' ') : '') || ['id', 'email', 'picture.type(large)', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified'],
      scope: (process.env.FACEBOOK_SCOPE ? process.env.FACEBOOK_SCOPE.split(' ') : false) || ['email', 'public_profile', 'user_friends'],
    },
    google: {
      id: process.env.GOOGLE_CLIENT_ID || '<GOOGLE_CLIENT_ID>',
      secret: process.env.GOOGLE_CLIENT_SECRET || '<GOOGLE_CLIENT_SECRET>',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/login/google/callback',
      scope: (process.env.GOOGLE_SCOPE ? process.env.GOOGLE_SCOPE.split(' ') : false) || ['email', 'profile'],
    },
    twitter: {
      id: process.env.TWITTER_CONSUMER_KEY || '<TWITTER_CONSUMER_KEY>',
      secret: process.env.TWITTER_CONSUMER_SECRET || '<TWITTER_CONSUMER_SECRET>',
      callbackURL: process.env.TWITTER_CALLBACK_URL || '/login/twitter/callback',
    },
    local: {

    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || '<JWT_SECRET>',
    credentialsRequired: process.env.CREDENTIALS_REQUIRED || 'NO',
  },
  tests: {
    exitOnFinishingTests: process.env.EXIT_ON_FINISHING_TEST || 'YES',
  },
  winston: {
    tailable: process.env.TAILABLE_WINSTON || 'YES',
    maxsize: process.env.MAXSIZE_WINSTON || 50000,
    maxFiles: process.env.MAX_FILES_WINSTON || 5,
    zippedArchive: process.env.ZIPPED_ARCHIVE_WINSTON || 'YES',
  },
  email: {
    mailAtLevel: (process.env.MAIL_AT_LEVEL ? process.env.MAIL_AT_LEVEL.split(' ') : false) || ['error', 'crit', 'alert', 'emerg'],
    service: process.env.MAIL_SERIVCE || '<MAIL_SERIVCE>',
    user: process.env.MAIL_USER || '<MAIL_USER>',
    pass: process.env.MAIL_PASS || '<MAIL_PASS>',
    defaultFrom: process.env.MAIL_DEFAULT_FROM || '<MAIL_DEFAULT_FROM>',
    defaultTo: process.env.MAIL_DEFAULT_TO || '<MAIL_DEFAULT_TO>',
    defaultSubject: process.env.MAIL_DEFAULT_SUBJECT || '<MAIL_DEFAULT_SUBJECT>',
    defaultText: process.env.MAIL_DEFAULT_TEXT || '<MAIL_DEFAULT_TEXT>',
  },
  messages: {
    deleteMessage: process.env.MESSAGES_DELETE_MESSAGE || 'Deleted!',
    unauthorized: process.env.MESSAGES_UNAUTHORIZED || 'Unauthorized',
    defaultMessage: process.env.MESSAGES_DEFAULT_MESSAGE || 'Default Message',
    authFailure: process.env.MESSAGES_AUTH_FAILURE || 'Auth Failure!',
    getUserDataTestError: process.env.MESSAGES_GET_USER_DATA_TEST_ERROR || 'No user data found',
    loggedOutScreenSuccess: process.env.MESSAGES_LOGGED_OUT_SCREEN_SUCCESS || 'logged out',
    loggedOutScreenError: process.env.MESSAGES_LOGGED_OUT_SCREEN_ERROR || 'still logged in!',
    userResourceNotFound: process.env.USER_RESOURCE_NOT_FOUND || 'Something is wrong with the server',
    userResourceNotFoundDev: process.env.USER_RESOURCE_NOT_FOUND || 'The User resource is required!',
  },
};
module.exports = config;
