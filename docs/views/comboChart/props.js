import { parse } from '@vue/compiler-sfc';
import mdText from './api/comboChart.md?raw';
import LineBar from './example/LineBar';
import LineBarRaw from './example/LineBar?raw';
import LineStackBar from './example/LineStackBar';
import LineStackBarRaw from './example/LineStackBar?raw';
import StackLineBar from './example/StackLineBar';
import StackLineBarRaw from './example/StackLineBar?raw';
import StackLineStackBar from './example/StackLineStackBar';
import StackLineStackBarRaw from './example/StackLineStackBar?raw';
import TableTypeLegend from './example/TableTypeLegend';
import TableTypeLegendRaw from './example/TableTypeLegend?raw';
import LineBarSelectLabel from './example/LineBarSelectLabel';
import LineBarSelectLabelRaw from './example/LineBarSelectLabel?raw';
import AreaLine from './example/AreaLine';
import AreaLineRaw from './example/AreaLine?raw';
import PerfStressDashboard from './example/PerfStressDashboard';
import PerfStressDashboardRaw from './example/PerfStressDashboard?raw';

export default {
  mdText,
  components: {
    'Line & Bar': {
      description:
        'Line과 Bar를 조합하여 2가지 계열을 나타냅니다. Bar 차트가 들어가므로 Step Axis의 TimeMode를 사용하여 구현합니다.',
      component: LineBar,
      parsedData: parse(LineBarRaw).descriptor,
    },
    'Area & Line': {
      description:
        'Area(fill 옵션을 준 line)와 일반 Line을 조합합니다. 일부 라벨에 null 값이 섞여 있을 때, null 라벨의 빈 영역을 클릭하면 값이 없는 시리즈가 아니라 실제로 값이 있는 시리즈가 선택되어야 합니다.',
      component: AreaLine,
      parsedData: parse(AreaLineRaw).descriptor,
    },
    'Line & StackBar': {
      description: 'Line과 StackBar를 조합하여 2가지 계열을 나타냅니다.',
      component: LineStackBar,
      parsedData: parse(LineStackBarRaw).descriptor,
    },
    'StackLine & Bar': {
      description:
        'StackLine과 Bar를 조합하여 2가지 계열을 나타냅니다. Stack-Line은 null을 받지 않으므로 0으로 기본데이터 세팅이 필요합니다.',
      component: StackLineBar,
      parsedData: parse(StackLineBarRaw).descriptor,
    },
    'StackLine & StackBar': {
      description:
        'StackLine과 StackBar를 조합하여 2가지 계열을 나타냅니다. Stack-Line은 null을 받지 않으므로 0으로 기본데이터 세팅이 필요합니다.',
      component: StackLineStackBar,
      parsedData: parse(StackLineStackBarRaw).descriptor,
    },
    'Table type Legend': {
      description: 'Legend 영역에 Series Color, Name, Value 등을 표시할 수 있습니다.',
      component: TableTypeLegend,
      parsedData: parse(TableTypeLegendRaw).descriptor,
    },
    SelectLabel: {
      description: '차트 전체에서 선택한 라벨 내 모든 아이템이 하이라이트 되는 기능입니다.',
      component: LineBarSelectLabel,
      parsedData: parse(LineBarSelectLabelRaw).descriptor,
    },
    PerfStressDashboard: {
      description:
        'B-real 프로파일 성능 stress 예제 — 같은 timer에 묶여 동시에 갱신되는 다수 combo 차트 대시보드입니다. ' +
        '차트 수·시리즈 수·포인트 수는 상수로 조절하며, heavy render job이 같은 window에 pile-up 되는 상황을 재현합니다.',
      component: PerfStressDashboard,
      parsedData: parse(PerfStressDashboardRaw).descriptor,
    },
  },
};
