import { parseComponent } from 'vue-template-compiler';
import mdText from '!!raw-loader!./api/lineChart.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';
import Fill from './example/Fill';
import FillRaw from '!!raw-loader!./example/Fill';
import Stack from './example/Stack';
import StackRaw from '!!raw-loader!./example/Stack';
import Event from './example/Event';
import EventRaw from '!!raw-loader!./example/Event';
import Tooltip from './example/Tooltip';
import TooltipRaw from '!!raw-loader!./example/Tooltip';

export default {
  mdText,
  components: {
    Default: {
      description: 'Line Chart는 각각의 데이터를 선으로 연결하여 추이를 시각적으로 인지하는 차트입니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
    Fill: {
      description: 'Line Chart의 Fill 옵션을 이용하여 각 계열 데이터의 양을 좀 더 쉽게 인지할 수 있도록 합니다.',
      component: Fill,
      parsedData: parseComponent(FillRaw),
    },
    Stack: {
      description: 'Stack Line Chart는 계열의 순서에 맞춰 데이터를 누적하여 각 계열의 데이터 비교를 시각적으로 판단하는데 도움을 줍니다.',
      component: Stack,
      parsedData: parseComponent(StackRaw),
    },
    Event: {
      description: 'Click, Double Click 등 이벤트 등록이 가능합니다.',
      component: Event,
      parsedData: parseComponent(EventRaw),
    },
    Tooltip: {
      description: 'Tooltip 기능으로 마우스가 위치한 곳의 값을 볼 수 있습니다.',
      component: Tooltip,
      parsedData: parseComponent(TooltipRaw),
    },
  },
};
