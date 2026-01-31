export const chartTypes = [
  { name: 'Line Chart', value: 'line' },
  { name: 'Bar Chart', value: 'bar' },
  { name: 'Pie Chart', value: 'pie' },
  { name: 'Scatter Chart', value: 'scatter' },
  { name: 'Heat Map', value: 'heatMap' },
  { name: 'Combo Chart', value: 'combo' },
];

export const templates = {
  line: {
    data: {
      series: {
        series1: { name: 'Series 1' },
        series2: { name: 'Series 2' },
        series3: { name: 'Series 3' },
      },
      labels: [
        '2024-01-01 00:00:00',
        '2024-01-01 01:00:00',
        '2024-01-01 02:00:00',
        '2024-01-01 03:00:00',
        '2024-01-01 04:00:00',
        '2024-01-01 05:00:00',
      ],
      data: {
        series1: [150, 220, 180, 290, 350, 420],
        series2: [80, 150, 120, 180, 220, 280],
        series3: [200, 180, 250, 220, 300, 350],
      },
    },
    options: {
      type: 'line',
      width: '100%',
      height: '100%',
      title: {
        text: 'Line Chart Example',
        show: true,
      },
      legend: {
        show: true,
        position: 'right',
      },
      axesX: [
        {
          type: 'time',
          timeFormat: 'HH:mm',
          interval: 'hour',
          showGrid: false,
          showAxisTick: true,
          axisLineColor: '#25262E',
        },
      ],
      axesY: [
        {
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
          showAxisTick: true,
          axisLineColor: '#25262E',
        },
      ],
      tooltip: {
        use: true,
      },
    },
  },

  bar: {
    data: {
      series: {
        series1: { name: 'Series 1' },
        series2: { name: 'Series 2' },
      },
      labels: ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'],
      data: {
        series1: [100, 150, 80, 200, 120],
        series2: [80, 120, 150, 100, 180],
      },
    },
    options: {
      type: 'bar',
      width: '100%',
      height: '100%',
      title: {
        text: 'Bar Chart Example',
        show: true,
      },
      legend: {
        show: true,
        position: 'right',
      },
      axesX: [
        {
          type: 'step',
          showAxisTick: true,
          axisLineColor: '#25262E',
        },
      ],
      axesY: [
        {
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
          showAxisTick: true,
          axisLineColor: '#25262E',
        },
      ],
      tooltip: {
        use: true,
      },
    },
  },

  pie: {
    data: {
      series: {
        series1: { name: 'Category A' },
        series2: { name: 'Category B' },
        series3: { name: 'Category C' },
        series4: { name: 'Category D' },
      },
      data: {
        series1: [30],
        series2: [25],
        series3: [20],
        series4: [25],
      },
    },
    options: {
      type: 'pie',
      width: '100%',
      height: '100%',
      title: {
        text: 'Pie Chart Example',
        show: true,
      },
      legend: {
        show: true,
        position: 'right',
      },
      tooltip: {
        use: true,
      },
    },
  },

  scatter: {
    data: {
      series: {
        series1: { name: 'Group A', pointSize: 5, pointStyle: 'circle' },
        series2: { name: 'Group B', pointSize: 5, pointStyle: 'triangle' },
      },
      data: {
        series1: [
          { x: 10, y: 20 },
          { x: 25, y: 35 },
          { x: 40, y: 25 },
          { x: 55, y: 45 },
          { x: 70, y: 30 },
          { x: 85, y: 55 },
          { x: 100, y: 40 },
        ],
        series2: [
          { x: 15, y: 45 },
          { x: 30, y: 25 },
          { x: 45, y: 50 },
          { x: 60, y: 35 },
          { x: 75, y: 60 },
          { x: 90, y: 45 },
        ],
      },
    },
    options: {
      type: 'scatter',
      width: '100%',
      height: '100%',
      title: {
        text: 'Scatter Chart Example',
        show: true,
      },
      legend: {
        show: true,
        position: 'right',
      },
      axesX: [
        {
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
        },
      ],
      axesY: [
        {
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
        },
      ],
      tooltip: {
        use: true,
      },
    },
  },

  heatMap: {
    data: {
      series: {
        series1: { name: 'Heat Map Data' },
      },
      labels: {
        x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        y: ['Morning', 'Afternoon', 'Evening'],
      },
      data: {
        series1: [
          { x: 'Mon', y: 'Morning', value: 80 },
          { x: 'Mon', y: 'Afternoon', value: 120 },
          { x: 'Mon', y: 'Evening', value: 60 },
          { x: 'Tue', y: 'Morning', value: 100 },
          { x: 'Tue', y: 'Afternoon', value: 90 },
          { x: 'Tue', y: 'Evening', value: 110 },
          { x: 'Wed', y: 'Morning', value: 70 },
          { x: 'Wed', y: 'Afternoon', value: 150 },
          { x: 'Wed', y: 'Evening', value: 85 },
          { x: 'Thu', y: 'Morning', value: 130 },
          { x: 'Thu', y: 'Afternoon', value: 95 },
          { x: 'Thu', y: 'Evening', value: 75 },
          { x: 'Fri', y: 'Morning', value: 140 },
          { x: 'Fri', y: 'Afternoon', value: 110 },
          { x: 'Fri', y: 'Evening', value: 90 },
        ],
      },
    },
    options: {
      type: 'heatMap',
      width: '100%',
      height: '100%',
      title: {
        text: 'Heat Map Example',
        show: true,
      },
      axesX: [
        {
          type: 'step',
        },
      ],
      axesY: [
        {
          type: 'step',
        },
      ],
      heatMapColor: {
        min: '#FFC19E',
        max: '#CC3D3D',
        rangeCount: 5,
      },
      tooltip: {
        use: true,
      },
    },
  },

  combo: {
    data: {
      series: {
        bar1: { name: 'Bar Series', type: 'bar' },
        line1: { name: 'Line Series', type: 'line', combo: true },
      },
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      data: {
        bar1: [1200, 1800, 1500, 2200],
        line1: [1000, 1600, 1400, 2000],
      },
    },
    options: {
      width: '100%',
      height: '100%',
      title: {
        text: 'Combo Chart Example',
        show: true,
      },
      legend: {
        show: true,
        position: 'right',
      },
      axesX: [
        {
          type: 'step',
          categoryMode: true,
          showAxisTick: true,
          axisLineColor: '#25262E',
        },
      ],
      axesY: [
        {
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
          showAxisTick: true,
          axisLineColor: '#25262E',
        },
      ],
      tooltip: {
        use: true,
      },
    },
  },
};
