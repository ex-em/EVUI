import { parse } from "@vue/compiler-sfc";
import ColumnSetting from "docs/views/grid/example/ColumnSetting.vue";
import mdText from "./api/grid.md?raw";
import ColumnSettingRaw from "./example/ColumnSetting.vue?raw";
import Default from "./example/Default";
import DefaultRaw from "./example/Default?raw";
import CellRenderer from "./example/CellRenderer";
import CellRendererRaw from "./example/CellRenderer?raw";
import Toolbar from "./example/Toolbar";
import ToolbarRaw from "./example/Toolbar?raw";
import Summary from "./example/Summary";
import SummaryRaw from "./example/Summary?raw";
import RowDetail from "./example/RowDetail.vue";
import RowDetailRaw from "./example/RowDetail.vue?raw";
import Sort from "./example/Sort.vue";
import SortRaw from "./example/Sort.vue?raw";
import ColumnEvent from "./example/ColumnEvent.vue";
import ColumnEventRaw from "./example/ColumnEvent.vue?raw";
import Disabled from "./example/Disabled.vue";
import DisabledRaw from "./example/Disabled.vue?raw";
import CustomHeader from "./example/CustomHeader.vue";
import CustomHeaderRaw from "./example/CustomHeader.vue?raw";

export default {
  mdText,
  components: {
    Default: {
      description: "그리드 컴포넌트입니다.",
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
    CellRenderer: {
      component: CellRenderer,
      parsedData: parse(CellRendererRaw).descriptor,
    },
    Toolbar: {
      component: Toolbar,
      parsedData: parse(ToolbarRaw).descriptor,
    },
    Summary: {
      component: Summary,
      parsedData: parse(SummaryRaw).descriptor,
    },
    RowDetail: {
      component: RowDetail,
      parsedData: parse(RowDetailRaw).descriptor,
    },
    Sort: {
      component: Sort,
      parsedData: parse(SortRaw).descriptor,
    },
    ColumnEvent: {
      component: ColumnEvent,
      parsedData: parse(ColumnEventRaw).descriptor,
    },
    "Custom Column List": {
      component: ColumnSetting,
      parsedData: parse(ColumnSettingRaw).descriptor,
    },
    Disabled: {
      component: Disabled,
      parsedData: parse(DisabledRaw).descriptor,
    },
    "Custom Table Header": {
      component: CustomHeader,
      parsedData: parse(CustomHeaderRaw).descriptor,
    },
  },
};
