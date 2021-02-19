import { parseComponent } from 'vue-template-compiler';
import mdText from '!!raw-loader!./api/pieChart.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';
import Doughnut from './example/Doughnut';
import DoughnutRaw from '!!raw-loader!./example/Doughnut';
import Sunburst from './example/Sunburst';
import SunburstRaw from '!!raw-loader!./example/Sunburst';

export default {
  mdText,
  components: {
    Default: {
      description: 'Pie Chart는 데이터의 전체 데이터를 기준으로 한 계열의 상대적 크기를 표시합니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
    Doughnut: {
      description: 'Doughnut Chart는 Pie Chart의 중심을 비워 내부 공간을 만듭니다.',
      component: Doughnut,
      parsedData: parseComponent(DoughnutRaw),
    },
    Sunburst: {
      description: 'Sunburst Chart는 Doughnut을 계층적으로 데이터를 시각화 합니다.',
      component: Sunburst,
      parsedData: parseComponent(SunburstRaw),
    },
  },
};
