import type { Dayjs } from 'dayjs';
import type { CSSProperties } from 'vue';
import type { EvComponent } from './component.js';

export type EvChartType = 'line' | 'bar' | 'pie' | 'scatter' | 'heatMap';
export type EvChartLabel = number | string | Date | Dayjs;
export type EvChartAxisTarget = 'xAxis' | 'yAxis';

type ChartSide = 'top' | 'right' | 'bottom' | 'left';
type ChartPadding = Partial<Record<ChartSide, number>>;
type ChartColor = string | readonly (readonly [offset: number, color: string] | readonly [])[];
type ChartAxisValue = EvChartLabel | null;
type ChartTextAlign = 'left' | 'center' | 'right';
type ChartFormatterText = string | null | undefined;

interface ChartFont {
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number | string;
}

interface ChartStroke {
  color?: string;
  lineWidth?: number;
  opacity?: number;
  radius?: number;
}

interface ChartHighlightOptions {
  defaultSize?: number;
  maxSize?: number;
  maxShadowSize?: number;
  maxShadowOpacity?: number;
  pointSize?: number;
  shadow?: {
    use?: boolean;
    color?: string;
    blur?: number;
    offsetX?: number;
    offsetY?: number;
  };
  stroke?: {
    use?: boolean;
    color?: string | null;
    width?: number;
    radius?: number;
  };
}

interface ChartBarValueOptions {
  use?: boolean;
  fontSize?: number;
  textColor?: string;
  align?: 'start' | 'center' | 'end' | 'out' | ChartSide;
  decimalPoint?: number | null;
  formatter?: (
    value: number | '' | null,
    context: { label: ChartAxisValue; index: number },
  ) => ChartFormatterText;
}

interface ChartPieValueOptions extends Omit<ChartBarValueOptions, 'formatter'> {
  formatter?: (context: { value: number; percentage: number }) => ChartFormatterText;
}

interface ChartSeriesOptions {
  id?: string;
  name?: string;
  show?: boolean;
  showLegend?: boolean;
  color?: ChartColor;
  fill?: boolean | { gradient?: boolean };
  fillColor?: string;
  fillOpacity?: number;
  overflowColor?: string;
  point?: boolean;
  pointFill?: string;
  pointSize?: number;
  pointHighlight?: boolean;
  pointStyle?:
    | ''
    | 'circle'
    | 'triangle'
    | 'rect'
    | 'rectRounded'
    | 'rectRot'
    | 'cross'
    | 'crossRot'
    | 'star'
    | 'line';
  highlight?: ChartHighlightOptions;
  stroke?: ChartStroke & { show?: boolean };
  lineWidth?: number;
  segments?: readonly number[];
  passingValue?: number | null;
  interpolation?: 'linear' | 'none' | 'zero';
  xAxisIndex?: number;
  yAxisIndex?: number;
  category?: boolean;
  combo?: boolean;
}

export type EvChartSeries = ChartSeriesOptions &
  (
    | { type: 'pie'; showValue?: ChartPieValueOptions }
    | { type?: Exclude<EvChartType, 'pie'> | undefined; showValue?: ChartBarValueOptions }
    | { type?: undefined; showValue?: ChartPieValueOptions }
  );

interface ChartValuePoint {
  value: number | null;
  color?: string | null;
  textColor?: string | null;
}

export interface EvChartCoordinatePoint {
  x: ChartAxisValue | ChartValuePoint;
  y: ChartAxisValue | ChartValuePoint;
  color?: string | null;
}

export interface EvChartHeatMapPoint {
  x: EvChartLabel;
  y: EvChartLabel;
  value: number;
  color?: string | null;
}

export type EvChartPoint =
  number | null | ChartValuePoint | EvChartCoordinatePoint | EvChartHeatMapPoint;

export interface EvChartSunburstNode {
  id: string;
  value: number;
  children?: readonly EvChartSunburstNode[];
}

export interface EvChartData {
  series?: Record<string, EvChartSeries>;
  groups?: readonly (readonly string[])[];
  labels?: readonly ChartAxisValue[] | { x: readonly EvChartLabel[]; y: readonly EvChartLabel[] };
  data?: Record<string, readonly EvChartPoint[]> | readonly EvChartSunburstNode[];
  logInfo?: string;
}

interface ChartPlotLabelOptions {
  show?: boolean;
  text?: string | null;
  fontColor?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number | string;
  fillColor?: string;
  lineColor?: string;
  lineWidth?: number;
  textAlign?: ChartTextAlign;
  verticalAlign?: 'top' | 'middle' | 'bottom';
  textOverflow?: 'none' | 'ellipsis';
  maxWidth?: number | null;
  borderRadius?: number;
  gap?: number | null;
  padding?: number | ChartPadding | null;
  pointer?: { show?: boolean; color?: string | null };
  position?: 'outside' | 'innerStart' | 'innerEnd';
  showValue?: boolean;
  valueFormatter?: ((value: EvChartLabel) => string | number | null | undefined) | null;
  responsive?: { valueOnlyBelow?: number | null; hideBelow?: number | null };
  showTextOnHover?: {
    use?: boolean;
    backgroundColor?: string;
    fontColor?: string;
    borderColor?: string | null;
    borderRadius?: number;
    fontSize?: number;
    fontWeight?: number | string;
    fontFamily?: string;
    useShadow?: boolean;
    shadowOpacity?: number;
    padding?: ChartPadding;
  };
}

export interface EvChartPlotLine {
  value: EvChartLabel;
  color?: string;
  lineWidth?: number;
  segments?: readonly number[];
  label?: ChartPlotLabelOptions;
}

export interface EvChartPlotBand {
  from?: EvChartLabel;
  to?: EvChartLabel;
  color?: string;
  border?: { color?: string; width?: number; segments?: readonly number[] } | null;
  label?: ChartPlotLabelOptions;
}

type ChartTimeUnit =
  'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

type ChartAxisRange<T extends EvChartLabel> =
  readonly T[] | ((min: number, max: number) => readonly T[]) | null;

interface ChartAxisOptions {
  min?: number | null;
  max?: number | null;
  autoScaleRatio?: number | null;
  startToZero?: boolean;
  showAxis?: boolean;
  axisLineColor?: string;
  axisLineWidth?: number;
  showGrid?: boolean;
  gridLineColor?: string;
  zeroLineColor?: string;
  showAxisTick?: boolean;
  showIndicator?: boolean;
  showLastLabel?: boolean;
  decimalPoint?: number | 'auto';
  fixedSteps?: boolean;
  scaleChange?: boolean;
  flow?: boolean;
  position?: ChartSide;
  labelStyle?: ChartFont & {
    show?: boolean;
    fitWidth?: boolean;
    fitDir?: 'left' | 'right';
    alignToGridLine?: boolean;
    padding?: number;
    fixWidth?: number;
    maxWidth?: number | string;
  };
  firstLabelFontStyle?: ChartFont | null;
  lastLabelFontStyle?: ChartFont | null;
  title?: ChartFont & {
    use?: boolean;
    text?: string | null;
    textAlign?: ChartTextAlign;
    fontStyle?: 'normal' | 'italic';
  };
  scrollbar?: {
    use?: boolean;
    showButton?: boolean;
    width?: number;
    height?: number;
    background?: string;
    resetPosition?: boolean;
    range?: readonly number[];
    thumbStyle?: { background?: string; radius?: number };
  };
  plotLines?: readonly EvChartPlotLine[];
  plotBands?: readonly EvChartPlotBand[];
}

interface ChartAxisFormatterContext<T> {
  prev?: T;
  isMaxValueSameAsMin?: boolean;
  isDefaultMaxSameAsMin?: boolean;
  prevOriginalValue?: T;
  prevDecimalPointValue?: T;
  currentOriginalValue?: T;
  currentDecimalPointValue?: T;
}

type ChartAxisFormatter<T> =
  ((value: T, context: ChartAxisFormatterContext<T>) => ChartFormatterText) | null;

export type EvChartAxisOptions = ChartAxisOptions &
  (
    | {
        type: 'linear' | 'log';
        interval?: number | null;
        range?: ChartAxisRange<number>;
        formatter?: ChartAxisFormatter<number>;
      }
    | {
        type: 'time';
        interval?: number | ChartTimeUnit | { unit: ChartTimeUnit; time: number } | null;
        range?: ChartAxisRange<EvChartLabel>;
        formatter?: ChartAxisFormatter<EvChartLabel>;
        categoryMode?: boolean;
        timeFormat?: string;
      }
    | {
        type: 'step';
        interval?: number | null;
        range?: ChartAxisRange<number>;
        formatter?: ChartAxisFormatter<EvChartLabel>;
        timeMode?: boolean;
        timeFormat?: string;
      }
  );

interface ChartLegendColumn {
  use?: boolean;
  title?: string;
  decimalPoint?: number | null;
  style?: CSSProperties;
  formatter?: (value: number) => ChartFormatterText;
}

export interface EvChartLegendOptions {
  show?: boolean;
  type?: 'icon' | 'gradient';
  position?: ChartSide;
  color?: string;
  inactive?: string;
  width?: number;
  height?: number;
  padding?: ChartPadding;
  allowResize?: boolean;
  virtualScroll?: boolean;
  clickMode?: 'active' | 'inactive';
  stopClickEvt?: boolean;
  external?: boolean;
  table?: {
    use?: boolean;
    columns?: Partial<Record<'name' | 'min' | 'max' | 'avg' | 'total' | 'last', ChartLegendColumn>>;
    style?: { header?: CSSProperties; row?: CSSProperties };
  };
}

export interface EvChartRenderedPoint {
  x: ChartAxisValue;
  y: ChartAxisValue;
  o: number | null;
  b?: number | null;
  xp?: number | null;
  yp?: number | null;
  w?: number | null;
  h?: number | null;
  acc?: number | null;
  dataColor?: string | null;
  dataTextColor?: string | null;
  cId?: string | null;
  formatted?: string | number | null;
}

export interface EvChartTooltipSeriesItem {
  sId: string;
  data: Partial<EvChartRenderedPoint> & { percentage?: number };
  color: ChartColor;
  name: string;
  dataId?: string;
  index: number;
}

interface ChartTooltipLabelContext {
  dataId?: string;
  seriesId: string;
  seriesName: string;
  itemData: EvChartTooltipSeriesItem['data'];
}

interface ChartTooltipColorContext {
  id?: string | null;
  name: ChartAxisValue;
  value: string | number | null;
  dataId?: string;
}

interface ChartTooltipValueContext {
  seriesId: string;
  dataId?: string;
}

interface ChartCartesianTooltipValue extends ChartTooltipValueContext {
  x: ChartAxisValue | undefined;
  y: ChartAxisValue | undefined;
  o: number | null | undefined;
  name: string;
}

interface ChartHeatMapTooltipValue extends ChartTooltipValueContext {
  x: EvChartLabel;
  y: EvChartLabel;
  value: number | 'error';
}

interface ChartPieTooltipValue extends ChartTooltipValueContext {
  value: number;
  name: string;
  percentage?: number;
}

type ChartTooltipValue<T extends EvChartType> = T extends 'pie'
  ? ChartPieTooltipValue
  : T extends 'heatMap'
    ? ChartHeatMapTooltipValue
    : ChartCartesianTooltipValue;

type ChartTooltipValueFormatter<T extends EvChartType> = (
  context: ChartTooltipValue<T>,
) => ChartFormatterText;
type ChartTooltipFieldColor = string | ((context: ChartTooltipColorContext) => string);

export interface EvChartTooltipOptions<T extends EvChartType = EvChartType> {
  use?: boolean;
  sortByValue?: boolean;
  backgroundColor?: string;
  fontColor?:
    | string
    | {
        title?: string;
        label?: ChartTooltipFieldColor;
        value?: ChartTooltipFieldColor;
      };
  borderColor?: string;
  shadowOpacity?: number;
  useShadow?: boolean;
  throttledMove?: boolean;
  debouncedHide?: boolean;
  useScrollbar?: boolean;
  textOverflow?: 'wrap' | 'ellipsis';
  fontFamily?: string;
  colorShape?: 'rect' | 'circle';
  fontSize?: { title?: number; contents?: number };
  rowPadding?: ChartPadding;
  showHeader?: boolean;
  showAllValueInRange?: boolean;
  maxHeight?: number;
  maxWidth?: number;
  htmlScrollTarget?: string;
  virtualScroll?: {
    use?: 'auto' | boolean;
    threshold?: number;
    estimatedRowHeight?: number;
    overscan?: number;
  };
  formatter?:
    | ChartTooltipValueFormatter<T>
    | {
        value?: ChartTooltipValueFormatter<T>;
        label?: (context: ChartTooltipLabelContext) => string;
        title?: (context: { x: ChartAxisValue; y: ChartAxisValue }) => ChartFormatterText;
        html?: (
          seriesList: EvChartTooltipSeriesItem[],
          context?: { dragRange: { from: EvChartLabel; to: EvChartLabel } },
        ) => string;
      }
    | null;
  returnValue?: (seriesList: EvChartTooltipSeriesItem[], event: MouseEvent) => void;
}

interface ChartTipOptions {
  use?: boolean;
  fixedPosTop?: boolean;
  showIndicator?: boolean;
  indicatorColor?: string;
  tipBackground?: string;
  tipTextColor?: string;
  tipStyle?: {
    height?: number;
    background?: string;
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: number | string;
  };
}

interface ChartSelectOptions {
  use?: boolean;
  useClick?: boolean;
  limit?: number;
  useDeselectOverflow?: boolean;
}

interface ChartSelectTipOptions extends ChartTipOptions {
  useClick?: boolean;
  showTextTip?: boolean;
  tipText?: 'value' | 'label';
  showTip?: boolean;
  useApproximateValue?: boolean;
  useSeriesOpacity?: boolean;
}

export interface EvChartZoomOptions {
  use?: boolean;
  bufferMemoryCnt?: number;
  keepZoomStatus?: boolean;
  useAnimation?: boolean;
  useWheelMove?: boolean;
  toolbar?: {
    show?: boolean;
    items?: Partial<
      Record<
        'previous' | 'latest' | 'reset' | 'dragZoom',
        {
          icon?: string;
          size?: 'small' | 'medium' | 'large';
          title?: string;
        }
      >
    >;
  };
}

interface ChartAnnotationContext {
  xValue: ChartAxisValue;
  yValue: ChartAxisValue;
  seriesId: string | null;
  seriesName: string | null;
  dataIndex: number;
  percentage: number | null;
}

export interface EvChartAnnotation {
  id?: string;
  type?: 'text' | 'badge' | 'callout' | 'circle';
  content?: string | ((context: ChartAnnotationContext) => string) | null;
  position?: { offsetX?: number; offsetY?: number } & (
    | { type?: 'pixel'; x?: number; y?: number }
    | {
        type: 'axis';
        xAxisIndex?: number;
        yAxisIndex?: number;
        xValue: EvChartLabel;
        yValue: EvChartLabel;
      }
    | { type: 'series'; seriesId: string; location?: 'start' | 'end' | number }
  );
  style?: Omit<ChartFont, 'fontSize'> & {
    fontSize?: string | number;
    anchor?: ChartSide | 'auto';
    arrowSize?: number;
    backgroundColor?: string;
    borderColor?: string;
    borderRadius?: number;
    borderWidth?: number;
    padding?: number | readonly number[];
    radius?: number;
    textAlign?: ChartTextAlign;
  };
  connector?: {
    enabled?: boolean;
    type?: 'straight' | 'elbow';
    style?: { stroke?: string; strokeWidth?: number; dashStyle?: 'solid' | 'dash' | 'dot' };
  };
}

interface ChartOptions {
  axesX?: readonly (EvChartAxisOptions & { position?: 'top' | 'bottom' })[];
  axesY?: readonly (EvChartAxisOptions & { position?: 'left' | 'right' })[];
  width?: number | string;
  height?: number | string;
  padding?: ChartPadding;
  border?: number;
  borderRadius?: number;
  title?: { show?: boolean; height?: number; text?: string; style?: CSSProperties };
  legend?: EvChartLegendOptions;
  itemHighlight?: boolean;
  seriesHighlight?: boolean;
  unSelectedOpacity?: number;
  useSelect?: boolean;
  doughnutHoleSize?: number;
  pieStroke?: { use?: boolean; lineWidth?: number; color?: string };
  sunburst?: boolean;
  reverse?: boolean;
  horizontal?: boolean;
  displayOverflow?: boolean;
  overlapping?: { use?: boolean };
  thickness?: number | `${number}px`;
  cPadRatio?: number;
  combo?: boolean;
  indicator?: { use?: boolean; color?: string; segments?: readonly number[] | null };
  plot?: { aboveSeries?: boolean };
  maxTip?: ChartTipOptions;
  selectItem?: ChartSelectTipOptions & {
    useDeselectItem?: boolean;
    showBorder?: boolean;
    showLabelTip?: boolean;
    borderStyle?: ChartStroke;
  };
  selectLabel?: ChartSelectTipOptions &
    ChartSelectOptions & {
      useLabelOpacity?: boolean;
      useBothAxis?: boolean;
    };
  selectSeries?: ChartSelectOptions;
  dragSelection?: {
    use?: boolean;
    keepDisplay?: boolean;
    size?: number;
    fillColor?: string;
    opacity?: number;
    startArea?: string;
    displayFromStartArea?: boolean;
    updateHoverOnDrag?: boolean;
    showTooltipOnEmpty?: boolean;
  };
  zoom?: EvChartZoomOptions;
  heatMapColor?: {
    min?: string;
    max?: string;
    rangeCount?: number;
    colorsByRange?: readonly { color: string; label?: string }[];
    stroke?: ChartStroke & { show?: boolean };
    error?: string;
    decimalPoint?: number;
  };
  realTimeScatter?: { use?: boolean; range?: number; label?: string };
  annotations?: readonly EvChartAnnotation[];
  seriesReverse?: boolean;
  coordinateDedupe?: boolean;
  eventBehavior?: { legendClick?: 'update' | 'emitOnly' };
  syncHover?: boolean;
  workerRender?: boolean;
  shallowDataWatch?: boolean;
  shallowOptionsWatch?: boolean;
}

type CartesianChart = Exclude<EvChartType, 'pie' | 'heatMap'>;

export type EvChartOptions = ChartOptions &
  (
    | { type: 'pie'; tooltip?: EvChartTooltipOptions<'pie'> }
    | { type: 'heatMap'; tooltip?: EvChartTooltipOptions<'heatMap'> }
    | { type?: CartesianChart; tooltip?: EvChartTooltipOptions<CartesianChart> }
  );

export interface EvChartGroupOptions {
  syncHover?: boolean;
  sharedTooltip?: boolean;
  zoom?: EvChartZoomOptions;
}

export interface EvChartBrushOptions {
  show?: boolean;
  useDebounce?: boolean;
  chartIdx?: number;
  height?: number | string;
  showLabel?: boolean;
  selection?: { fillColor?: string; opacity?: number };
  useWheelMove?: boolean;
}

export interface EvChartSelectedItem {
  seriesID: string;
  /** Pie charts identify a slice by its series ID alone. */
  dataIndex?: number | null;
}

export interface EvChartSelectedLabel {
  dataIndex: number[];
  targetAxis?: EvChartAxisTarget | null;
}

export interface EvChartSelectedSeries {
  seriesId: string[];
}

export interface EvChartLegendItem {
  sId: string;
  name: string;
  color: string;
  type: EvChartType;
  show: boolean;
  fill?: EvChartSeries['fill'];
  fillColor?: string;
}

export interface EvChartProps {
  data?: EvChartData;
  options?: EvChartOptions;
  selectedItem?: EvChartSelectedItem | null;
  selectedLabel?: EvChartSelectedLabel | null;
  selectedSeries?: EvChartSelectedSeries | { seriesId: string } | null;
  resizeTimeout?: number;
  zoomStartIdx?: number;
  zoomEndIdx?: number;
  realTimeScatterReset?: boolean;
  legendData?: EvChartLegendItem[];
}

export interface EvChartGroupProps {
  options?: EvChartGroupOptions;
  zoomStartIdx?: number;
  zoomEndIdx?: number;
  groupSelectedLabel?: EvChartSelectedLabel | null;
}

export interface EvChartBrushProps {
  options?: EvChartBrushOptions;
}

type ChartSelectionTarget = 'item' | 'label' | 'series';

type ChartClickSelection =
  | ({ eventTarget: 'item' } & (
      { seriesId: string; dataIndex: number | undefined } | { seriesId: null; dataIndex: null }
    ))
  | (EvChartSelectedLabel & {
      eventTarget: 'label';
      label: (ChartAxisValue | undefined)[];
      data: Record<string, EvChartPoint | undefined>[] | EvChartHeatMapPoint[];
    })
  | (EvChartSelectedSeries & { eventTarget: 'series' });

interface ChartPointerHit {
  e: MouseEvent;
  label?: ChartAxisValue;
  seriesId?: string | null;
  dataIndex?: number | null;
}

export interface EvChartClickEvent extends ChartPointerHit {
  value?: ChartAxisValue;
  acc?: number | string | null;
  selected?: ChartClickSelection;
  deselected?: { eventTarget: 'label' | 'item' };
  data?: EvChartDragSelectEvent['data'];
  range?: EvChartDragSelectEvent['range'];
  touchInfo?: EvChartDragSelectEvent['touchInfo'];
}

export interface EvChartDoubleClickEvent extends ChartPointerHit {
  eventTarget?: ChartSelectionTarget;
  value?: number | null;
  acc?: number | null;
}

export interface EvChartHoveredLabel {
  label: number | '' | null;
  horizontal?: boolean;
  mousePosition?: [number, number];
  dataLabel?: ChartAxisValue;
}

interface ChartMouseHit {
  items: Record<
    string,
    {
      data: EvChartTooltipSeriesItem['data'];
      hit?: boolean;
      directHit?: boolean;
      color?: ChartColor;
      name: string;
      id?: string;
      index: number;
      label: ChartAxisValue;
      axis: { x: number; y: number };
    }
  >;
  hitId: string | null | undefined;
  maxTip: [string, string];
  maxHighlight: [string, number] | null;
}

export interface EvChartMouseMoveEvent {
  e: MouseEvent;
  hoveredLabel: EvChartHoveredLabel;
  curMouseTargetVal?: {
    location: EvChartAxisTarget | 'chartBackground' | 'canvas';
    labelIdx: number;
    labelVal: ChartAxisValue;
    dataIdx: number;
    maxDataVal: number | '';
    originVal: ChartAxisValue | ChartMouseHit;
  };
}

export interface EvChartDragSelectEvent {
  e: MouseEvent;
  data: { seriesId: string; seriesName: string; items: EvChartRenderedPoint[] }[];
  range: { xMin: EvChartLabel; xMax: EvChartLabel; yMin: EvChartLabel; yMax: EvChartLabel } | null;
  touchInfo?: {
    xcp: number;
    ycp: number;
    xsp?: number;
    ysp?: number;
    width?: number;
    height?: number;
    range: { x1: number; x2: number; y1: number; y2: number };
  };
}

export interface EvChartLegendClickEvent {
  e?: MouseEvent;
  data: { isActiveAll: boolean } & (
    { seriesIds: string[]; seriesIndices?: never } | { seriesIds?: never; seriesIndices: number[] }
  );
}

interface ChartAxisScale {
  minSteps: number;
  maxSteps: number;
}

export interface EvChartAxesScaleChangeEvent {
  x: ChartAxisScale[];
  y: ChartAxisScale[];
}

export type EvChartEvents = {
  click: (payload: EvChartClickEvent) => void;
  'dbl-click': (payload: EvChartDoubleClickEvent) => void;
  'drag-select': (payload: EvChartDragSelectEvent) => void;
  'mouse-move': (payload: EvChartMouseMoveEvent) => void;
  'update:selectedItem': (payload: EvChartSelectedItem | null) => void;
  'update:selectedLabel': (payload: EvChartSelectedLabel) => void;
  'update:selectedSeries': (payload: EvChartSelectedSeries) => void;
  'update:zoomStartIdx': (payload: number) => void;
  'update:zoomEndIdx': (payload: number) => void;
  'update:realTimeScatterReset': (payload: false) => void;
  'click-legend': (payload: EvChartLegendClickEvent) => void;
  'update:legendData': (payload: EvChartLegendItem[]) => void;
  'axes-scale-change': (payload: EvChartAxesScaleChangeEvent) => void;
  'axes-data-max-change': (payload: number | null) => void;
};

export type EvChartGroupEvents = {
  'update:groupSelectedLabel': (payload: EvChartSelectedLabel | null) => void;
  'update:groupHoveredLabel': (payload: EvChartHoveredLabel | null) => void;
  'update:zoomStartIdx': (payload: number) => void;
  'update:zoomEndIdx': (payload: number) => void;
};

export type EvChartMethods = {
  redraw(): void;
  toggleSeries(seriesId: string): void;
  highlightSeries(seriesId: string): void;
  unhighlightSeries(): void;
};

export type EvChartGroupMethods = {
  deferPollingRedraw(durationMs?: number): void;
};

export declare const EvChart: EvComponent<EvChartProps, EvChartEvents, EvChartMethods>;
export declare const EvChartGroup: EvComponent<
  EvChartGroupProps,
  EvChartGroupEvents,
  EvChartGroupMethods
>;
export declare const EvChartBrush: EvComponent<EvChartBrushProps>;
