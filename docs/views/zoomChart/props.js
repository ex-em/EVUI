import { parseComponent } from 'vue-template-compiler';
import mdText from '!!raw-loader!./api/zoomChart.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';
import ChartGroup from './example/ChartGroup';
import ChartGroupRaw from '!!raw-loader!./example/ChartGroup';
import ChartBrush from './example/ChartBrush';
import ChartBrushRaw from '!!raw-loader!./example/ChartBrush';

export default {
  mdText,
  components: {
    'Chart Brush': {
      description: 'Chart Group을 이용하여 차트의 줌 위치와 원본 차트를 보여주는 Brush 기능을 사용할 수 있습니다.',
      component: ChartBrush,
      parsedData: parseComponent(ChartBrushRaw),
    },
    Default: {
      description: 'Chart의 Zoom 옵션을 이용하여 확대/축소 기능을 사용할 수 있습니다.',
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
