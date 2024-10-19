import { parse } from "@vue/compiler-sfc";
import mdText from "./api/treeGrid.md?raw";
import Default from "./example/Default";
import DefaultRaw from "./example/Default?raw";
import CellRenderer from "./example/CellRenderer";
import CellRendererRaw from "./example/CellRenderer?raw";
import Toolbar from "./example/Toolbar";
import ToolbarRaw from "./example/Toolbar?raw";
import ColumnEvent from "./example/ColumnEvent.vue";
import ColumnEventRaw from "./example/ColumnEvent.vue?raw";
import ColumnSetting from "./example/ColumnSetting.vue";
import ColumnSettingRaw from "./example/ColumnSetting.vue?raw";
import CustomHeader from "./example/CustomHeader.vue";
import CustomHeaderRaw from "./example/CustomHeader.vue?raw";

export default {
  mdText,
  components: {
    Default: {
      description: "트리 그리드 컴포넌트입니다.",
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
    ColumnEvent: {
      component: ColumnEvent,
      parsedData: parse(ColumnEventRaw).descriptor,
    },
    "Custom Column List": {
      component: ColumnSetting,
      parsedData: parse(ColumnSettingRaw).descriptor,
    },
    "Custom Table Header": {
      component: CustomHeader,
      parsedData: parse(CustomHeaderRaw).descriptor,
    },
  },
};
