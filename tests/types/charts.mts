import { createApp, h } from 'vue';
import { EvChart, EvChartBrush, EvChartGroup, type EvChartData, type EvChartOptions } from 'evui';

type ChartProps = InstanceType<typeof EvChart>['$props'];
type GroupProps = InstanceType<typeof EvChartGroup>['$props'];
type BrushProps = InstanceType<typeof EvChartBrush>['$props'];

const chart: ChartProps = {
  data: {
    labels: [new Date(), '2026-10-01'],
    series: { latency: { type: 'line', fill: { gradient: true } } },
    data: { latency: [1, null] },
  },
  options: {
    type: 'line',
    title: { style: { fontSize: '12px', textAlign: 'center' } },
    annotations: [{ content: null, style: { fontSize: 12 } }],
    tooltip: {
      formatter: {
        html: (series, context) => `${series[0]?.name}: ${context?.dragRange.from}`,
      },
    },
    axesX: [{ type: 'time', interval: 'minute' }],
    axesY: [{ type: 'linear', range: (min, max) => [min, Math.max(max, 10)] }],
  },
  'onUpdate:selectedItem': (item) => item?.seriesID.toUpperCase(),
  onAxesScaleChange: ({ x }) => x[0]?.maxSteps.toFixed(),
  onAxesDataMaxChange: (max) => max?.toFixed(),
  onClick: ({ selected, e }) => {
    e.preventDefault();
    if (selected?.eventTarget === 'label') {
      selected.dataIndex.map((index) => index.toFixed());
    }
  },
  onDragSelect: ({ range, data }) => {
    if (typeof range?.xMin === 'number') {
      range.xMin.toFixed();
    }
    data[0]?.seriesId.toUpperCase();
  },
  onClickLegend: ({ data }) => data.isActiveAll,
};

const group: GroupProps = {
  options: { syncHover: true, zoom: { toolbar: { show: true } } },
  groupSelectedLabel: { dataIndex: [1, 3] },
  'onUpdate:zoomEndIdx': (end) => end.toFixed(),
  'onUpdate:groupSelectedLabel': (selection) => selection?.dataIndex.at(0),
};

const brush: BrushProps = { options: { chartIdx: 1, selection: { opacity: 0.5 } } };

const sunburst: EvChartData = {
  series: { category: { name: 'Category' }, item: { name: 'Item' } },
  data: [{ id: 'category', value: 3, children: [{ id: 'item', value: 3 }] }],
};
const sunburstOptions: EvChartOptions = {
  type: 'pie',
  sunburst: true,
  tooltip: { formatter: ({ value }) => value.toFixed(1) },
};
const heatMap: ChartProps = {
  data: {
    labels: { x: ['East'], y: [1] },
    series: { traffic: {} },
    data: { traffic: [{ x: 'East', y: 1, value: 12 }] },
  },
  options: {
    type: 'heatMap',
    axesX: [{ type: 'step', labelStyle: { maxWidth: '20%' } }],
    axesY: [{ type: 'step' }],
    tooltip: { formatter: { value: ({ value }) => (value === 'error' ? value : value.toFixed()) } },
  },
  onClickLegend: ({ data }) => data.seriesIndices?.map((index) => index.toFixed()),
};

declare const groupInstance: InstanceType<typeof EvChartGroup>;
declare const chartInstance: InstanceType<typeof EvChart>;
groupInstance.deferPollingRedraw(450);
chartInstance.toggleSeries('latency');
chartInstance.$emit('axes-data-max-change', null);

// @ts-expect-error $emit uses the event name declared at runtime
chartInstance.$emit('axesDataMaxChange', null);

const badChartType: ChartProps = {
  // @ts-expect-error combo charts omit type and specify each series type
  options: { type: 'combo' },
};
const badChartData: ChartProps = {
  // @ts-expect-error each regular series carries an array of points
  data: { data: { latency: 12 } },
};
const badChartListener: ChartProps = {
  // @ts-expect-error a y-axis maximum can be a number or null
  onAxesDataMaxChange: (max: string) => max.toUpperCase(),
};
const badGroupSelection: GroupProps = {
  // @ts-expect-error selection indices are numbers
  groupSelectedLabel: { dataIndex: ['first'] },
};
const badBrushOptions: BrushProps = {
  // @ts-expect-error brush opacity is a number
  options: { selection: { opacity: '50%' } },
};

h(EvChart, chart);
h(EvChart, { data: sunburst, options: sunburstOptions, selectedItem: { seriesID: 'item' } });
h(EvChart, heatMap);
h(EvChartGroup, group);
h(EvChartBrush, brush);
createApp({}).use(EvChart).use(EvChartGroup).use(EvChartBrush);
void [badChartType, badChartData, badChartListener, badGroupSelection, badBrushOptions];
