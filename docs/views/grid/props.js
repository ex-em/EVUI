import { parseComponent } from 'vue-template-compiler';
import mdText from 'raw-loader!./api/grid.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';
import CellRenderer from './example/CellRenderer';
import CellRendererRaw from '!!raw-loader!./example/CellRenderer';
import Toolbar from './example/Toolbar';
import ToolbarRaw from '!!raw-loader!./example/Toolbar';
import Summary from './example/Summary';
import SummaryRaw from '!!raw-loader!./example/Summary';

export default {
  mdText,
  components: {
    Default: {
      description: '그리드 컴포넌트입니다.',
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
    Summary: {
      component: Summary,
      parsedData: parseComponent(SummaryRaw),
    },
  },
};
