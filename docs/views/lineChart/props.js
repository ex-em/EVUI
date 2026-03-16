import { parse } from '@vue/compiler-sfc';
import mdText from './api/lineChart.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';
import Fill from './example/Fill';
import FillRaw from './example/Fill?raw';
import Stack from './example/Stack';
import StackRaw from './example/Stack?raw';
import Event from './example/Event';
import EventRaw from './example/Event?raw';
import DragSelection from './example/DragSelection';
import DragSelectionRaw from './example/DragSelection?raw';
import Tooltip from './example/Tooltip';
import TooltipRaw from './example/Tooltip?raw';
import CustomTooltip from './example/CustomTooltip';
import CustomTooltipRaw from './example/CustomTooltip?raw';
import ExternalTooltip from './example/ExternalTooltip';
import ExternalTooltipRaw from './example/ExternalTooltip?raw';
import PlotLine from './example/PlotLine';
import PlotLineRaw from './example/PlotLine?raw';
import SelectLabel from './example/SelectLabel';
import SelectLabelRaw from './example/SelectLabel?raw';
import SelectSeries from './example/SelectSeries';
import SelectSeriesRaw from './example/SelectSeries?raw';
import AxisTitle from './example/AxisTitle';
import AxisTitleRaw from './example/AxisTitle?raw';
import PassingValue from './example/PassingValue';
import PassingValueRaw from './example/PassingValue?raw';
import HoverWithGroup from './example/HoverWithGroup';
import HoverWithGroupRaw from './example/HoverWithGroup?raw';
import LegendVirtualScroll from './example/LegendVirtualScroll';
import LegendVirtualScrollRaw from './example/LegendVirtualScroll?raw';
import ExternalLegend from './example/ExternalLegend';
import ExternalLegendRaw from './example/ExternalLegend?raw';
import Segments from './example/Segments';
import SegmentsRaw from './example/Segments?raw';
import Interpolation from './example/Interpolation';
import InterpolationRaw from './example/Interpolation?raw';
import LegendClickMode from './example/LegendClickMode';
import LegendClickModeRaw from './example/LegendClickMode?raw';
import NiceScale from './example/NiceScale';
import NiceScaleRaw from './example/NiceScale?raw';
import AxesScaleChange from './example/AxesScaleChange';
import AxesScaleChangeRaw from './example/AxesScaleChange?raw';
import UnSelectedOpacity from './example/UnSelectedOpacity';
import UnSelectedOpacityRaw from './example/UnSelectedOpacity?raw';

export default {
  mdText,
  components: {
    Default: {
      description:
        'Line Chart는 각각의 데이터를 선으로 연결하여 추이를 시각적으로 인지하는 차트입니다.',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
    Fill: {
      description:
        'Line Chart의 Fill 옵션을 이용하여 각 계열 데이터의 양을 좀 더 쉽게 인지할 수 있도록 합니다.',
      component: Fill,
      parsedData: parse(FillRaw).descriptor,
    },
    Stack: {
      description:
        'Stack Line Chart는 계열의 순서에 맞춰 데이터를 누적하여 각 계열의 데이터 비교를 시각적으로 판단하는데 도움을 줍니다.',
      component: Stack,
      parsedData: parse(StackRaw).descriptor,
    },
    Event: {
      description: 'Click, Double Click 등 이벤트 등록이 가능합니다.',
      component: Event,
      parsedData: parse(EventRaw).descriptor,
    },
    'Select Label': {
      description: '차트 전체에서 선택한 라벨 내 모든 아이템이 하이라이트 되는 기능입니다.',
      component: SelectLabel,
      parsedData: parse(SelectLabelRaw).descriptor,
    },
    'Select Series': {
      description: '선택한 시리즈가 하이라이트 되어 보이는 기능입니다.',
      component: SelectSeries,
      parsedData: parse(SelectSeriesRaw).descriptor,
    },
    UnSelectedOpacity: {
      description: 'unSelectedOpacity 옵션으로 비선택 요소의 opacity를 설정할 수 있습니다',
      component: UnSelectedOpacity,
      parsedData: parse(UnSelectedOpacityRaw).descriptor,
    },
    DragSelection: {
      description: 'Drag Select 이벤트 등록이 가능 합니다',
      component: DragSelection,
      parsedData: parse(DragSelectionRaw).descriptor,
    },
    Tooltip: {
      description: 'Tooltip 기능으로 마우스가 위치한 곳의 값을 볼 수 있습니다.',
      component: Tooltip,
      parsedData: parse(TooltipRaw).descriptor,
    },
    'Custom Tooltip': {
      description: 'Tooltip의 내용을 HTML로 가공하여 구성할 수 있습니다.',
      component: CustomTooltip,
      parsedData: parse(CustomTooltipRaw).descriptor,
    },
    'External Tooltip': {
      description: 'Tooltip의 내용을 외부에서 제어할 수 있습니다.',
      component: ExternalTooltip,
      parsedData: parse(ExternalTooltipRaw).descriptor,
    },
    'External Tooltip': {
      description: 'Tooltip의 내용을 외부에서 제어할 수 있습니다.',
      component: ExternalTooltip,
      parsedData: parse(ExternalTooltipRaw).descriptor,
    },
    'Plot line & Plot band': {
      description: '차트 배경에 선 및 영역을 표시할 수 있습니다.',
      component: PlotLine,
      parsedData: parse(PlotLineRaw).descriptor,
    },
    AxisTitle: {
      description: '차트 축에 title을 설정할 수 있습니다.',
      component: AxisTitle,
      parsedData: parse(AxisTitleRaw).descriptor,
    },
    PassingValue: {
      description:
        'passingValue를 설정하여 특정 시점에 line을 끊지 않고 자연스럽게 이을 수 있습니다.',
      component: PassingValue,
      parsedData: parse(PassingValueRaw).descriptor,
    },
    Interpolation: {
      description: 'Interpolation 옵션을 설정하여 null Data를 보간하여 선을 그릴 수 있습니다.',
      component: Interpolation,
      parsedData: parse(InterpolationRaw).descriptor,
    },
    HoverWithGroup: {
      description: '',
      component: HoverWithGroup,
      parsedData: parse(HoverWithGroupRaw).descriptor,
    },
    LegendVirtualScroll: {
      description: 'Legend Virtual Scroll',
      component: LegendVirtualScroll,
      parsedData: parse(LegendVirtualScrollRaw).descriptor,
    },
    ExternalLegend: {
      description:
        'External Legend를 사용하여 차트 외부에서 범례를 커스터마이징할 수 있습니다.',
      component: ExternalLegend,
      parsedData: parse(ExternalLegendRaw).descriptor,
    },
    Segments: {
      description: 'Segments',
      component: Segments,
      parsedData: parse(SegmentsRaw).descriptor,
    },
    LegendClickMode: {
      description: 'Legend Click Mode',
      component: LegendClickMode,
      parsedData: parse(LegendClickModeRaw).descriptor,
    },
    NiceScale: {
      description:
        '축 타입이 linear인 경우 자동으로 최적의 최대 값과 간격을 계산하여 축을 그립니다.',
      component: NiceScale,
      parsedData: parse(NiceScaleRaw).descriptor,
    },
    AxesScaleChange: {
      description:
        '차트 사이즈를 변경하면 axes-scale-change 이벤트로 재계산된 minSteps, maxSteps를 확인할 수 있습니다.',
      component: AxesScaleChange,
      parsedData: parse(AxesScaleChangeRaw).descriptor,
    },
  },
};
