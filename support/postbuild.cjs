const fs = require('node:fs');
const path = require('node:path');

function postBuild() {
  const filename = path.resolve('package.json');
  const json = JSON.parse(fs.readFileSync(filename, 'utf-8'));
  delete json.private;
  delete json.scripts;
  delete json.devDependencies;
  fs.writeFileSync(
    path.resolve('./build/package.json'),
    JSON.stringify(json, undefined, 2),
    'utf-8',
  );
  fs.copyFileSync(
    path.resolve('./build/types/index.d.ts'),
    path.resolve('./build/types/index.d.cts'),
  );
}

postBuild();
