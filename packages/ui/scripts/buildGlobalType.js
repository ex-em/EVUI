import * as glob from 'glob';
import * as path from 'path';
import * as fs from 'fs';

const file = './global.d.ts';

fs.writeFileSync(
  file,
  `declare module '@vue/runtime-core' {`,
  { flag: 'w' }
);

function getAllComponents() {
  const components = glob.sync('./src/components/**/*.vue', { cwd: process.cwd() });
  return components.map((component) => path.basename(component, '.vue'));
}

fs.writeFileSync(
  file, `\n  export interface GlobalComponents {`,
  { flag: 'a' }
);
const allComponents = getAllComponents();
allComponents.forEach((component) => {
  fs.writeFileSync(
    file,
    `\n    Ev${component}: typeof import('@evui/ui')['Ev${component}'];`,
    { flag: 'a' }
  );
});
fs.writeFileSync(file, '\n  }', { flag: 'a' });

fs.writeFileSync(
  file,
  `\n  export interface ComponentCustomProperties {`,
  { flag: 'a' }
);

['message', 'messageBox', 'notification'].forEach((notice) => {
  fs.writeFileSync(
    file,
    `\n    $${notice}: typeof import('@evui/ui')['Ev${notice.charAt(0).toUpperCase() + notice.slice(1)}'];`,
    { flag: 'a' }
  );
});

fs.writeFileSync(file, `\n  }
}
export {}`, { flag: 'a' });
