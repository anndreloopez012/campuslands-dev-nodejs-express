const pkg = require('../../package.json');

function getInfo() {
  return {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    node: pkg.engines.node,
  };
}

function listScripts() {
  return Object.entries(pkg.scripts).map(([name, command]) => ({ name, command }));
}

function findScript(name) {
  const command = pkg.scripts[name];
  return command === undefined ? null : { name, command };
}

module.exports = { getInfo, listScripts, findScript };
