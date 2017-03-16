const gulp = require('gulp');
const shell = require('gulp-shell');
const fs = require('fs-extra');
const winston = require('winston');
const glob = require("glob");
const readline = require('readline');

winston.loggers.add('gulpError', {
  file: {
    filename: 'logs/gulpErrors.log',
    tailable: true,
    maxsize: 50000,
    maxFiles: 5,
    zippedArchive: true,
  },
});
const gulpErrors = winston.loggers.get('gulpError');

winston.loggers.add('testResults', {
  file: {
    filename: 'logs/testResults.log',
    tailable: true,
    maxsize: 50000,
    maxFiles: 5,
    zippedArchive: true,
  },
});
const testResults = winston.loggers.get('testResults');

gulp.task('env-dev', function() {
  return process.env.NODE_ENV = 'development';
});

gulp.task('env-test', function() {
  return process.env.NODE_ENV = 'testing';
});

gulp.task('env-staging', function() {
  return process.env.NODE_ENV = 'staging';
});

gulp.task('env-prod', function() {
  return process.env.NODE_ENV = 'production';
});

gulp.task('env-force', function() {
  return process.env.FORCE = 'YES';
});

gulp.task('server-start', shell.task('npm start'));

gulp.task('server-start-no-nodemon', shell.task('npm run start-no-nodemon'));

gulp.task('server-build', shell.task('npm run build'));

gulp.task('server-serve', shell.task('npm run serve'));

gulp.task('server-http-test', shell.task('npm run http-test'));

gulp.task('server-http-just-aa-test', shell.task('npm run http-just-aa-test'));

gulp.task('server-http-just-access-test', shell.task('npm run http-just-access-test'));

gulp.task('server-test', shell.task('npm run test'));

gulp.task('server-test-all-ignore-config', ['server-http-test', 'server-test']);

gulp.task('build-all', ['server-build', 'wiki-build']);

// main test task
gulp.task('env-test-server', ['env-force', 'env-test', 'server-start-no-nodemon'], function () {
  runHttpTestsOrEnd('test');
});

// main test task
gulp.task('env-staging-server', ['server-build', 'env-force', 'env-staging', 'server-serve'], function () {
  runHttpTestsOrEnd('staging');
});

gulp.task('wiki-build', ['wiki-clear'], function () {
  markdownBuild('src', 'test');
});

gulp.task('wiki-clear', function () {
  fs.emptyDirSync('wiki');
});

gulp.task('reset-test-config', function () {
  fs.readFile('./test/testConfig.json', 'utf8', (testConfigErr, testConfigData) => {
    const testConfig = JSON.parse(testConfigData);
    resetTestConfig(testConfig);
  });
});

/** @function
 * @name markdownBuild
 * @description Runs the moveMarkdown function and the buildCustomSideMenu function if it is enabled in wikiConfig.json
 */
const markdownBuild = function() {
  fs.readFile('wikiConfig.json', 'utf8', (wikiConfigErr, wikiConfigData) => {
    const wikiConfig = JSON.parse(wikiConfigData);
    if(wikiConfig.customSidebar.toUpperCase() === "YES") {
      buildCustomSideMenu(arguments);
    }
  });
  const args = Array.prototype.slice.call(arguments);
  args.forEach(function(arg) {
    moveMarkdown(arg);
  });
  moveMarkdown('miscWikiPages');
};

/** @function
 * @name newMarkdownFileName
 * @param {string} file
 * @returns {string}
 * @description Returns a file name generated from the first line of a markdown file
 */
const newMarkdownFileName = function(file) {
  return new Promise(function(resolve, reject) {
    let lineNumber = 0;
    const rl = readline.createInterface({
      input: fs.createReadStream(file)
    });
    rl.on('line', function (line) {
      // console.log('Line from file:', line);
      if (lineNumber === 0) {
        resolve(line.replace(/^#+/g, '').split(" ").map(i => {
          return ((i !== '') ? (i[0].toUpperCase() + i.substr(1).toLowerCase()) : '');
        }).filter(i => {
          return i !== '';
        }).join("-")+'.md');
      }
      lineNumber += 1;
    });
  });
};

/** @function
 * @name moveMarkdown
 * @param {string} dir
 * @description Copies markdown files to the wiki directory with file names based on the first line of the file
 */
const moveMarkdown = function(dir) {
  let ignoredFile = false;
  let fileName = '';
  let fileNameSections = [];
  const usedFileNames = [];
  glob(`${dir}/**/*.md`, function (er, files) {
    fs.readFile('wikiConfig.json', 'utf8', (wikiConfigErr, wikiConfigData) => {
      const wikiConfig = JSON.parse(wikiConfigData);
      if(Array.isArray(files) && files.length > 0) {
        files.forEach(function(file) {
          fileNameSections = file.split('/');
          fileName = fileNameSections.pop().toLowerCase().trim();
          if(file === 'miscWikiPages/Home.md') {
            fileName = fileName.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
            fs.copy(file, `wiki/${fileName}`, err => {
              if (err) return gulpErrors.error(err);
            })
          } else {
            ignoredFile = false;
            if (Array.isArray(wikiConfig.ignore) && wikiConfig.ignore.length > 0) {
              // console.log('filename', fileName);
              // console.log('wikiConfig.ignore', wikiConfig.ignore);
              if (wikiConfig.ignore.indexOf(fileName) >= 0) {
                ignoredFile = true;
              }
            }
            if (ignoredFile === false) {
              newMarkdownFileName(file).then(function (newFileName) {
                // console.log('newFileName', newFileName);
                if (usedFileNames.indexOf(newFileName) >= 0) {
                  newFileName = `${newFileName} (${fileNameSections.pop()})`;
                }
                usedFileNames.push(newFileName);
                fs.copy(file, `wiki/${newFileName}`, err => {
                  if (err) return gulpErrors.error(err);
                })
              });
            }
          }
        });
      }
    });
  })
};

/** @function
 * @name buildCustomSideMenu
 * @param {Array} arguments
 * @description Not finished
 */
const buildCustomSideMenu = function() {
  const dirs = Array.prototype.slice.call(arguments);
  if(Array.isArray(dirs) && dirs.length > 0) {
    const mainSections = []; // array of arrays
    dirs.forEach(function(dir) {
      // todo
    });
  }
};

/** @function
 * @name resetTestConfig
 * @param {object} testConfig - testConfig.json
 * @description Resets testConfig.json to its starting state
 */
const resetTestConfig = function(testConfig) {
  testConfig.testNumber = 0;
  testConfig.individualHttpTest = false;
  testConfig.testsCasesHaveBeenGenerated = false;
  if(testConfig.generationConfig && testConfig.generationConfig.removePreviousGeneratedTestCases === true) {
    testConfig.testCases = testConfig.testCases.filter(function(testCase) {
      if (testCase.generatedByTestsCasesJs !== true) {
        return testCase;
      }
    });
  } else {
    gulpErrors.error('testConfig.generationConfig is falsy or removePreviousGeneratedTestCases is not true');
  }
  fs.writeFile('./test/testConfig.json', JSON.stringify(testConfig, null, 2), function (err) {
    if (err) return gulpErrors.error(err);
  });
};

/** @function
 * @name endOfTests
 * @description Sets the test status for the currently tests and set the environment to development
 */
const endOfTests = function() {
  fs.readFile('logs/latestTests.log', (err, data) => {
    if (err) {
      gulpErrors.error(err);
      throw err;
    }
    // console.log('latestTests data (gulp)', data.toString('utf8'));
    if (data.toString('utf8').search(/failing/g) != -1) {
      const failedTests = `Did not pass all tests (${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')})`;
      fs.writeFile('logs/latestTests.log', failedTests, function (err) {
        if (err) return gulpErrors.error(err);
        testResults.error(failedTests);
      });

    } else {
      const passedTests = `Passed all tests (${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')})`;
      fs.writeFile('logs/latestTests.log', passedTests, function (err) {
        if (err) return gulpErrors.error(err);
        testResults.info(passedTests);
      });
    }
  });
  process.env.NODE_ENV = 'development';
};

/** @function
 * @name runHttpTests
 * @param {string} env
 * @description Runs http tests until all the test cases in testConfig.json have been run
 */
const runHttpTests = function(env) {
  fs.readFile('./test/testConfig.json', 'utf8', (testConfigErr, testConfigData) => {
    const testConfig = JSON.parse(testConfigData);
    const numOfTestCasesHttp = testConfig.testCases.length;
    if (numOfTestCasesHttp > testConfig.testNumber) {
      testConfig.testNumber = testConfig.testNumber + 1;
      testConfig.individualHttpTest = true;
      fs.writeFile('./test/testConfig.json', JSON.stringify(testConfig, null, 2), function (err) {
        if (err) return gulpErrors.error(err);
        if (env === 'test') {
          gulp.start('env-test-server');
        } else if (env === 'staging') {
          gulp.start('env-staging-server');
        } else {
          gulpErrors.error('environment is not test or staging!');
        }
      });
    } else {
      resetTestConfig(testConfig);
      endOfTests();
    }
  });
};

/** @function
 * @name runHttpTestsOrEnd
 * @param {string} environment
 * @description Runs http tests if they have been enabled in testConfig.json
 */
const runHttpTestsOrEnd = function(environment) {
  fs.readFile('./test/testConfig.json', 'utf8', (testConfigErr, testConfigData) => {
    const testConfig = JSON.parse(testConfigData);
    if (testConfig.doHttpTests === true) {
      runHttpTests(environment);
    } else {
      endOfTests();
    }
  });
};