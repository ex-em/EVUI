import { parseComponent } from 'vue-template-compiler';
import mdText from '!!raw-loader!./api/barChart.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';
import Column from './example/Column';
import ColumnRaw from '!!raw-loader!./example/Column';
import Stack from './example/Stack';
import StackRaw from '!!raw-loader!./example/Stack';
import Horizontal from './example/Horizontal';
import HorizontalRaw from '!!raw-loader!./example/Horizontal';
import Time from './example/Time';
import TimeRaw from '!!raw-loader!./example/Time';
import Event from './example/Event';
import EventRaw from '!!raw-loader!./example/Event';
import SelectLabel from './example/SelectLabel';
import SelectLabelRaw from '!!raw-loader!./example/SelectLabel';
import Gradient from './example/Gradient';
import GradientRaw from '!!raw-loader!./example/Gradient';
import PlotLine from './example/PlotLine';
import PlotLineRaw from '!!raw-loader!./example/PlotLine';
import Overlapping from './example/Overlapping';
import OverlappingRaw from '!!raw-loader!./example/Overlapping';
import HoverWithGroup from './example/HoverWithGroup';
import HoverWithGroupRaw from '!!raw-loader!./example/HoverWithGroup';

export default {
  mdText,
  components: {
    Default: {
      description: 'Bar Chart(막대그래프)는 표현 값에 비례 하여 높이와 길이를 가진 직사각형 막대로 데이터를 표현하는 차트입니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
    Column: {
      description: '세로 형태로 사용할 수 있으며 각 Series별, data별로 색상을 직접 지정할 수 있습니다.',
      component: Column,
      parsedData: parseComponent(ColumnRaw),
    },
    Horizontal: {
      description: '가로 형태로 사용할 수 있으며 Series별로 데이터 라벨 표시 여부 및 속성을 설정 할 수 있습니다.',
      component: Horizontal,
      parsedData: parseComponent(HorizontalRaw),
    },
    Stack: {
      description: '동일한 그룹으로 묶인 series들의 데이터를 한 막대에 누적하여 표현할 수 있습니다.',
      component: Stack,
      parsedData: parseComponent(StackRaw),
    },
    Overlapping: {
      description: `동일한 그룹으로 묶인 series들의 데이터를 한 막대에 겹쳐서 표현할 수 있습니다.<br/>
          2개의 시리즈에 한정해 사용하는 것을 권장하며, data 속성의 groups에서 지정한 시리즈 순서대로 이전 시리즈에 포함되는 값은 항상 다음 시리즈에 속하는 값보다 작거나 같아야 합니다.<br/>
          초과의 값을 가지면 가려질 수 있습니다.`,
      component: Overlapping,
      parsedData: parseComponent(OverlappingRaw),
    },
    Time: {
      description: '실시간으로 데이터를 받아 표현할 수 있으며, 가장 큰 값에 해당하는 막대위에 Tip을 붙일 수 있습니다.',
      component: Time,
      parsedData: parseComponent(TimeRaw),
    },
    Event: {
      description: 'Click, Double Click 등 이벤트 등록이 가능합니다.',
      component: Event,
      parsedData: parseComponent(EventRaw),
    },
    'Select Label': {
      description: '차트 전체에서 선택한 라벨 내 모든 아이템이 하이라이트 되는 기능입니다.',
      component: SelectLabel,
      parsedData: parseComponent(SelectLabelRaw),
    },
    Gradient: {
      description: '막대에 그라데이션 효과를 줄 수 있습니다.',
      component: Gradient,
      parsedData: parseComponent(GradientRaw),
    },
    'Plot line & Plot band': {
      description: '차트 배경에 선 및 영역을 표시할 수 있습니다.',
      component: PlotLine,
      parsedData: parseComponent(PlotLineRaw),
    },
    HoverWithGroup: {
      description: '',
      component: HoverWithGroup,
      parsedData: parseComponent(HoverWithGroupRaw),
    },
  },
};
