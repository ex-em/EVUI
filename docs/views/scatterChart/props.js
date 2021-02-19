import { parseComponent } from 'vue-template-compiler';
import mdText from '!!raw-loader!./api/scatterChart.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';

export default {
  mdText,
  components: {
    Default: {
      description: 'Scatter Chart는 데이터의 분포를 시각적으로 인지하도록 합니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
  },
};
