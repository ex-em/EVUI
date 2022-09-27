import { parseComponent } from 'vue-template-compiler';
import mdText from '!!raw-loader!./api/scatterChart.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';
import Event from './example/Event';
import EventRaw from '!!raw-loader!./example/Event';
import SelectItem from './example/SelectItem';
import SelectItemRaw from '!!raw-loader!./example/SelectItem';
import PlotLine from './example/PlotLine';
import PlotLineRaw from '!!raw-loader!./example/PlotLine';
import DisplayOverflow from './example/DisplayOverflow';
import DisplayOverflowRaw from '!!raw-loader!./example/DisplayOverflow';

export default {
  mdText,
  components: {
    Default: {
      description: 'Scatter Chart는 데이터의 분포를 시각적으로 인지하도록 합니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
    SelectItem: {
      description: 'Point를 선택 표시할 수 있습니다.',
      component: SelectItem,
      parsedData: parseComponent(SelectItemRaw),
    },
    Event: {
      description: 'Drag Select, Click, Double Click 이벤트 등록이 가능 합니다',
      component: Event,
      parsedData: parseComponent(EventRaw),
    },
    'Plot line & Plot band': {
      description: '차트 배경에 선 및 영역을 표시할 수 있습니다.',
      component: PlotLine,
      parsedData: parseComponent(PlotLineRaw),
    },
    'Display Overflow': {
      description: 'range 옵션으로 지정한 Y축의 최댓값을 표시합니다.',
      component: DisplayOverflow,
      parsedData: parseComponent(DisplayOverflowRaw),
    },
  },
};
