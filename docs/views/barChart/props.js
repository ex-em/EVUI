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

export default {
  mdText,
  components: {
    Default: {
      description: 'Bar Chart는 Category 기반의 데이터를 표현하는 차트로, 각 Category에 대한 값에 따라 Bar의 높이가 결정됩니다. 계열이 여러 개 존재할 경우 동일한 넓이의 Bar를 생성하여 Category 기준으로 각 계열을 표현합니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
    Column: {
      description: 'Category 기반의 막대 데이터를 누적하여 표현합니다.',
      component: Column,
      parsedData: parseComponent(ColumnRaw),
    },
    Stack: {
      description: 'Category 기반의 막대 데이터를 누적하여 표현합니다.',
      component: Stack,
      parsedData: parseComponent(StackRaw),
    },
    Horizontal: {
      description: 'Horizontal Bar Chart는 각 Category에 대한 Bar의 널이가 나타내는 값에 비례합니다. 계열이 여러개가 존재할 경우 동일한 높이의 Bar를 생성하여 Category 기준으로 각 계열을 표현합니다.',
      component: Horizontal,
      parsedData: parseComponent(HorizontalRaw),
    },
    Time: {
      description: 'RealTime 처리를 위한 차트입니다.',
      component: Time,
      parsedData: parseComponent(TimeRaw),
    },
  },
};
