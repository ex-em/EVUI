import { parseComponent } from 'vue-template-compiler';
import mdText from '!!raw-loader!./api/zoomChart.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';
import ChartGroup from './example/ChartGroup';
import ChartGroupRaw from '!!raw-loader!./example/ChartGroup';

export default {
  mdText,
  components: {
    Default: {
      description: 'Line Chart의 Zoom 옵션을 이용하여 확대/축소 기능을 사용할 수 있습니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
    'Chart Group': {
      description: 'Chart Group를 이용하여 그룹으로 감싸진 각 차트에 확대/축소 기능을 사용할 수 있습니다.',
      component: ChartGroup,
      parsedData: parseComponent(ChartGroupRaw),
    },
  },
};
