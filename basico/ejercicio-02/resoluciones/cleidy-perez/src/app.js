const packageJson = require('../package.json');

function inspectPackage() {
  const scripts = packageJson.scripts || {};
  const missingScripts = ['start', 'dev', 'check'].filter((name) => !scripts[name]);
  return {
    name: packageJson.name,
    version: packageJson.version,
    scripts,
    dependencies: packageJson.dependencies || {},
    nodeEngine: packageJson.engines?.node || 'not declared',
    valid: missingScripts.length === 0,
    missingScripts,
  };
}

function main() {
  const report = inspectPackage();
  console.log('=== Ejercicio 02: npm scripts y package.json ===');
  console.log(JSON.stringify(report, null, 2));
  if (!report.valid) {
    console.error(`Faltan scripts: ${report.missingScripts.join(', ')}`);
    process.exitCode = 1;
    return;
  }
  console.log('Ejercicio ejecutado correctamente.');
}

if (require.main === module) main();

module.exports = { inspectPackage, main };