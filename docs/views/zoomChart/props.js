import { parseComponent } from 'vue-template-compiler';
import mdText from '!!raw-loader!./api/zoomChart.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';

export default {
  mdText,
  components: {
    Default: {
      description: 'Line Chart 확대/축소 기능입니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
  },
};
