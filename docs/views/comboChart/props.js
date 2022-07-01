import { parseComponent } from 'vue-template-compiler';
import mdText from '!!raw-loader!./api/comboChart.md';
import LineBar from './example/LineBar';
import LineBarRaw from '!!raw-loader!./example/LineBar';
import LineStackBar from './example/LineStackBar';
import LineStackBarRaw from '!!raw-loader!./example/LineStackBar';
import StackLineBar from './example/StackLineBar';
import StackLineBarRaw from '!!raw-loader!./example/StackLineBar';
import StackLineStackBar from './example/StackLineStackBar';
import StackLineStackBarRaw from '!!raw-loader!./example/StackLineStackBar';
import TableTypeLegend from './example/TableTypeLegend';
import TableTypeLegendRaw from '!!raw-loader!./example/TableTypeLegend';

export default {
  mdText,
  components: {
    'Line & Bar': {
      description: 'Line과 Bar를 조합하여 2가지 계열을 나타냅니다. Bar 차트가 들어가므로 Step Axis의 TimeMode를 사용하여 구현합니다.',
      component: LineBar,
      parsedData: parseComponent(LineBarRaw),
    },
    'Line & StackBar': {
      description: 'Line과 StackBar를 조합하여 2가지 계열을 나타냅니다.',
      component: LineStackBar,
      parsedData: parseComponent(LineStackBarRaw),
    },
    'StackLine & Bar': {
      description: 'StackLine과 Bar를 조합하여 2가지 계열을 나타냅니다. Stack-Line은 null을 받지 않으므로 0으로 기본데이터 세팅이 필요합니다.',
      component: StackLineBar,
      parsedData: parseComponent(StackLineBarRaw),
    },
    'StackLine & StackBar': {
      description: 'StackLine과 StackBar를 조합하여 2가지 계열을 나타냅니다. Stack-Line은 null을 받지 않으므로 0으로 기본데이터 세팅이 필요합니다.',
      component: StackLineStackBar,
      parsedData: parseComponent(StackLineStackBarRaw),
    },
    'Table type Legend': {
      description: 'Legend 영역에 Series Color, Name, Value 등을 표시할 수 있습니다.',
      component: TableTypeLegend,
      parsedData: parseComponent(TableTypeLegendRaw),
    },
  },
};
