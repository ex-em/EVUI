import { parse } from '@vue/compiler-sfc';
import mdText from './api/scatterChart.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';
import Event from './example/Event';
import EventRaw from './example/Event?raw';
import SelectItem from './example/SelectItem';
import SelectItemRaw from './example/SelectItem?raw';
import PlotLine from './example/PlotLine';
import PlotLineRaw from './example/PlotLine?raw';
import DisplayOverflow from './example/DisplayOverflow';
import DisplayOverflowRaw from './example/DisplayOverflow?raw';
import RealTimeScatter from './example/RealTimeScatter';
import RealTimeScatterRaw from './example/RealTimeScatter?raw';

export default {
  mdText,
  components: {
    Default: {
      description: 'Scatter Chart는 데이터의 분포를 시각적으로 인지하도록 합니다.',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
    SelectItem: {
      description: 'Point를 선택 표시할 수 있습니다.',
      component: SelectItem,
      parsedData: parse(SelectItemRaw).descriptor,
    },
    Event: {
      description: 'Drag Select, Click, Double Click 이벤트 등록이 가능 합니다',
      component: Event,
      parsedData: parse(EventRaw).descriptor,
    },
    'Plot line & Plot band': {
      description: '차트 배경에 선 및 영역을 표시할 수 있습니다.',
      component: PlotLine,
      parsedData: parse(PlotLineRaw).descriptor,
    },
    'Display Overflow': {
      description: 'range 옵션으로 지정한 Y축의 최댓값을 표시합니다.',
      component: DisplayOverflow,
      parsedData: parse(DisplayOverflowRaw).descriptor,
    },
    RealTimeScatter: {
      description: '실시간으로 대량의 데이터를 처리합니다.',
      component: RealTimeScatter,
      parsedData: parse(RealTimeScatterRaw).descriptor,
    },
  },
};
