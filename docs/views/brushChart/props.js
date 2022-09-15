import { parseComponent } from 'vue-template-compiler';
import mdText from '!!raw-loader!./api/brushChart.md';
import PlotLine from './example/PlotLine';
import PlotLineRaw from '!!raw-loader!./example/PlotLine';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';
import AxisTitle from './example/AxisTitle';
import AxisTitleRaw from '!!raw-loader!./example/AxisTitle';
import SelectLabel from './example/SelectLabel';
import SelectLabelRaw from '!!raw-loader!./example/SelectLabel';
import SelectSeries from './example/SelectSeries';
import SelectSeriesRaw from '!!raw-loader!./example/SelectSeries';
import Tooltip from './example/Tooltip';
import TooltipRaw from '!!raw-loader!./example/Tooltip';
import Event from './example/Event';
import EventRaw from '!!raw-loader!./example/Event';

export default {
  mdText,
  components: {
    Default: {
      description: 'Chart와 Brush를 Chart Group로 감싸 차트의 줌 위치와 원본 차트를 보여주는 Brush 기능을 사용할 수 있습니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
    Tooltip: {
      description: '기존 Chart의 Tooltip 기능이 Brush에도 동일하게 보여집니다.',
      component: Tooltip,
      parsedData: parseComponent(TooltipRaw),
    },
    'Plot line & Plot band': {
      description: '기존 Chart에 표시 된 배경과 선이 Brush에도 동일하게 그려집니다.',
      component: PlotLine,
      parsedData: parseComponent(PlotLineRaw),
    },
    Event: {
      description: 'Brush에서 Click, Double Click 등 이벤트를 사용할 수 없습니다.',
      component: Event,
      parsedData: parseComponent(EventRaw),
    },
    'Select Label': {
      description: 'Brush에서는 전체 Label을 보여주게 됩니다.',
      component: SelectLabel,
      parsedData: parseComponent(SelectLabelRaw),
    },
    'Select Series': {
      description: 'Brush에서는 전체 Series를 보여주게 됩니다.',
      component: SelectSeries,
      parsedData: parseComponent(SelectSeriesRaw),
    },
    AxisTitle: {
      description: 'Brush에서는 X Axis, Y Axis Title 표시를 사용할 수 없습니다.',
      component: AxisTitle,
      parsedData: parseComponent(AxisTitleRaw),
    },
  },
};
