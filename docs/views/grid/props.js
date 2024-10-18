import { parseComponent } from 'vue-template-compiler';
import mdText from 'raw-loader!./api/grid.md';
import ColumnSetting from 'docs/views/grid/example/ColumnSetting.vue';
import ColumnSettingRaw from '!!raw-loader!./example/ColumnSetting.vue';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';
import CellRenderer from './example/CellRenderer';
import CellRendererRaw from '!!raw-loader!./example/CellRenderer';
import Toolbar from './example/Toolbar';
import ToolbarRaw from '!!raw-loader!./example/Toolbar';
import Summary from './example/Summary';
import SummaryRaw from '!!raw-loader!./example/Summary';
import RowDetail from './example/RowDetail.vue';
import RowDetailRaw from '!!raw-loader!./example/RowDetail.vue';
import Sort from './example/Sort.vue';
import SortRaw from '!!raw-loader!./example/Sort.vue';
import ColumnEvent from './example/ColumnEvent.vue';
import ColumnEventRaw from '!!raw-loader!./example/ColumnEvent.vue';
import Disabled from './example/Disabled.vue';
import DisabledRaw from '!!raw-loader!./example/Disabled.vue';
import CustomHeader from './example/CustomHeader.vue';
import CustomHeaderRaw from '!!raw-loader!./example/CustomHeader.vue';

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
    RowDetail: {
      component: RowDetail,
      parsedData: parseComponent(RowDetailRaw),
    },
    Sort: {
      component: Sort,
      parsedData: parseComponent(SortRaw),
    },
    ColumnEvent: {
      component: ColumnEvent,
      parsedData: parseComponent(ColumnEventRaw),
    },
    'Custom Column List': {
      component: ColumnSetting,
      parsedData: parseComponent(ColumnSettingRaw),
    },
    Disabled: {
      component: Disabled,
      parsedData: parseComponent(DisabledRaw),
    },
    'Custom Table Header': {
      component: CustomHeader,
      parsedData: parseComponent(CustomHeaderRaw),
    },
  },
};
