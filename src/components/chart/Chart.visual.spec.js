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
});
