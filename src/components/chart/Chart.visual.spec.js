import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-vue';
import EvChart from './Chart.vue';

describe('EvChart Visual Regression', () => {
  // 차트 렌더링 대기 헬퍼 (Canvas 렌더링 완료 대기)
  const waitForChart = async (container) => {
    // 초기 렌더링 대기
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Canvas가 그려질 때까지 대기
    const canvas = container?.querySelector('canvas');
    if (canvas) {
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });
    }

    // 추가 안정화 대기
    await new Promise((resolve) => setTimeout(resolve, 1500));
  };

  // 기본 Line 차트 데이터 (올바른 형식)
  const lineChartData = {
    series: {
      series1: { name: 'Sales' },
      series2: { name: 'Revenue' },
    },
    labels: [1, 2, 3, 4, 5],
    data: {
      series1: [10, 20, 30, 25, 35],
      series2: [15, 25, 20, 30, 40],
    },
  };

  const lineChartOptions = {
    type: 'line',
    width: '600px',
    height: '450px',
    title: { text: 'Monthly Sales', show: true },
    legend: { show: true, position: 'right' },
    axesX: [{ type: 'linear', showGrid: true, showAxis: true, showLabel: true }],
    axesY: [{ type: 'linear', showGrid: true, startToZero: true, showAxis: true }],
    padding: { top: 20, right: 20, bottom: 50, left: 50 },
  };

  // Bar 차트 데이터
  const barChartData = {
    series: {
      series1: { name: 'Product A' },
      series2: { name: 'Product B' },
    },
    labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
    data: {
      series1: [120, 200, 150, 80, 70],
      series2: [100, 180, 130, 90, 60],
    },
  };

  const barChartOptions = {
    type: 'bar',
    width: '600px',
    height: '520px',
    title: { text: 'Quarterly Sales', show: true },
    legend: { show: true, position: 'top' },
    axesX: [{ type: 'step', showAxis: true, showAxisTick: true }],
    axesY: [{ type: 'linear', startToZero: true, showAxis: true, showAxisTick: true }],
    padding: { top: 20, right: 20, bottom: 80, left: 60 },
  };

  // Pie 차트 데이터
  const pieChartData = {
    series: {
      series1: { name: 'Chrome' },
      series2: { name: 'Firefox' },
      series3: { name: 'Safari' },
      series4: { name: 'Edge' },
    },
    labels: ['Browser Share'],
    data: {
      series1: [60],
      series2: [20],
      series3: [15],
      series4: [5],
    },
  };

  const pieChartOptions = {
    type: 'pie',
    width: '500px',
    height: '450px',
    title: { text: 'Browser Market Share', show: true },
    legend: { show: true, position: 'right' },
    padding: { top: 20, right: 20, bottom: 30, left: 20 },
  };

  // Scatter 차트 데이터 ({x, y} 포인트)
  const scatterChartData = {
    series: {
      series1: { name: 'Group A' },
      series2: { name: 'Group B' },
    },
    data: {
      series1: [
        { x: 10, y: 20 },
        { x: 30, y: 45 },
        { x: 55, y: 30 },
        { x: 70, y: 65 },
        { x: 90, y: 50 },
      ],
      series2: [
        { x: 15, y: 60 },
        { x: 40, y: 35 },
        { x: 60, y: 70 },
        { x: 80, y: 25 },
        { x: 95, y: 80 },
      ],
    },
  };

  const scatterChartOptions = {
    type: 'scatter',
    width: '600px',
    height: '450px',
    title: { text: 'Scatter Plot', show: true },
    legend: { show: true, position: 'right' },
    axesX: [{ type: 'linear', startToZero: true, showGrid: true, showAxis: true }],
    axesY: [{ type: 'linear', startToZero: true, showGrid: true, showAxis: true }],
    padding: { top: 20, right: 20, bottom: 50, left: 50 },
  };

  // HeatMap 차트 데이터 ({x, y, value} 셀)
  const heatMapChartData = {
    series: {
      series1: { name: 'Activity' },
    },
    labels: {
      x: ['00:00', '06:00', '12:00', '18:00'],
      y: ['1w', '2w', '3w'],
    },
    data: {
      series1: [
        { x: '00:00', y: '1w', value: 100 },
        { x: '00:00', y: '2w', value: 80 },
        { x: '00:00', y: '3w', value: 130 },
        { x: '06:00', y: '1w', value: 20 },
        { x: '06:00', y: '2w', value: 150 },
        { x: '06:00', y: '3w', value: 115 },
        { x: '12:00', y: '1w', value: 150 },
        { x: '12:00', y: '2w', value: 80 },
        { x: '12:00', y: '3w', value: 120 },
        { x: '18:00', y: '1w', value: 40 },
        { x: '18:00', y: '2w', value: 150 },
        { x: '18:00', y: '3w', value: 90 },
      ],
    },
  };

  const heatMapChartOptions = {
    type: 'heatMap',
    width: '600px',
    height: '450px',
    title: { text: 'Heat Map', show: true },
    axesX: [{ type: 'step' }],
    axesY: [{ type: 'step' }],
    heatMapColor: { min: '#FFC19E', max: '#CC3D3D', rangeCount: 5 },
    padding: { top: 20, right: 20, bottom: 50, left: 50 },
  };

  // Combo 차트 데이터 (시리즈별 bar/line 혼합)
  const comboChartData = {
    series: {
      series1: { name: 'Bar', show: true, type: 'bar' },
      series2: { name: 'Line', show: true, type: 'line', combo: true },
    },
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    data: {
      series1: [120, 200, 150, 80, 170],
      series2: [60, 90, 70, 110, 80],
    },
  };

  const comboChartOptions = {
    width: '600px',
    height: '450px',
    title: { text: 'Combo Chart', show: true },
    legend: { show: true, position: 'right' },
    axesX: [{ type: 'step', showAxis: true }],
    axesY: [{ type: 'linear', startToZero: true, showAxis: true }],
    padding: { top: 20, right: 20, bottom: 50, left: 60 },
  };

  // Stacked Bar 차트 데이터 (groups 로 스택 구성)
  const stackedBarChartData = {
    series: {
      series1: { name: 'Series 1' },
      series2: { name: 'Series 2' },
      series3: { name: 'Series 3' },
    },
    groups: [['series1', 'series2', 'series3']],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    data: {
      series1: [50, 80, 60, 40, 70],
      series2: [30, 50, 90, 60, 40],
      series3: [70, 40, 30, 80, 50],
    },
  };

  const stackedBarChartOptions = {
    type: 'bar',
    width: '600px',
    height: '450px',
    title: { text: 'Stacked Bar', show: true },
    legend: { show: true, position: 'right' },
    axesX: [{ type: 'step', showAxis: true }],
    axesY: [{ type: 'linear', startToZero: true, showAxis: true }],
    padding: { top: 20, right: 20, bottom: 50, left: 60 },
  };

  // Log scale 데이터 (양수, 지수적 증가)
  const logScaleChartData = {
    series: {
      series1: { name: 'Exponential' },
    },
    labels: [1, 2, 3, 4, 5],
    data: {
      series1: [1, 10, 100, 1000, 10000],
    },
  };

  // 음수 값을 포함한 Line 데이터
  const negativeLineChartData = {
    series: {
      series1: { name: 'Profit/Loss' },
    },
    labels: [1, 2, 3, 4, 5],
    data: {
      series1: [-20, 30, -10, 40, -5],
    },
  };

  describe('Line Chart', () => {
    it('기본 Line 차트 렌더링', async () => {
      const screen = render(EvChart, {
        props: {
          data: lineChartData,
          options: lineChartOptions,
        },
      });

      // 차트 렌더링 대기
      await waitForChart(screen.container);

      // 차트 컨테이너 전체 캡처 (x축 레이블 포함)
      const chart = screen.container.firstElementChild;
      await expect(chart).toMatchScreenshot('line-chart-basic');
    });

    it('그리드 없는 Line 차트', async () => {
      const screen = render(EvChart, {
        props: {
          data: lineChartData,
          options: {
            ...lineChartOptions,
            axesX: [{ type: 'linear', showGrid: false }],
            axesY: [{ type: 'linear', showGrid: false }],
          },
        },
      });

      await waitForChart(screen.container);
      const chart = screen.container.firstElementChild;
      await expect(chart).toMatchScreenshot('line-chart-no-grid');
    });
  });

  describe('Bar Chart', () => {
    it('기본 Bar 차트 렌더링', async () => {
      const screen = render(EvChart, {
        props: {
          data: barChartData,
          options: barChartOptions,
        },
      });

      await waitForChart(screen.container);
      const chart = screen.container.firstElementChild;
      await expect(chart).toMatchScreenshot('bar-chart-basic');
    });

    it('가로 Bar 차트', async () => {
      const screen = render(EvChart, {
        props: {
          data: barChartData,
          options: {
            ...barChartOptions,
            horizontal: true,
            axesX: [{ type: 'linear', startToZero: true, showAxis: true, showAxisTick: true }],
            axesY: [{ type: 'step', showAxis: true, showAxisTick: true }],
          },
        },
      });

      await waitForChart(screen.container);
      const chart = screen.container.firstElementChild;
      await expect(chart).toMatchScreenshot('bar-chart-horizontal');
    });
  });

  describe('Pie Chart', () => {
    it('기본 Pie 차트 렌더링', async () => {
      const screen = render(EvChart, {
        props: {
          data: pieChartData,
          options: pieChartOptions,
        },
      });

      await waitForChart(screen.container);
      const chart = screen.container.firstElementChild;
      await expect(chart).toMatchScreenshot('pie-chart-basic');
    });

    it('Doughnut 차트 (내부 원)', async () => {
      const screen = render(EvChart, {
        props: {
          data: pieChartData,
          options: {
            ...pieChartOptions,
            type: 'pie',
            doughnutHoleSize: 0.5,
            title: { text: 'Browser Share (Doughnut)', show: true },
          },
        },
      });

      await waitForChart(screen.container);
      const chart = screen.container.firstElementChild;
      await expect(chart).toMatchScreenshot('doughnut-chart-basic');
    });
  });

  describe('차트 스타일 변형', () => {
    it('다크 테마 스타일 차트', async () => {
      const screen = render(EvChart, {
        props: {
          data: lineChartData,
          options: {
            ...lineChartOptions,
            title: { text: 'Dark Theme Chart', show: true, style: { color: '#fff' } },
            background: { color: '#1a1a2e' },
          },
        },
      });

      await waitForChart(screen.container);
      const chart = screen.container.firstElementChild;
      await expect(chart).toMatchScreenshot('line-chart-dark-theme');
    });

    it('레전드 위치 변경', async () => {
      const screen = render(EvChart, {
        props: {
          data: lineChartData,
          options: {
            ...lineChartOptions,
            legend: { show: true, position: 'bottom' },
          },
        },
      });

      await waitForChart(screen.container);
      const chart = screen.container.firstElementChild;
      await expect(chart).toMatchScreenshot('line-chart-legend-bottom');
    });
  });

  // step3(hit test)·step4(path 생략)이 건드리는 출력 경로 회귀 커버 — 회귀 매트릭스 확장
  describe('회귀 매트릭스 — 타입 보강', () => {
    it('기본 Scatter 차트 렌더링', async () => {
      const screen = render(EvChart, {
        props: {
          data: scatterChartData,
          options: scatterChartOptions,
        },
      });

      await waitForChart(screen.container);
      const chart = screen.container.firstElementChild;
      await expect(chart).toMatchScreenshot('scatter-chart-basic');
    });

    it('기본 HeatMap 차트 렌더링', async () => {
      const screen = render(EvChart, {
        props: {
          data: heatMapChartData,
          options: heatMapChartOptions,
        },
      });

      await waitForChart(screen.container);
      const chart = screen.container.firstElementChild;
      await expect(chart).toMatchScreenshot('heatmap-chart-basic');
    });

    it('기본 Combo 차트 렌더링 (bar + line)', async () => {
      const screen = render(EvChart, {
        props: {
          data: comboChartData,
          options: comboChartOptions,
        },
      });

      await waitForChart(screen.container);
      const chart = screen.container.firstElementChild;
      await expect(chart).toMatchScreenshot('combo-chart-basic');
    });
  });

  describe('회귀 매트릭스 — 변형 보강', () => {
    it('Line 차트 범례 토글 (시리즈 숨김)', async () => {
      const screen = render(EvChart, {
        props: {
          data: {
            ...lineChartData,
            series: {
              series1: { name: 'Sales' },
              series2: { name: 'Revenue', show: false },
            },
          },
          options: lineChartOptions,
        },
      });

      await waitForChart(screen.container);
      const chart = screen.container.firstElementChild;
      await expect(chart).toMatchScreenshot('line-chart-legend-hidden');
    });

    it('Line 차트 axis formatter', async () => {
      const screen = render(EvChart, {
        props: {
          data: lineChartData,
          options: {
            ...lineChartOptions,
            axesX: [
              {
                type: 'linear',
                showGrid: true,
                showAxis: true,
                showLabel: true,
                formatter: (value) => `#${value}`,
              },
            ],
            axesY: [
              {
                type: 'linear',
                showGrid: true,
                startToZero: true,
                showAxis: true,
                formatter: (value) => `$${value}`,
              },
            ],
          },
        },
      });

      await waitForChart(screen.container);
      const chart = screen.container.firstElementChild;
      await expect(chart).toMatchScreenshot('line-chart-axis-formatter');
    });

    it('Line 차트 log scale (Y축 로그)', async () => {
      const screen = render(EvChart, {
        props: {
          data: logScaleChartData,
          options: {
            ...lineChartOptions,
            title: { text: 'Log Scale', show: true },
            axesY: [{ type: 'log', showGrid: true, showAxis: true }],
          },
        },
      });

      await waitForChart(screen.container);
      const chart = screen.container.firstElementChild;
      await expect(chart).toMatchScreenshot('line-chart-log-scale');
    });

    it('Line 차트 음수 값', async () => {
      const screen = render(EvChart, {
        props: {
          data: negativeLineChartData,
          options: {
            ...lineChartOptions,
            title: { text: 'Negative Values', show: true },
          },
        },
      });

      await waitForChart(screen.container);
      const chart = screen.container.firstElementChild;
      await expect(chart).toMatchScreenshot('line-chart-negative');
    });

    it('Stacked Bar 차트', async () => {
      const screen = render(EvChart, {
        props: {
          data: stackedBarChartData,
          options: stackedBarChartOptions,
        },
      });

      await waitForChart(screen.container);
      const chart = screen.container.firstElementChild;
      await expect(chart).toMatchScreenshot('bar-chart-stacked');
    });

    it('Line 차트 DPR 2배 환경', async () => {
      const originalDpr = Object.getOwnPropertyDescriptor(window, 'devicePixelRatio');
      Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true });

      try {
        const screen = render(EvChart, {
          props: {
            data: lineChartData,
            options: lineChartOptions,
          },
        });

        await waitForChart(screen.container);
        const chart = screen.container.firstElementChild;
        await expect(chart).toMatchScreenshot('line-chart-dpr2');
      } finally {
        if (originalDpr) {
          Object.defineProperty(window, 'devicePixelRatio', originalDpr);
        }
      }
    });
  });
});
