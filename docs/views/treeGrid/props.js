import { parseComponent } from 'vue-template-compiler';
import mdText from 'raw-loader!./api/treeGrid.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';
import CellRenderer from './example/CellRenderer';
import CellRendererRaw from '!!raw-loader!./example/CellRenderer';
import Toolbar from './example/Toolbar';
import ToolbarRaw from '!!raw-loader!./example/Toolbar';

export default {
  mdText,
  components: {
    Default: {
      description: '트리 그리드 컴포넌트입니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
    CellRenderer: {
      component: CellRenderer,
      parsedData: parseComponent(CellRendererRaw),
    },
    Toolbar: {
      component: Toolbar,
      parsedData: parseComponent(ToolbarRaw),
    },
  },
};
