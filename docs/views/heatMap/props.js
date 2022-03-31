import { parseComponent } from 'vue-template-compiler';
import mdText from '!!raw-loader!./api/heatMap.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';

export default {
  mdText,
  components: {
    Default: {
      description: 'HeatMap은 데이터의 분포를 색상에 따라 시각적으로 인지하도록 합니다',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
  },
};
