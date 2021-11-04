import { parseComponent } from 'vue-template-compiler';
import mdText from '!!raw-loader!./api/scatterChart.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';
import Event from './example/Event';
import EventRaw from '!!raw-loader!./example/Event';
import PlotLine from './example/PlotLine';
import PlotLineRaw from '!!raw-loader!./example/PlotLine';

export default {
  mdText,
  components: {
    Default: {
      description: 'Scatter Chart는 데이터의 분포를 시각적으로 인지하도록 합니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
    Event: {
      description: 'Drag Select 이벤트 등록이 가능 합니다',
      component: Event,
      parsedData: parseComponent(EventRaw),
    },
    'Plot line & Plot band': {
      description: '차트 배경에 선 및 영역을 표시할 수 있습니다.',
      component: PlotLine,
      parsedData: parseComponent(PlotLineRaw),
    },
  },
};
