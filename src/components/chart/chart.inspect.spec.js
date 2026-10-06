import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import dayjs from 'dayjs';
import modules from './model/model.store';
import { attachInspector, logEmptySeconds } from './chart.inspect';

/**
 * 콘솔 조회 진입점(chart.inspect)이 realTimeScatter 링 보유 데이터를 점 자신의 x 초로 세는지,
 * 빈 초 자동 로그가 차트 단위로 공백을 묶어 찍는지, 강제 redraw 가 저장소를 건드리지 않는지 검증한다. 저장소는 실제 model.store 를 가짜 this 로 돌린다.
 * 시각은 dayjs 로컬로 만들어 실행 환경 타임존과 무관하다.
 */

const SECOND = 1000;
const FORMAT = 'YYYY-MM-DD HH:mm:ss';
const BASE = dayjs('2026-10-02 10:00:00').valueOf();
const at = (sec) => BASE + sec * SECOND;
const text = (sec) => dayjs(at(sec)).format(FORMAT);
// 10:00:00 + sec 초에 넣는 실점 수. 초마다 달라야 초별 집계가 섞여도 드러난다.
const pointsAt = (sec) => (sec % 3) + 1;

const createRtsChart = (ids = ['s1'], range = 300) =>
  Object.assign(Object.create(modules), {
    isInit: false,
    updateSeries: false,
    dataSet: {},
    options: { type: 'scatter', realTimeScatter: { use: true, range } },
    seriesInfo: { charts: { scatter: [...ids] } },
    seriesList: Object.fromEntries(ids.map((id) => [id, { name: `name-${id}` }])),
  });

// exemONE 배치 모양: 실점 다음 경계점 { x: toTime, y: null }.
const batchOf = (fromSec, toSec) => {
  const points = [];
  for (let sec = fromSec; sec <= toSec; sec++) {
    for (let k = 0; k < pointsAt(sec); k++) {
      points.push({ x: at(sec) + k * 100, y: k + 1 });
    }
  }
  points.push({ x: at(toSec), y: null });
  return points;
};

const inspectorOf = (chart) => {
  const element = document.createElement('div');
  element.className = 'ev-chart';
  attachInspector(element, () => chart);
  return element.__evuiChart__;
};

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'table').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  delete window.__EVUI_CHART__;
});

describe('chart.inspect query', () => {
  const setup = () => {
    const chart = createRtsChart();
    // 10:00:00~10:05:00 전체 + 10:02:05 에 경계점 하나 더.
    chart.createRealTimeScatterDataSet({
      s1: [...batchOf(0, 300), { x: at(125) + 500, y: null }],
    });
    return { chart, inspector: inspectorOf(chart) };
  };

  it('구간 초별 값·개수가 입력과 같고 y: null 점은 세지 않는다', () => {
    const { inspector } = setup();

    const result = inspector.query(text(120), text(130));

    expect(result.judge).toBe('창 안');
    // 칸은 그 초 점들의 y 값(오름차순), total 은 실점 개수다. 10:02:05 의 y: null 점은 세지 않는다.
    const valuesAt = (sec) => Array.from({ length: pointsAt(sec) }, (_, k) => k + 1).join(', ');
    expect(result.seconds.map((row) => [row.time, row.total, row['name-s1']])).toEqual(
      Array.from({ length: 11 }, (_, i) => [text(120 + i), pointsAt(120 + i), valuesAt(120 + i)]),
    );
    const expectedPoints = Array.from({ length: 11 }, (_, i) => pointsAt(120 + i)).reduce(
      (a, b) => a + b,
    );
    expect(result.series[0]).toMatchObject({
      id: 's1',
      name: 'name-s1',
      points: expectedPoints,
    });
    expect(result.series[0]).not.toHaveProperty('boundary');
  });

  it('창 시작 초(fromTime)의 점은 슬롯 위치와 무관하게 창 밖 보유점으로 센다', () => {
    const { inspector } = setup();

    const result = inspector.query();

    // 창은 렌더 X축과 같은 [fromTime+1초, toTime] = 10:00:01~10:05:00.
    expect(result.window).toMatchObject({ from: at(1), to: at(300) });
    expect(result.seconds).toHaveLength(300);
    expect(result.series[0].outOfWindow).toBe(pointsAt(0));
    expect(result.seconds.at(-1)).toMatchObject({ time: text(300), total: pointsAt(300) });
  });

  it('창은 이번 배치에서 빠진 series 의 우측단이 아니라 저장소가 그린 X축을 따른다', () => {
    const chart = createRtsChart(['s1', 's2']);
    chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300), s2: batchOf(0, 300) });
    chart.createRealTimeScatterDataSet({ s1: batchOf(301, 310) });
    // s1 이 빠진 배치 — 저장소는 이번 배치 키(s2)로 X축 우측단을 잡는다.
    chart.createRealTimeScatterDataSet({ s2: batchOf(301, 305) });

    expect(inspectorOf(chart).query().window).toMatchObject({ from: at(6), to: at(305) });
  });

  it.each([
    ['창 밖', text(-3600), text(-3590), 0],
    ['일부 창 밖', text(-10), text(10), 10],
  ])('요청 구간이 %s 이면 그렇게 판정하고 창 안 초만 행으로 만든다', (judge, from, to, rows) => {
    const { inspector } = setup();

    const result = inspector.query(from, to);

    expect(result.judge).toBe(judge);
    expect(result.seconds).toHaveLength(rows);
  });

  it('초별 표의 series 열은 이름으로 보이고 ms 열은 없다(이름이 겹치면 id 앞 8자를 붙인다)', () => {
    const chart = createRtsChart(['aaaaaaaa-1', 'bbbbbbbb-2', 'cccccccc-3']);
    chart.seriesList['aaaaaaaa-1'].name = 'WAS';
    chart.seriesList['bbbbbbbb-2'].name = 'DB';
    chart.seriesList['cccccccc-3'].name = 'DB';
    chart.createRealTimeScatterDataSet({
      'aaaaaaaa-1': batchOf(0, 10),
      'bbbbbbbb-2': batchOf(0, 10),
      'cccccccc-3': batchOf(0, 10),
    });

    const [row] = inspectorOf(chart).query(text(5), text(5)).seconds;

    expect(Object.keys(row)).toEqual(['time', 'total', 'WAS', 'DB (bbbbbbbb)', 'DB (cccccccc)']);
  });

  it('점이 없는 초는 null, y 가 0 인 점은 0 으로 보이고, 점이 많으면 범위로 줄인다', () => {
    const chart = createRtsChart();
    const many = Array.from({ length: 6 }, (_, k) => ({ x: at(3) + k * 10, y: 100 - k }));
    chart.createRealTimeScatterDataSet({
      s1: [{ x: at(1), y: 0 }, { x: at(1) + 500, y: 1250 }, ...many, { x: at(5), y: null }],
    });

    const cells = inspectorOf(chart)
      .query(text(1), text(3))
      .seconds.map((row) => row['name-s1']);

    expect(cells).toEqual(['0, 1250', null, '95 ~ 100 (6개)']);
  });

  it('queryData 는 실점이 있는 초와 그 구간에 점이 있는 series 열만 보인다', () => {
    const chart = createRtsChart(['s1', 's2', 's3']);
    chart.createRealTimeScatterDataSet({
      s1: [
        { x: at(1), y: 0 },
        { x: at(5), y: null },
      ],
      s2: [
        { x: at(3), y: 7 },
        { x: at(5), y: null },
      ],
      s3: [{ x: at(5), y: null }],
    });

    const { seconds } = inspectorOf(chart).queryData(text(0), text(4));

    expect(seconds).toEqual([
      { time: text(1), total: 1, 'name-s1': '0', 'name-s2': null },
      { time: text(3), total: 1, 'name-s1': null, 'name-s2': '7' },
    ]);
  });

  it('ms 숫자도 받는다', () => {
    const { inspector } = setup();

    expect(inspector.query(at(120), at(120) + 999).seconds).toHaveLength(1);
  });

  it('해석할 수 없는 시각은 경고하고 전체 구간으로 대체하지 않는다', () => {
    const { inspector } = setup();

    expect(inspector.query('10:02:00', text(130))).toBeNull();
    expect(console.warn).toHaveBeenCalled();
  });

  it('리셋으로 링이 비어도 조회된다', () => {
    const { chart, inspector } = setup();
    chart.resetRealTimeScatterDataSet();

    const result = inspector.query(text(120), text(130));

    expect(result.series[0]).toMatchObject({ points: 0, stored: 0 });
    expect(result.seconds).toHaveLength(11);
  });
});

describe('chart.inspect 빈 초 자동 로그', () => {
  const STORAGE_KEY = 'EVUI_CHART_LOG_EMPTY';
  // 색 배지(%c)를 걷어낸 본문.
  const plain = (message) => message.replace(/%c/g, '');
  const emptyLogs = () =>
    console.warn.mock.calls
      .map(([message]) => plain(message))
      .filter((m) => m.includes('빈 초') || m.includes('늦게 채워짐'));
  const boundaryAt = (sec) => ({ s1: [{ x: at(sec), y: null }] });
  // 10:00:00~10:05:00 을 받은 뒤, 301~310 초 중 302~305 초가 빈 배치.
  const gapBatch = { s1: [...batchOf(301, 301), ...batchOf(306, 310)] };

  beforeEach(() => {
    window.__EVUI_CHART_LOG_EMPTY__ = true;
  });

  afterEach(() => {
    delete window.__EVUI_CHART_LOG_EMPTY__;
    window.localStorage.removeItem(STORAGE_KEY);
  });

  it('localStorage 로 켜 두면 마운트 뒤 지나간 빈 초를 범위 한 줄로 찍는다', () => {
    delete window.__EVUI_CHART_LOG_EMPTY__;
    window.localStorage.setItem(STORAGE_KEY, '1');
    const chart = createRtsChart();
    chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300) });

    chart.createRealTimeScatterDataSet(gapBatch);

    expect(emptyLogs()).toEqual([
      expect.stringContaining(`빈 초 ${text(302)} ~ ${text(305)} (4초)`),
    ]);
  });

  it('빈 구간 시작·확정·늦게 채워짐은 서로 다른 색 배지로 찍는다', () => {
    const chart = createRtsChart();
    chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300) });
    [301, 302, 303].forEach((sec) => chart.createRealTimeScatterDataSet(boundaryAt(sec)));
    chart.createRealTimeScatterDataSet({ s1: batchOf(304, 305) });
    chart.createRealTimeScatterDataSet({
      s1: [
        { x: at(302), y: 1 },
        { x: at(306), y: null },
      ],
    });

    // 인자: [본문, 차트 번호 배지 스타일, '', 종류 배지 스타일, ''].
    const styleOf = (label) =>
      console.warn.mock.calls.find(([m]) => m.includes(`%c${label}%c`))?.[3];
    const styles = ['빈 초 시작', '빈 초', '늦게 채워짐'].map(styleOf);

    expect(styles.every((style) => style?.includes('background'))).toBe(true);
    expect(new Set(styles).size).toBe(3);
  });

  it('차트가 여럿이면 줄마다 차트 번호와 차트별 색 배지를 붙인다', () => {
    const charts = [createRtsChart(), createRtsChart()];
    charts.forEach((chart) => chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300) }));
    charts.forEach((chart) =>
      [301, 302].forEach((sec) => chart.createRealTimeScatterDataSet(boundaryAt(sec))),
    );

    const starts = console.warn.mock.calls.filter(([m]) => m.includes('%c빈 초 시작%c'));
    const tags = starts.map(([m]) => m.match(/%c(차트 #\d+)%c/)[1]);

    expect(starts).toHaveLength(2);
    expect(new Set(tags).size).toBe(2);
    expect(starts[0][1]).not.toBe(starts[1][1]);
  });

  it('realTimeScatter.label 이 있으면 줄에 series 없이 배지에 이름을 붙인다', () => {
    const chart = createRtsChart();
    chart.options.realTimeScatter.label = 'Postgresql Slow Query Monitor';
    chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300) });
    [301, 302].forEach((sec) => chart.createRealTimeScatterDataSet(boundaryAt(sec)));

    const [start] = emptyLogs();
    const announce = console.log.mock.calls.map(([m]) => plain(m)).find((m) => m.includes('켜짐'));

    expect(start).toMatch(/차트 #\d+ Postgresql Slow Query Monitor 빈 초 시작/);
    expect(announce).toMatch(/차트 #\d+ Postgresql Slow Query Monitor 빈 초 로그 켜짐/);
    expect([start, announce].some((m) => m.includes('series'))).toBe(false);
  });

  it('이름이 마운트 뒤에 들어오면 차트 이름을 한 번 알리고 이후 줄에 붙인다', () => {
    const chart = createRtsChart();
    chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300) });
    const announce = console.log.mock.calls.map(([m]) => plain(m)).find((m) => m.includes('켜짐'));

    // 소비자가 지표 정보가 채워진 뒤 options 로 이름을 넣는다.
    chart.options.realTimeScatter.label = 'Postgresql Slow Query Monitor';
    [301, 302, 303].forEach((sec) => chart.createRealTimeScatterDataSet(boundaryAt(sec)));

    const notices = console.log.mock.calls
      .map(([m]) => plain(m))
      .filter((m) => m.includes('차트 이름'));
    expect(announce).not.toContain('title 없음');
    expect(notices).toEqual([
      expect.stringMatching(/차트 #\d+ Postgresql Slow Query Monitor 차트 이름/),
    ]);
    expect(emptyLogs()[0]).toMatch(/Postgresql Slow Query Monitor 빈 초 시작/);
  });

  it('켜짐 줄에 번호로 조회하는 명령을 붙이고 DOM 요소는 붙이지 않는다', () => {
    const chart = createRtsChart();
    chart.target = document.createElement('div');

    chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300) });

    const call = console.log.mock.calls.find(([m]) => m.includes('빈 초 로그 켜짐'));
    const no = call[0].match(/차트 #(\d+)/)[1];
    expect(plain(call[0])).toContain(`__EVUI_CHART__(${no}).query()`);
    expect(call).not.toContain(chart.target);
  });

  it('꺼져 있으면 찍지 않는다', () => {
    delete window.__EVUI_CHART_LOG_EMPTY__;
    const chart = createRtsChart();
    chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300) });

    chart.createRealTimeScatterDataSet(gapBatch);

    expect(emptyLogs()).toEqual([]);
  });

  it('마운트되자마자 켜짐을 한 번 찍고, 경계점만 있는 마운트 데이터부터 판정한다', () => {
    const chart = createRtsChart();
    // 실점 없이 경계점만 있는 마운트 데이터(드문 데이터 차트).
    chart.createRealTimeScatterDataSet(boundaryAt(300));

    const announces = console.log.mock.calls
      .map(([m]) => plain(m))
      .filter((m) => m.includes('빈 초 로그 켜짐'));
    expect(announces).toEqual([expect.stringContaining(`${text(300)} 부터 지나가는 초를 본다`)]);

    [301, 302].forEach((sec) => chart.createRealTimeScatterDataSet(boundaryAt(sec)));
    expect(emptyLogs()).toEqual([
      expect.stringContaining(`빈 초 시작 ${text(300)} — 데이터가 다시`),
    ]);
    expect(console.log.mock.calls.filter(([m]) => m.includes('빈 초 로그 켜짐'))).toHaveLength(1);
  });

  it('데이터가 없는 마운트는 첫 데이터부터 본다고 찍는다', () => {
    const chart = createRtsChart();

    chart.createRealTimeScatterDataSet({});
    chart.createRealTimeScatterDataSet({});

    expect(
      console.log.mock.calls.map(([m]) => plain(m)).filter((m) => m.includes('빈 초 로그 켜짐')),
    ).toEqual([expect.stringContaining('빈 초 로그 켜짐 — 첫 데이터가 들어오면 그 시각부터 본다')]);
  });

  it('series 가 모두 사라져 우측단이 없어도 시각 역행으로 보지 않는다', () => {
    const chart = createRtsChart();
    chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300) });
    [301, 302].forEach((sec) => chart.createRealTimeScatterDataSet(boundaryAt(sec)));

    logEmptySeconds({ ...chart, dataSet: {} }, 0, 0);

    expect(emptyLogs()).toHaveLength(1);
  });

  it('마운트 데이터에 이미 있던 공백은 찍지 않는다', () => {
    const chart = createRtsChart();

    chart.createRealTimeScatterDataSet({ s1: [...batchOf(0, 100), ...batchOf(111, 300)] });

    expect(emptyLogs()).toEqual([]);
  });

  it('점 없는 배치의 대체 시각은 기준으로 쓰지 않는다', () => {
    // 브라우저 시각이 데이터 시각보다 1시간 이르면 점 없는 배치의 우측단(Date.now)이 1시간 앞에 잡힌다.
    vi.spyOn(Date, 'now').mockReturnValue(BASE - 3600 * SECOND);
    const chart = createRtsChart();
    chart.createRealTimeScatterDataSet({ s1: [] });

    chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300) });

    expect(emptyLogs()).toEqual([]);
  });

  it('배치를 넘어 이어진 공백은 시작을 바로 찍고, 데이터가 다시 들어오면 구간을 찍는다', () => {
    const chart = createRtsChart();
    chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300) });

    // 우측단 초(301)는 아직 들어오는 중이라 다음 배치가 지나갈 때 판정한다.
    chart.createRealTimeScatterDataSet(boundaryAt(301));
    expect(emptyLogs()).toEqual([]);
    [302, 303].forEach((sec) => chart.createRealTimeScatterDataSet(boundaryAt(sec)));
    expect(emptyLogs()).toEqual([expect.stringContaining(`빈 초 시작 ${text(301)}`)]);

    chart.createRealTimeScatterDataSet({ s1: batchOf(304, 304) });
    chart.createRealTimeScatterDataSet({ s1: batchOf(305, 305) });
    expect(emptyLogs().at(-1)).toContain(`빈 초 ${text(301)} ~ ${text(303)} (3초)`);
    expect(emptyLogs()).toHaveLength(2);
  });

  it('한 배치 안에서 공백이 닫히고 새 공백이 열리면 새 시작을 찍는다', () => {
    const chart = createRtsChart();
    chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300) });
    [301, 302, 303].forEach((sec) => chart.createRealTimeScatterDataSet(boundaryAt(sec)));

    chart.createRealTimeScatterDataSet({
      s1: [
        { x: at(303), y: 1 },
        { x: at(306), y: null },
      ],
    });

    expect(emptyLogs().slice(-2)).toEqual([
      expect.stringContaining(`빈 초 ${text(301)} ~ ${text(302)} (2초)`),
      expect.stringContaining(`빈 초 시작 ${text(304)}`),
    ]);
  });

  it('창 시작 초의 점이 놓인 최신 슬롯을 그 슬롯 초의 데이터로 보지 않는다', () => {
    const chart = createRtsChart();
    // 0초 점은 창 시작 초라 링의 최신 슬롯(300초 칸)에 놓인다.
    chart.createRealTimeScatterDataSet({
      s1: [
        { x: at(0), y: 1 },
        { x: at(150), y: 1 },
        { x: at(299), y: 1 },
        { x: at(300), y: null },
      ],
    });

    chart.createRealTimeScatterDataSet(boundaryAt(301));

    expect(emptyLogs()).toEqual([expect.stringContaining(`빈 초 시작 ${text(300)}`)]);
  });

  describe('우측단이 지나간 뒤 늦게 들어온 점', () => {
    // 경계점(조회 끝 시각)이 우측단을 먼저 밀고, 그 초의 점은 다음 배치에 늦게 들어온다.
    const lateBatch = (secs, edge) => ({
      s1: [...secs.map((sec) => ({ x: at(sec), y: 1 })), { x: at(edge), y: null }],
    });
    const advanceEmpty = (chart, secs) =>
      secs.forEach((sec) => chart.createRealTimeScatterDataSet(boundaryAt(sec)));

    it('열린 공백을 닫는다', () => {
      const chart = createRtsChart();
      chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300) });
      advanceEmpty(chart, [301, 302, 303, 304, 305, 306]);
      expect(emptyLogs()).toEqual([expect.stringContaining(`빈 초 시작 ${text(301)}`)]);

      chart.createRealTimeScatterDataSet(lateBatch([304], 307));

      expect(emptyLogs().slice(1)).toEqual([
        expect.stringContaining(`빈 초 ${text(301)} ~ ${text(303)} (3초)`),
        expect.stringContaining(`빈 초 시작 ${text(305)}`),
      ]);
    });

    it('열린 공백의 시작 초가 채워지면 시작을 바로잡아 찍는다', () => {
      const chart = createRtsChart();
      chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300) });
      advanceEmpty(chart, [301, 302, 303, 304]);

      chart.createRealTimeScatterDataSet(lateBatch([301, 303], 305));

      expect(emptyLogs().slice(1)).toEqual([
        expect.stringContaining(
          `빈 초 ${text(302)} (1초, 앞서 찍은 시작 ${text(301)} 은 늦게 채워짐)`,
        ),
        expect.stringContaining(`빈 초 시작 ${text(304)}`),
      ]);
    });

    // 301초부터 열린 공백이 늦은 데이터로 모두 채워진 상태(판정은 302초까지).
    const fillOpenGap = () => {
      const chart = createRtsChart();
      chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300) });
      advanceEmpty(chart, [301, 302, 303]);
      chart.createRealTimeScatterDataSet(lateBatch([301, 302], 303));
      return chart;
    };
    const filledNote = `앞서 찍은 시작 ${text(301)} 은 늦게 채워짐`;

    it('열린 공백이 모두 채워지면 따로 찍지 않고 다음 빈 초 시작 줄에 한 번 알린다', () => {
      const chart = fillOpenGap();
      expect(emptyLogs()).toEqual([expect.stringContaining(`빈 초 시작 ${text(301)}`)]);

      advanceEmpty(chart, [304, 305]);
      chart.createRealTimeScatterDataSet({ s1: batchOf(306, 307) });

      expect(emptyLogs().slice(1)).toEqual([
        expect.stringContaining(`빈 초 시작 ${text(303)} (${filledNote})`),
        expect.stringContaining(`빈 초 ${text(303)} ~ ${text(305)} (3초)`),
      ]);
    });

    it('열린 공백이 모두 채워진 뒤 다음 공백이 한 배치 안에서 닫히면 그 구간 줄에 알린다', () => {
      const chart = fillOpenGap();

      chart.createRealTimeScatterDataSet(lateBatch([305], 306));
      advanceEmpty(chart, [307]);

      expect(emptyLogs().slice(1)).toEqual([
        expect.stringContaining(`빈 초 ${text(303)} ~ ${text(304)} (2초, ${filledNote})`),
        expect.stringMatching(new RegExp(`빈 초 시작 ${text(306)} — `)),
      ]);
    });

    it.each([
      [
        '콘솔에서 다시 켜면',
        (chart) => {
          inspectorOf(chart);
          window.__EVUI_CHART__.logEmpty(false);
          window.__EVUI_CHART__.logEmpty(true);
        },
        [304, 305],
        304,
      ],
      [
        '시각이 뒤로 가면',
        (chart) =>
          chart.createRealTimeScatterDataSet({
            s1: [
              { x: at(-400), y: 1 },
              { x: at(-400), y: null },
            ],
          }),
        [-399, -398],
        -399,
      ],
    ])(
      '%s 기준을 다시 잡으므로 앞서 채워진 시작을 다음 공백 줄에 붙이지 않는다',
      (_, rebase, secs, start) => {
        const chart = fillOpenGap();

        rebase(chart);
        advanceEmpty(chart, secs);

        expect(emptyLogs().at(-1)).toMatch(new RegExp(`빈 초 시작 ${text(start)} — `));
      },
    );

    it('창 밖까지 이어진 열린 공백은 시작부터 한 구간으로 닫는다', () => {
      const range = 5;
      const chart = createRtsChart(['s1'], range);
      chart.createRealTimeScatterDataSet({ s1: batchOf(0, 5) });
      advanceEmpty(chart, [6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

      chart.createRealTimeScatterDataSet(lateBatch([16], 17));

      // 5초에는 점이 있어 공백은 6초부터다. 창(range 5)은 이미 13초부터라 6~12초는 창 밖에서 확정된 빈 초다.
      expect(emptyLogs().at(-1)).toContain(`빈 초 ${text(6)} ~ ${text(15)} (10초)`);
      expect(emptyLogs().at(-1)).not.toContain('늦게 채워짐');
      // 다시 볼 초 Set 은 크기 상한이 있어(V8 약 1,677만) 창 안 초만 담아야 한다.
      expect(chart._emptyLogReported.size).toBeLessThanOrEqual(range);
    });

    it('이미 찍은 빈 구간이 채워지면 늦게 채워짐을 찍는다', () => {
      const chart = createRtsChart();
      chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300) });
      chart.createRealTimeScatterDataSet(gapBatch);

      chart.createRealTimeScatterDataSet(lateBatch([303], 311));

      expect(emptyLogs().slice(1)).toEqual([
        expect.stringContaining(`늦게 채워짐 ${text(303)} (1초)`),
      ]);
    });
  });

  it('소비자가 data.logInfo 를 넘기면 줄 끝에 붙인다', () => {
    const chart = createRtsChart();
    chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300) });
    chart.data = { logInfo: 'lastTime 2026-10-02 10:05:00' };

    chart.createRealTimeScatterDataSet(gapBatch);

    expect(emptyLogs()).toEqual([expect.stringMatching(/\(4초\) — lastTime 2026-10-02 10:05:00$/)]);
  });

  it('한 series 라도 그 초에 점이 있으면 비지 않은 것으로 본다', () => {
    const chart = createRtsChart(['s1', 's2']);
    chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300), s2: batchOf(0, 300) });

    chart.createRealTimeScatterDataSet({ ...gapBatch, s2: batchOf(301, 310) });

    expect(emptyLogs()).toEqual([]);
  });

  it('리셋 뒤 재조회 데이터의 지난 공백은 찍지 않고, 기준 이후 지나간 초만 본다', () => {
    const chart = createRtsChart();
    chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300) });
    chart.resetRealTimeScatterDataSet();
    chart.createRealTimeScatterDataSet({});

    chart.createRealTimeScatterDataSet({ s1: [...batchOf(0, 100), ...batchOf(111, 300)] });
    expect(emptyLogs()).toEqual([]);

    chart.createRealTimeScatterDataSet(gapBatch);
    expect(emptyLogs()).toEqual([
      expect.stringContaining(`빈 초 ${text(302)} ~ ${text(305)} (4초)`),
    ]);
  });

  it('열린 공백은 리셋을 넘어 이어지고 데이터가 다시 들어오면 구간을 찍는다', () => {
    const chart = createRtsChart();
    chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300) });
    [301, 302].forEach((sec) => chart.createRealTimeScatterDataSet(boundaryAt(sec)));
    chart.resetRealTimeScatterDataSet();

    chart.createRealTimeScatterDataSet({ s1: [...batchOf(0, 300), ...batchOf(303, 304)] });

    expect(emptyLogs().at(-1)).toContain(`빈 초 ${text(301)} ~ ${text(302)} (2초)`);
  });

  it('시각이 뒤로 가면 열린 공백을 그 전까지로 닫아 찍고 기준을 다시 잡는다', () => {
    const chart = createRtsChart();
    chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300) });
    [301, 302].forEach((sec) => chart.createRealTimeScatterDataSet(boundaryAt(sec)));

    // 창(range 300)에 한 점도 못 들어갈 만큼 과거인 배치는 기준 재설정이 된다.
    const pointAt = (sec) => ({
      s1: [
        { x: at(sec), y: 1 },
        { x: at(sec), y: null },
      ],
    });
    chart.createRealTimeScatterDataSet(pointAt(-400));

    expect(emptyLogs().at(-1)).toContain(
      `빈 초 ${text(301)} (1초, 시각이 뒤로 가 기준을 다시 잡음)`,
    );
    chart.createRealTimeScatterDataSet(pointAt(-399));
    chart.createRealTimeScatterDataSet(pointAt(-398));
    expect(emptyLogs()).toHaveLength(2);
  });

  it('데이터가 오지 않은 사이 창 밖으로 지나간 초는 빈 초로 찍지 않고 그 배치부터 다시 본다', () => {
    const range = 5;
    const jump = 10000;
    const chart = createRtsChart(['s1'], range);
    let reads = 0;
    // 초마다 series 저장소를 한 번 읽으므로 읽은 횟수가 판정한 초 수다.
    chart.dataSet = new Proxy(chart.dataSet, {
      get(target, key) {
        reads += 1;
        return target[key];
      },
    });
    chart.createRealTimeScatterDataSet({ s1: batchOf(0, 5) });
    reads = 0;

    // 소비처가 화면 밖 위젯의 조회를 멈췄다가 다시 화면에 들어온 경우처럼 창이 range 넘게 지나갔다.
    chart.createRealTimeScatterDataSet({ s1: batchOf(jump - 2, jump) });
    expect(emptyLogs()).toEqual([]);
    expect(reads).toBeLessThan(range * 10);

    [jump + 1, jump + 2].forEach((sec) => chart.createRealTimeScatterDataSet(boundaryAt(sec)));
    expect(emptyLogs()).toEqual([expect.stringContaining(`빈 초 시작 ${text(jump + 1)}`)]);
  });

  it('열린 공백이 있던 채 데이터가 끊겼다가 다시 오면 마지막으로 본 초까지로 닫아 찍는다', () => {
    const chart = createRtsChart(['s1'], 5);
    chart.createRealTimeScatterDataSet({ s1: batchOf(0, 5) });
    [6, 7, 8].forEach((sec) => chart.createRealTimeScatterDataSet(boundaryAt(sec)));

    chart.createRealTimeScatterDataSet({ s1: batchOf(100, 100) });

    expect(emptyLogs().at(-1)).toContain(
      `빈 초 ${text(6)} ~ ${text(7)} (2초, 그 뒤로 데이터가 오지 않아 기준을 다시 잡음)`,
    );
  });

  it('콘솔에서 켜고 끈 상태가 localStorage 에 남는다', () => {
    delete window.__EVUI_CHART_LOG_EMPTY__;
    inspectorOf(createRtsChart());

    window.__EVUI_CHART__.logEmpty(true);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('1');
    expect(window.__EVUI_CHART__.logEmpty()).toBe(true);

    window.__EVUI_CHART__.logEmpty(false);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(window.__EVUI_CHART__.logEmpty()).toBe(false);
  });

  it.each([
    ['기준을 주고 켜면', [true, { minSeconds: 10 }], '켜져 있음 — 10초 이상 빈 구간만'],
    ['기준 없이 켜면', [true], '켜져 있음 — 모든 빈 초'],
    ['끄면', [false], '꺼져 있음'],
  ])('%s 상태를 물을 때 켜짐 여부와 기준을 한 줄로 알린다', (_, args, state) => {
    inspectorOf(createRtsChart());
    window.__EVUI_CHART__.logEmpty(...args);

    window.__EVUI_CHART__.logEmpty();

    expect(plain(console.log.mock.calls.at(-1)[0])).toContain(`빈 초 로그 ${state}`);
  });

  describe('짧은 공백 거르기(minSeconds)', () => {
    // 3초 이상 빈 구간만 찍도록 켠다.
    const enableMin3 = (chart) => {
      inspectorOf(chart);
      window.__EVUI_CHART__.logEmpty(true, { minSeconds: 3 });
    };

    it('localStorage 에 남긴 기준보다 짧은 공백은 찍지 않고 긴 공백만 찍는다', () => {
      delete window.__EVUI_CHART_LOG_EMPTY__;
      window.localStorage.setItem(STORAGE_KEY, '3');
      const chart = createRtsChart();
      chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300) });

      chart.createRealTimeScatterDataSet({ s1: [...batchOf(301, 301), ...batchOf(304, 310)] });
      chart.createRealTimeScatterDataSet({ s1: [...batchOf(311, 311), ...batchOf(316, 320)] });

      expect(emptyLogs()).toEqual([
        expect.stringContaining(`빈 초 ${text(312)} ~ ${text(315)} (4초)`),
      ]);
    });

    it('열린 공백은 기준에 닿을 때 시작을 찍고, 닫힐 때 구간을 찍는다', () => {
      const chart = createRtsChart();
      enableMin3(chart);
      chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300) });
      [301, 302, 303].forEach((sec) => chart.createRealTimeScatterDataSet(boundaryAt(sec)));
      expect(emptyLogs()).toEqual([]);

      chart.createRealTimeScatterDataSet(boundaryAt(304));
      chart.createRealTimeScatterDataSet({ s1: batchOf(305, 306) });

      expect(emptyLogs()).toEqual([
        expect.stringContaining(`빈 초 시작 ${text(301)}`),
        expect.stringContaining(`빈 초 ${text(301)} ~ ${text(304)} (4초)`),
      ]);
      expect(window.localStorage.getItem(STORAGE_KEY)).toBe('3');
      const announce = console.log.mock.calls
        .map(([m]) => plain(m))
        .find((m) => m.includes('빈 초 로그 켜짐'));
      expect(announce).toContain('3초 이상 빈 구간만');
    });

    it('찍지 않은 짧은 공백이 늦게 채워져도 다음 공백 줄에 알리지 않는다', () => {
      const chart = createRtsChart();
      enableMin3(chart);
      chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300) });
      [301, 302, 303].forEach((sec) => chart.createRealTimeScatterDataSet(boundaryAt(sec)));
      chart.createRealTimeScatterDataSet({
        s1: [
          { x: at(301), y: 1 },
          { x: at(302), y: 1 },
          { x: at(303), y: null },
        ],
      });

      [304, 305, 306].forEach((sec) => chart.createRealTimeScatterDataSet(boundaryAt(sec)));

      expect(emptyLogs()).toEqual([
        expect.stringMatching(new RegExp(`빈 초 시작 ${text(303)} — `)),
      ]);
    });

    it('시작을 찍은 공백은 늦게 채워져 기준보다 짧아져도 닫는 줄을 찍는다', () => {
      const chart = createRtsChart();
      enableMin3(chart);
      chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300) });
      [301, 302, 303, 304].forEach((sec) => chart.createRealTimeScatterDataSet(boundaryAt(sec)));

      chart.createRealTimeScatterDataSet({
        s1: [
          { x: at(301), y: 1 },
          { x: at(302), y: 1 },
          { x: at(305), y: 1 },
          { x: at(306), y: null },
        ],
      });

      expect(emptyLogs().at(-1)).toContain(
        `빈 초 ${text(303)} ~ ${text(304)} (2초, 앞서 찍은 시작 ${text(301)} 은 늦게 채워짐)`,
      );
    });

    it('기준을 다시 잡을 때 찍지 않은 짧은 공백은 닫아 찍지 않는다', () => {
      const chart = createRtsChart();
      enableMin3(chart);
      chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300) });
      [301, 302, 303].forEach((sec) => chart.createRealTimeScatterDataSet(boundaryAt(sec)));

      chart.createRealTimeScatterDataSet({ s1: batchOf(1000, 1000) });

      expect(emptyLogs()).toEqual([]);
    });
  });

  describe('콘솔에서 다시 켜기', () => {
    const announces = () =>
      console.log.mock.calls.map(([m]) => plain(m)).filter((m) => m.includes('빈 초 로그 켜짐'));

    beforeEach(() => {
      delete window.__EVUI_CHART_LOG_EMPTY__;
    });

    it('껐다 다시 켜면 켠 뒤 배치부터 다시 보고, 꺼 둔 동안 지나간 초는 찍지 않는다', () => {
      const chart = createRtsChart(['s1'], 10);
      inspectorOf(chart);
      window.__EVUI_CHART__.logEmpty(true);
      chart.createRealTimeScatterDataSet({ s1: batchOf(0, 10) });

      window.__EVUI_CHART__.logEmpty(false);
      for (let sec = 11; sec <= 40; sec++) {
        chart.createRealTimeScatterDataSet({ s1: batchOf(sec, sec) });
      }
      window.__EVUI_CHART__.logEmpty(true);
      [41, 42].forEach((sec) => chart.createRealTimeScatterDataSet({ s1: batchOf(sec, sec) }));

      expect(emptyLogs()).toEqual([]);
      expect(announces()).toHaveLength(2);
      expect(announces().at(-1)).toContain(`${text(41)} 부터 지나가는 초를 본다`);
    });

    it('이미 켜져 있을 때 다시 켜도 열린 공백을 이어 간다', () => {
      const chart = createRtsChart();
      inspectorOf(chart);
      window.__EVUI_CHART__.logEmpty(true);
      chart.createRealTimeScatterDataSet({ s1: batchOf(0, 300) });
      [301, 302, 303].forEach((sec) => chart.createRealTimeScatterDataSet(boundaryAt(sec)));

      window.__EVUI_CHART__.logEmpty(true);
      chart.createRealTimeScatterDataSet({ s1: batchOf(304, 305) });

      expect(emptyLogs().at(-1)).toContain(`빈 초 ${text(301)} ~ ${text(303)} (3초)`);
      expect(announces()).toHaveLength(1);
    });
  });
});

describe('chart.inspect redraw', () => {
  it('저장소를 다시 채우지 않고 점 레이어를 무효화한 채 render 한다', () => {
    let layerValidAtRender;
    const chart = {
      isInit: true,
      pointsLayerValid: true,
      options: { realTimeScatter: { use: true } },
      update: vi.fn(),
      render: vi.fn(() => {
        layerValidAtRender = chart.pointsLayerValid;
      }),
    };

    inspectorOf(chart).redraw();

    expect(chart.render).toHaveBeenCalledTimes(1);
    expect(layerValidAtRender).toBe(false);
    expect(chart.update).not.toHaveBeenCalled();
  });
});
