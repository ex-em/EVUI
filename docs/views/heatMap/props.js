import { parseComponent } from 'vue-template-compiler';
import mdText from '!!raw-loader!./api/heatMap.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';
import Event from './example/Event';
import EventRaw from '!!raw-loader!./example/Event';
import Time from './example/Time';
import TimeRaw from '!!raw-loader!./example/Time';
import Gradient from './example/Gradient';
import GradientRaw from '!!raw-loader!./example/Gradient';

export default {
  mdText,
  components: {
    Default: {
      description: 'HeatMap은 데이터의 분포를 색상에 따라 시각적으로 인지하도록 합니다',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
    Time: {
      description: '실시간으로 데이터를 받아 표현할 수 있습니다. (label line 표시)',
      component: Time,
      parsedData: parseComponent(TimeRaw),
    },
    Event: {
      description: 'Drag Select, Click, Double Click 이벤트 등록이 가능 합니다.',
      component: Event,
      parsedData: parseComponent(EventRaw),
    },
    Gradient: {
      description: 'gradient 범주로 표현 가능합니다.',
      component: Gradient,
      parsedData: parseComponent(GradientRaw),
    },
  },
};
