import { parseComponent } from 'vue-template-compiler';
import mdText from '!!raw-loader!./api/lineChart.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';
import Fill from './example/Fill';
import FillRaw from '!!raw-loader!./example/Fill';
import Stack from './example/Stack';
import StackRaw from '!!raw-loader!./example/Stack';
import Event from './example/Event';
import EventRaw from '!!raw-loader!./example/Event';
import DragSelection from './example/DragSelection';
import DragSelectionRaw from '!!raw-loader!./example/DragSelection';
import Tooltip from './example/Tooltip';
import TooltipRaw from '!!raw-loader!./example/Tooltip';
import CustomTooltip from './example/CustomTooltip';
import CustomTooltipRaw from '!!raw-loader!./example/CustomTooltip';
import PlotLine from './example/PlotLine';
import PlotLineRaw from '!!raw-loader!./example/PlotLine';
import SelectLabel from './example/SelectLabel';
import SelectLabelRaw from '!!raw-loader!./example/SelectLabel';
import SelectSeries from './example/SelectSeries';
import SelectSeriesRaw from '!!raw-loader!./example/SelectSeries';
import AxisTitle from './example/AxisTitle';
import AxisTitleRaw from '!!raw-loader!./example/AxisTitle';
import PassingValue from './example/PassingValue';
import PassingValueRaw from '!!raw-loader!./example/PassingValue';
import HoverWithGroup from './example/HoverWithGroup';
import HoverWithGroupRaw from '!!raw-loader!./example/HoverWithGroup';

export default {
  mdText,
  components: {
    Default: {
      description: 'Line Chart는 각각의 데이터를 선으로 연결하여 추이를 시각적으로 인지하는 차트입니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
    Fill: {
      description: 'Line Chart의 Fill 옵션을 이용하여 각 계열 데이터의 양을 좀 더 쉽게 인지할 수 있도록 합니다.',
      component: Fill,
      parsedData: parseComponent(FillRaw),
    },
    Stack: {
      description: 'Stack Line Chart는 계열의 순서에 맞춰 데이터를 누적하여 각 계열의 데이터 비교를 시각적으로 판단하는데 도움을 줍니다.',
      component: Stack,
      parsedData: parseComponent(StackRaw),
    },
    Event: {
      description: 'Click, Double Click 등 이벤트 등록이 가능합니다.',
      component: Event,
      parsedData: parseComponent(EventRaw),
    },
    'Select Label': {
      description: '차트 전체에서 선택한 라벨 내 모든 아이템이 하이라이트 되는 기능입니다.',
      component: SelectLabel,
      parsedData: parseComponent(SelectLabelRaw),
    },
    'Select Series': {
      description: '선택한 시리즈가 하이라이트 되어 보이는 기능입니다.',
      component: SelectSeries,
      parsedData: parseComponent(SelectSeriesRaw),
    },
    DragSelection: {
      description: 'Drag Select 이벤트 등록이 가능 합니다',
      component: DragSelection,
      parsedData: parseComponent(DragSelectionRaw),
    },
    Tooltip: {
      description: 'Tooltip 기능으로 마우스가 위치한 곳의 값을 볼 수 있습니다.',
      component: Tooltip,
      parsedData: parseComponent(TooltipRaw),
    },
    'Custom Tooltip': {
      description: 'Tooltip의 내용을 HTML로 가공하여 구성할 수 있습니다.',
      component: CustomTooltip,
      parsedData: parseComponent(CustomTooltipRaw),
    },
    'Plot line & Plot band': {
      description: '차트 배경에 선 및 영역을 표시할 수 있습니다.',
      component: PlotLine,
      parsedData: parseComponent(PlotLineRaw),
    },
    AxisTitle: {
      description: '차트 축에 title을 설정할 수 있습니다.',
      component: AxisTitle,
      parsedData: parseComponent(AxisTitleRaw),
    },
    PassingValue: {
      description: 'passingValue를 설정하여 특정 시점에 line을 끊지 않고 자연스럽게 이을 수 있습니다.',
      component: PassingValue,
      parsedData: parseComponent(PassingValueRaw),
    },
    HoverWithGroup: {
      description: '',
      component: HoverWithGroup,
      parsedData: parseComponent(HoverWithGroupRaw),
    },
  },
};
