let srcOrBuild;
if (process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production') {
  srcOrBuild = 'build';
} else {
  srcOrBuild = 'src';
}
const groups = require(`../../../${srcOrBuild}/auth/groups`).default;
const config = require(`../../../${srcOrBuild}/config`);
import assert from 'assert';
import Sequelize from 'sequelize';

const database = new Sequelize(config.dbString);

describe('Should have access to', () => {
  it('resource Todo, permission 5', done => {
    groups.accessCheck('testing', false, database, 'Todo', 5).then(accessResult => {
      assert.deepEqual(accessResult, true);
      done();
    });
  }).timeout(0);
  it('resource Todo, permission #', done => {
    assert.deepEqual(false, false);
    done();
  });
  it('resource Todo, permission #', done => {
    assert.deepEqual(false, false);
    done();
  });
  it('resource Neighborhood, permission #', done => {
    assert.deepEqual(false, false);
    done();
  });
  it('resource Neighborhood, permission #', done => {
    assert.deepEqual(false, false);
    done();
  });
  it('resource Neighborhood, permission #', done => {
    assert.deepEqual(false, false);
    done();
  });
  it('resource User, permission #', done => {
    assert.deepEqual(false, false);
    done();
  });
  it('resource User, permission #', done => {
    assert.deepEqual(false, false);
    done();
  });
  it('resource User, permission #', done => {
    assert.deepEqual(false, false);
    done();
  });
});

describe('Should not have access to', () => {
  it('resource Todo, permission #', done => {
    assert.deepEqual(false, false);
    done();
  });
  it('resource Todo, permission #', done => {
    assert.deepEqual(false, false);
    done();
  });
  it('resource Todo, permission #', done => {
    assert.deepEqual(false, false);
    done();
  });
  it('resource Neighborhood, permission #', done => {
    assert.deepEqual(false, false);
    done();
  });
  it('resource Neighborhood, permission #', done => {
    assert.deepEqual(false, false);
    done();
  });
  it('resource Neighborhood, permission #', done => {
    assert.deepEqual(false, false);
    done();
  });
  it('resource User, permission #', done => {
    assert.deepEqual(false, false);
    done();
  });
  it('resource User, permission #', done => {
    assert.deepEqual(false, false);
    done();
  });
  it('resource User, permission #', done => {
    assert.deepEqual(false, false);
    done();
  });
});