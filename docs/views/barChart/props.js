import { parseComponent } from 'vue-template-compiler';
import mdText from '!!raw-loader!./api/barChart.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';

export default {
  mdText,
  components: {
    Default: {
      description: 'Bar Chart는 Category 기반의 데이터를 표현하는 차트로, 각 Category에 대한 값에 따라 Bar의 높이가 결정됩니다. 계열이 여러 개 존재할 경우 동일한 넓이의 Bar를 생성하여 Category 기준으로 각 계열을 표현합니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
  },
};
