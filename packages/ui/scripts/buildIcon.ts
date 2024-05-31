import * as fs from 'fs';
import { iconList } from '../src/components/icon/icon-list';

const css =
  Object.entries(iconList)
    .map(([name, value]) => {
      return `.ev-icon-${name}::before {
  content: '\\${value}';
}`;
    })
    .join('\n') + '\n';

fs.writeFileSync('./src/style/lib/icon.css', css, { flag: 'w' });
