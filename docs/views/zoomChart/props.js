import { parse } from '@vue/compiler-sfc';
import mdText from './api/zoomChart.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';
import ChartGroup from './example/ChartGroup';
import ChartGroupRaw from './example/ChartGroup?raw';

export default {
  mdText,
  components: {
    Default: {
      description: 'Chart의 Zoom 옵션을 이용하여 확대/축소 기능을 사용할 수 있습니다.',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
    'Chart Group': {
      description: 'Chart Group를 이용하여 그룹으로 감싸진 각 차트에 확대/축소 기능을 사용할 수 있습니다.',
      component: ChartGroup,
      parsedData: parse(ChartGroupRaw).descriptor,
    },
  },
};
