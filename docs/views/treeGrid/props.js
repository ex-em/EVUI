import { parseComponent } from 'vue-template-compiler';
import mdText from 'raw-loader!./api/treeGrid.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';
import CellRenderer from './example/CellRenderer';
import CellRendererRaw from '!!raw-loader!./example/CellRenderer';
import Toolbar from './example/Toolbar';
import ToolbarRaw from '!!raw-loader!./example/Toolbar';
import ColumnEvent from './example/ColumnEvent.vue';
import ColumnEventRaw from '!!raw-loader!./example/ColumnEvent.vue';
import ColumnSetting from './example/ColumnSetting.vue';
import ColumnSettingRaw from '!!raw-loader!./example/ColumnSetting.vue';
import CustomHeader from './example/CustomHeader.vue';
import CustomHeaderRaw from '!!raw-loader!./example/CustomHeader.vue';

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
    ColumnEvent: {
      component: ColumnEvent,
      parsedData: parseComponent(ColumnEventRaw),
    },
    'Custom Column List': {
      component: ColumnSetting,
      parsedData: parseComponent(ColumnSettingRaw),
    },
    'Custom Table Header': {
      component: CustomHeader,
      parsedData: parseComponent(CustomHeaderRaw),
    },
  },
};
