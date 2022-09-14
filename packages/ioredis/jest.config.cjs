const base = require('../../jest.config.base.cjs');
const packageJson = require('./package.json');

const packageName = packageJson.name;

module.exports = {
  ...base,
  displayName: packageName
};
