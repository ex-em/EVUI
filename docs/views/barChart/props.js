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

export default {
  mdText,
  components: {
    Default: {
      description: 'Bar Chart(막대그래프)는 표현 값에 비례 하여 높이와 길이를 가진 직사각형 막대로 데이터를 표현하는 차트입니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
    Column: {
      description: '세로 형태로 사용할 수 있으며 각 Series별로 색상을 직접 지정할 수 있습니다.',
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
  },
};
