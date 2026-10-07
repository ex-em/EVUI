import dayjs from 'dayjs';
import { Console } from '@/common/utils';
import { version } from '../../../package.json';

/**
 * 운영 빌드 콘솔에서 차트 상태를 조회하는 진입점(realTimeScatter 링 보유 데이터·강제 redraw).
 * 상시 기록은 두지 않는다 — 모든 값은 호출할 때 dataSet 에서 계산한다.
 * 진입은 `.ev-chart` 요소의 비열거 속성과, DOM 을 거슬러 그 속성을 찾는 전역 함수뿐이다 —
 * 전역이 차트 참조를 들고 있지 않아 unmount 때 요소 속성만 지우면 참조가 남지 않는다.
 */
const ELEMENT_KEY = '__evuiChart__';
const GLOBAL_KEY = '__EVUI_CHART__';
// 빈 초 자동 로그 스위치. 창마다 window 에 캐시하고, 켜 둔 상태는 localStorage 로 새로고침·새 창에 이어진다.
const LOG_EMPTY_FLAG = '__EVUI_CHART_LOG_EMPTY__';
const LOG_EMPTY_STORAGE_KEY = 'EVUI_CHART_LOG_EMPTY';
const SECOND = 1000;
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const LOG_PREFIX = `[EVUI ${version}]`;

const toSecond = (ms) => Math.floor(ms / SECOND) * SECOND;
const formatTime = (ms) => (Number.isFinite(ms) && ms ? dayjs(ms).format(TIME_FORMAT) : '-');

const parseTime = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isFinite(ms) ? ms : null;
  }
  if (typeof value === 'string') {
    // dayjs 는 'YYYY-MM-DD HH:mm:ss' 를 브라우저 로컬 시각으로 읽는다(축 라벨과 같은 기준).
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.valueOf() : null;
  }
  return null;
};

/**
 * 조회 구간을 초 단위 [from, to] 로 정한다. `to` 는 그 초 전체를 포함한다.
 * 생략한 쪽은 fallback 경계를 쓰고, 해석할 수 없는 값은 경고 후 null — 전체 구간으로 몰래 대체하지 않는다.
 */
const resolveRange = (from, to, fallback) => {
  const resolved = {};
  const pairs = [
    ['from', from],
    ['to', to],
  ];
  for (let i = 0; i < pairs.length; i++) {
    const [name, value] = pairs[i];
    if (value == null) {
      if (!fallback) {
        Console.warn(`${LOG_PREFIX} 저장소에 데이터가 없어 ${name} 를 생략할 수 없다`);
        return null;
      }
      resolved[name] = fallback[name];
    } else {
      const ms = parseTime(value);
      if (ms === null) {
        Console.warn(
          `${LOG_PREFIX} 시각을 해석할 수 없다: ${String(value)} ` +
            "(예: '2026-10-02 10:02:00' 또는 ms 숫자)",
        );
        return null;
      }
      resolved[name] = toSecond(ms);
    }
  }
  if (resolved.from > resolved.to) {
    Console.warn(`${LOG_PREFIX} from 이 to 보다 늦다`);
    return null;
  }
  return resolved;
};

// 렌더 X축 창. 저장소가 배치마다 scatter series minMax 에 쓴 값을 읽어 우측단 규칙을 저장소 한 곳에만 둔다.
const getRenderWindow = (chart) => {
  const id = chart.seriesInfo?.charts?.scatter?.[0];
  const minMax = chart.seriesList?.[id]?.minMax;
  const to = minMax?.maxX?.valueOf();
  return to ? { from: minMax.minX.valueOf(), to } : null;
};

const judgeRange = (range, win) => {
  if (!win) return '저장소 없음';
  if (range.to < win.from || range.from > win.to) return '창 밖';
  if (range.from < win.from || range.to > win.to) return '일부 창 밖';
  return '창 안';
};

const getFrameInfo = (chart) => ({
  mode: chart._lastFrameMode ?? '-',
  lastRasterAt: chart._lastRasterAt ?? 0,
  lastRasterText: formatTime(chart._lastRasterAt),
  framesSinceFullRedraw: chart._framesSinceFullRedraw,
  pointsLayerValid: chart.pointsLayerValid,
});

const MAX_LISTED_VALUES = 5;

// 초별 표의 series 칸. 점이 없으면 null 로 두어 y 가 0 인 점('0')과 구분하고, 많으면 범위로 줄인다.
const formatCellValues = (values) => {
  if (!values.length) {
    return null;
  }
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.length > MAX_LISTED_VALUES
    ? `${sorted[0]} ~ ${sorted.at(-1)} (${sorted.length}개)`
    : sorted.join(', ');
};

// 초별 표의 series 열 이름. 이름이 겹치면 열이 덮어써지므로 겹치는 series 만 id 앞 8자를 붙인다.
const toColumnLabels = (chart, ids) => {
  const names = ids.map((id) => chart.seriesList?.[id]?.name || id);
  const labels = {};
  ids.forEach((id, i) => {
    const isDuplicate = names.indexOf(names[i]) !== names.lastIndexOf(names[i]);
    labels[id] = isDuplicate ? `${names[i]} (${id.slice(0, 8)})` : names[i];
  });
  return labels;
};

// query·queryData 공통 계산(출력 없음). realTimeScatter 가 아니거나 구간을 해석할 수 없으면 경고 후 null.
const collectRealTimeScatter = (chart, from, to) => {
  if (!chart.options?.realTimeScatter?.use) {
    Console.warn(
      `${LOG_PREFIX} realTimeScatter 차트가 아니다 — chart 속성으로 인스턴스를 직접 본다`,
    );
    return null;
  }
  const dataSet = chart.dataSet ?? {};
  const win = getRenderWindow(chart);
  const range = resolveRange(from, to, win);
  if (!range) {
    return null;
  }

  const ids = Object.keys(dataSet);
  const labels = toColumnLabels(chart, ids);
  // 초별 행은 요청 구간과 창이 겹치는 부분만 만든다. 창 밖 초는 링이 보유할 수 없어 0 이 공백 신호가 아니다.
  const rowFrom = win ? Math.max(range.from, win.from) : 0;
  const rowTo = win ? Math.min(range.to, win.to) : -1;
  const rowMap = new Map();
  for (let t = rowFrom; t <= rowTo; t += SECOND) {
    const row = { time: formatTime(t), total: 0 };
    ids.forEach((id) => {
      row[labels[id]] = [];
    });
    rowMap.set(t, row);
  }

  const series = ids.map((id) => {
    const ds = dataSet[id];
    const summary = {
      id,
      name: chart.seriesList?.[id]?.name ?? '',
      window: judgeRange(range, { from: ds.fromTime + SECOND, to: ds.toTime }),
      points: 0,
      stored: 0,
      outOfWindow: 0,
    };
    const groups = ds.dataGroup ?? [];
    for (let i = 0; i < groups.length; i++) {
      const data = groups[i]?.data ?? [];
      for (let j = 0; j < data.length; j++) {
        const p = data[j];
        // y: null 점은 소비자가 축 이동용으로 넣는 조회 경계라 데이터로 세지 않는다.
        if (p.y != null) {
          // 슬롯 위치가 아니라 점 자체의 x 로 센다 — 창 시작 초의 점은 최신 슬롯에 들어간다.
          const sec = toSecond(p.x);
          const row = rowMap.get(sec);
          summary.stored++;
          if (!win || sec < win.from || sec > win.to) {
            summary.outOfWindow++;
          } else if (row) {
            summary.points++;
            row[labels[id]].push(p.y);
            row.total++;
          }
        }
      }
    }
    return summary;
  });

  const store = ids.map((id) => {
    const ds = dataSet[id];
    return {
      id,
      fromTime: ds.fromTime,
      fromText: formatTime(ds.fromTime),
      toTime: ds.toTime,
      toText: formatTime(ds.toTime),
      lastDataTime: ds.lastDataTime,
      lastDataText: formatTime(ds.lastDataTime),
      length: ds.length,
      startIndex: ds.startIndex,
      endIndex: ds.endIndex,
      buckets: ds.dataGroup?.length ?? 0,
      lastTick: ds.lastTick ? { ...ds.lastTick } : null,
    };
  });

  return {
    version,
    request: { ...range, fromText: formatTime(range.from), toText: formatTime(range.to) },
    window: win ? { ...win, fromText: formatTime(win.from), toText: formatTime(win.to) } : null,
    judge: judgeRange(range, win),
    series,
    seconds: [...rowMap.values()].map((row) => {
      ids.forEach((id) => {
        row[labels[id]] = formatCellValues(row[labels[id]]);
      });
      return row;
    }),
    store,
    pruned: [...(chart.prunedRealTimeScatterSeries ?? [])],
    frame: getFrameInfo(chart),
  };
};

const queryRealTimeScatter = (chart, from, to) => {
  const result = collectRealTimeScatter(chart, from, to);
  if (!result) {
    return null;
  }
  Console.log(
    `${LOG_PREFIX} realTimeScatter 조회 ${result.request.fromText} ~ ${result.request.toText} — ` +
      `${result.judge} (창 ${result.window?.fromText ?? '-'} ~ ${result.window?.toText ?? '-'})`,
  );
  Console.table(result.series);
  Console.table(result.seconds);
  Console.table(
    result.store.map(({ lastTick, ...rest }) => ({ ...rest, gapCount: lastTick?.gapCount })),
  );
  Console.log(`${LOG_PREFIX} 만료 series:`, result.pruned, '직전 프레임:', result.frame);
  return result;
};

// 실점이 있는 초만, 그 구간에 점이 있는 series 열만 남긴다.
const queryRealTimeScatterData = (chart, from, to) => {
  const result = collectRealTimeScatter(chart, from, to);
  if (!result) {
    return null;
  }
  const rows = result.seconds.filter((row) => row.total > 0);
  const seriesColumns = Object.keys(result.seconds[0] ?? {}).filter(
    (key) => !['time', 'total'].includes(key),
  );
  const columns = seriesColumns.filter((label) => rows.some((row) => row[label] !== null));
  const seconds = rows.map((row) => {
    const picked = { time: row.time, total: row.total };
    columns.forEach((label) => {
      picked[label] = row[label];
    });
    return picked;
  });
  Console.log(
    `${LOG_PREFIX} realTimeScatter 데이터 있는 초 ${seconds.length}초 / ${result.seconds.length}초 ` +
      `${result.request.fromText} ~ ${result.request.toText} — ${result.judge}`,
  );
  Console.table(seconds);
  return {
    version: result.version,
    request: result.request,
    window: result.window,
    judge: result.judge,
    seconds,
  };
};

const forceRedraw = (chart) => {
  if (!chart.isInit) {
    Console.warn(`${LOG_PREFIX} 초기화되지 않은 차트다`);
    return null;
  }
  // update()·컴포넌트 redraw() 는 마지막 배치를 링에 다시 넣어 조회 대상 저장소를 바꾸므로 render 만 부른다.
  // 점 레이어를 무효화하면 blit 을 건너뛰고 저장소에서 다시 raster 한다.
  chart.pointsLayerValid = false;
  chart.render();
  const frame = getFrameInfo(chart);
  Console.log(`${LOG_PREFIX} 강제 full redraw`, frame);
  return frame;
};

// 찍을 빈 구간의 최소 길이(초). 플래그·localStorage 값이 곧 이 길이다(켬만 한 값 true·'1' 은 1초).
const toMinSeconds = (value) => Math.max(1, Math.floor(Number(value)) || 1);

const readStoredLogEmpty = () => {
  try {
    const value = window.localStorage?.getItem(LOG_EMPTY_STORAGE_KEY);
    return value ? toMinSeconds(value) : false;
  } catch (e) {
    // 저장소 접근이 막힌 환경(사생활 보호 모드 등)은 꺼진 것으로 본다.
    return false;
  }
};

/**
 * realTimeScatter 빈 초 자동 로그가 켜져 있는가. localStorage 는 창마다 처음 한 번만 읽는다.
 * @returns {boolean}
 */
export const isEmptySecondLogOn = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  if (window[LOG_EMPTY_FLAG] === undefined) {
    window[LOG_EMPTY_FLAG] = readStoredLogEmpty();
  }
  return Number(window[LOG_EMPTY_FLAG]) >= 1;
};

const emptyLogMinSeconds = () => toMinSeconds(window[LOG_EMPTY_FLAG]);

// 링 버킷은 초 단위라 그 초의 버킷만 본다. 같은 버킷의 창 시작 초 점(링 최신 슬롯에 놓임)은 x 초로 걸러낸다.
const hasPointAt = (ds, sec) => {
  if (!ds.dataGroup?.length || sec > ds.toTime || sec <= ds.fromTime) {
    return false;
  }
  let index = ds.endIndex - (ds.toTime - sec) / SECOND;
  if (index < 0) {
    index += ds.length;
  }
  const data = ds.dataGroup[index]?.data ?? [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].y != null && toSecond(data[i].x) === sec) {
      return true;
    }
  }
  return false;
};

// 소비자가 붙인 차트 이름(위젯 제목 등). 있으면 줄의 series 목록 대신 이 이름으로 차트를 가른다.
const chartLabelOf = (chart) => chart.options?.realTimeScatter?.label || '';

const describeSeries = (chart, ids) => {
  const names = ids.map((id) => chart.seriesList?.[id]?.name ?? id);
  return names.length > 3
    ? `${names.slice(0, 3).join(', ')} 외 ${names.length - 3}`
    : names.join(', ');
};

const formatSpan = (from, to) => {
  const count = (to - from) / SECOND + 1;
  const range = count > 1 ? `${formatTime(from)} ~ ${formatTime(to)}` : formatTime(from);
  return { range, count };
};

// 빈 초 로그 종류를 색 배지로 가른다(DevTools %c). 흰 글씨 배지라 밝은·어두운 테마 모두에서 읽힌다.
const BADGE = 'color: #fff; border-radius: 3px; padding: 0 4px;';
const BADGE_STYLES = {
  start: `${BADGE} background: #e8590c;`,
  range: `${BADGE} background: #2b8a3e;`,
  late: `${BADGE} background: #1971c2;`,
  on: `${BADGE} background: #495057;`,
};

// 한 화면의 여러 차트를 가르는 번호. 지금 마운트된 차트 중 비어 있는 가장 작은 번호를 주고 언마운트 때 반납한다 —
// 화면 전환으로 차트가 모두 바뀌면 #1 부터 다시 매겨진다. 줄 맨 앞 테두리 배지 색도 번호로 정한다(종류 배지는 채움).
// 번호만 들고 차트 참조는 들지 않는다.
const usedChartNos = new Set();
// 테두리 배지는 글자색 하나로 라이트·다크 콘솔(warn 배경 포함)을 모두 견뎌야 해 중간 밝기만 쓴다 — 양쪽 대비
// 약 3:1 이 한 색으로 낼 수 있는 상한이다. 주황은 `빈 초 시작` 배지와 겹쳐 뺐다.
const CHART_COLORS = [
  '#9775fa',
  '#e64980',
  '#1098ad',
  '#5c940d',
  '#fa5252',
  '#5c7cfa',
  '#cc5de8',
  '#0ca678',
];

const chartNoOf = (chart) => {
  if (chart._inspectNo == null) {
    let no = 1;
    while (usedChartNos.has(no)) {
      no++;
    }
    usedChartNos.add(no);
    chart._inspectNo = no;
  }
  return chart._inspectNo;
};

const chartTagStyle = (no) => {
  const color = CHART_COLORS[(no - 1) % CHART_COLORS.length];
  return `color: ${color}; border: 1px solid ${color}; border-radius: 3px; padding: 0 4px; font-weight: bold;`;
};

const badgeArgs = (chart, kind, label, rest) => {
  const no = chartNoOf(chart);
  const chartLabel = chartLabelOf(chart);
  // 소비자가 배치마다 data 에 넘기는 진단 문자열(예: 요청 lastTime). 이번 저장소 반영의 data 값이다.
  const logInfo = chart.data?.logInfo;
  return [
    `${LOG_PREFIX} realTimeScatter %c차트 #${no}${chartLabel ? ` ${chartLabel}` : ''}%c %c${label}%c ${rest}` +
      `${logInfo ? ` — ${logInfo}` : ''}`,
    chartTagStyle(no),
    '',
    BADGE_STYLES[kind],
    '',
  ];
};

const warnEmptyRange = (chart, from, to, note = '') => {
  const { range, count } = formatSpan(from, to);
  Console.warn(...badgeArgs(chart, 'range', '빈 초', `${range} (${count}초${note})`));
};

const warnEmptyStart = (chart, from, note = '') => {
  Console.warn(
    ...badgeArgs(
      chart,
      'start',
      '빈 초 시작',
      `${formatTime(from)}${note ? ` (${note})` : ''} — 데이터가 다시 들어오면 구간을 한 줄로 ` +
        '찍는다',
    ),
  );
};

// 연속한 초 목록을 [from, to] 구간으로 묶는다.
const toSpans = (secs) => {
  const spans = [];
  [...secs]
    .sort((a, b) => a - b)
    .forEach((sec) => {
      const lastSpan = spans.at(-1);
      if (lastSpan && sec === lastSpan[1] + SECOND) {
        lastSpan[1] = sec;
      } else {
        spans.push([sec, sec]);
      }
    });
  return spans;
};

// 이미 닫힌 구간으로 찍은 빈 초에 점이 늦게 들어왔으면 알린다. 창 밖으로 나간 초는 더 채워질 수 없어 뺀다.
const reportLateFills = (chart, isEmptyAt, winFrom) => {
  const reported = chart._emptyLogReported;
  if (!reported?.size) {
    return;
  }
  const filled = [];
  reported.forEach((sec) => {
    if (sec < winFrom) {
      reported.delete(sec);
    } else if (!isEmptyAt(sec)) {
      filled.push(sec);
      reported.delete(sec);
    }
  });
  toSpans(filled).forEach(([from, to]) => {
    const { range, count } = formatSpan(from, to);
    Console.warn(
      ...badgeArgs(
        chart,
        'late',
        '늦게 채워짐',
        `${range} (${count}초) — 앞서 빈 초로 찍은 초에 데이터가 늦게 들어왔다`,
      ),
    );
  });
};

// 창 밖 초는 더 채워질 수 없어 담지 않는다 — Set 은 크기 상한이 있어 창 크기로 묶어야 한다.
const rememberReported = (chart, from, to, winFrom) => {
  chart._emptyLogReported ??= new Set();
  for (let sec = Math.max(from, winFrom); sec <= to; sec += SECOND) {
    chart._emptyLogReported.add(sec);
  }
};

// 콘솔에서 켤 때마다 올린다. 세대가 다른 차트는 판정 상태를 비워 다시 켠 뒤 배치를 새 기준으로 삼는다 —
// 꺼 둔 동안 창 밖으로 나간 초를 빈 초로 찍지 않게.
let logEmptyGeneration = 0;

/**
 * 저장소 반영 뒤, 마운트 이후 지나간 초(우측단 초 직전까지) 중 모든 series 에 실점이 없는 초를 콘솔에 찍는다.
 * 연속 빈 초는 한 줄로 묶고, 다음 배치로 이어지면 시작을 먼저 찍는다. 우측단은 소비자 경계점(조회 끝 시각)이
 * 데이터보다 앞서 밀 수 있어, 열린 공백은 매 배치 다시 보고 이미 찍은 초가 늦게 채워지면 바로잡는다.
 * @returns {undefined}
 */
export const logEmptySeconds = (chart, winFrom, winTo) => {
  if (chart._emptyLogGeneration !== logEmptyGeneration) {
    chart._emptyLogGeneration = logEmptyGeneration;
    chart._emptyLogCheckedTo = null;
    chart._emptyLogOpenFrom = null;
    chart._emptyLogFilledStart = null;
    chart._emptyLogReported?.clear();
    chart._emptyLogAnnounced = false;
  }
  const dataSet = chart.dataSet ?? {};
  const ids = Object.keys(dataSet);
  const isEmptyAt = (sec) => !ids.some((id) => hasPointAt(dataSet[id], sec));
  // 우측단 초는 아직 점이 들어오는 중이라 다음 배치가 지나갈 때 본다.
  const last = winTo - SECOND;
  const checkedTo = chart._emptyLogCheckedTo;
  // 소비자는 이름(위젯 제목)을 마운트 뒤에 넣거나 바꿀 수 있다 — 켜짐 줄은 마운트 순간의 이름만 알아서 따로 알린다.
  const label = chartLabelOf(chart);
  if (chart._emptyLogAnnounced && label && label !== chart._emptyLogLabel) {
    Console.log(...badgeArgs(chart, 'on', '차트 이름', '— 이후 줄은 이 이름으로 찍는다'));
  }
  chart._emptyLogLabel = label;
  // 데이터 시각으로 우측단이 잡힌 첫 배치(경계점 포함)를 기준으로 삼는다 — 그 배치가 가져온 지난 초의 공백은 이미
  // 있던 것이라 찍지 않는다. 점이 하나도 없는 배치의 우측단은 Date.now() 대체값이라 데이터 시각과 어긋날 수 있다.
  if (checkedTo == null) {
    const hasDataClock = Object.values(dataSet).some((ds) => ds.lastDataTime > 0);
    if (winTo && hasDataClock) {
      chart._emptyLogCheckedTo = last;
    }
    if (!chart._emptyLogAnnounced) {
      chart._emptyLogAnnounced = true;
      const since =
        chart._emptyLogCheckedTo == null
          ? '첫 데이터가 들어오면 그 시각부터 본다'
          : `${formatTime(winTo)} 부터 지나가는 초를 본다`;
      const no = chartNoOf(chart);
      const min = emptyLogMinSeconds();
      const filter = min > 1 ? ` · ${min}초 이상 빈 구간만` : '';
      Console.log(
        ...badgeArgs(
          chart,
          'on',
          '빈 초 로그 켜짐',
          `— ${since}${filter} — 조회: ${GLOBAL_KEY}(${no}).query()`,
        ),
      );
    }
    return;
  }
  if (!winTo) {
    return;
  }
  // 시각이 뒤로 가거나(시계 보정 등), 데이터가 오지 않은 사이 창이 range 넘게 지나가면(소비처가 화면 밖 차트의
  // 조회를 멈춘 경우 등) 직전 판정 다음 초부터 창 시작 전까지는 본 적이 없다 — 빈 초로 찍지 않고 열린 공백만 마지막으로
  // 본 초까지로 닫아 찍은 뒤 이 배치를 새 기준으로 삼는다.
  const minSeconds = emptyLogMinSeconds();
  const spanOf = (from, to) => (to - from) / SECOND + 1;
  const isTimeBack = last < checkedTo;
  if (isTimeBack || checkedTo + SECOND < winFrom) {
    const openFrom = chart._emptyLogOpenFrom;
    if (
      openFrom != null &&
      (chart._emptyLogOpenShown || spanOf(openFrom, checkedTo) >= minSeconds)
    ) {
      const note = isTimeBack
        ? ', 시각이 뒤로 가 기준을 다시 잡음'
        : ', 그 뒤로 데이터가 오지 않아 기준을 다시 잡음';
      warnEmptyRange(chart, openFrom, checkedTo, note);
    }
    chart._emptyLogOpenFrom = null;
    chart._emptyLogFilledStart = null;
    chart._emptyLogReported?.clear();
    chart._emptyLogCheckedTo = last;
    return;
  }

  reportLateFills(chart, isEmptyAt, winFrom);

  // 열린 공백은 시작 초부터 다시 본다. 창 밖으로 나간 초는 더 채워질 수 없어 걷지 않고 빈 채로 확정한다 —
  // 열린 공백이 창보다 길어져도 걷는 범위가 창 크기로 묶인다.
  const openFrom = chart._emptyLogOpenFrom;
  const nextFrom = openFrom ?? checkedTo + SECOND;
  const walkFrom = Math.max(nextFrom, winFrom);
  let runFrom = nextFrom < winFrom ? nextFrom : null;
  let openResolved = openFrom == null;
  // 열린 공백 중 시작 줄을 찍은 것의 시작 초. minSeconds 보다 짧아 아직 찍지 않았으면 null 이다.
  const shownFrom = chart._emptyLogOpenShown ? openFrom : null;
  let shown = false;
  // 시작 줄을 찍은 공백이 늦은 데이터로 모두 채워지면 따로 찍지 않고, 다음 공백 줄에 한 번 알린다.
  let filledStart = chart._emptyLogFilledStart ?? null;
  const filledNote = (from) => `앞서 찍은 시작 ${formatTime(from)} 은 늦게 채워짐`;
  chart._emptyLogCheckedTo = last;

  for (let sec = walkFrom; sec <= last; sec += SECOND) {
    const isEmpty = isEmptyAt(sec);
    if (isEmpty && runFrom === null) {
      runFrom = sec;
      // 직전 판정까지 본 초가 모두 채워진 뒤 새로 비기 시작했다 — 열린 공백의 연속이 아니라 새 공백이다.
      if (!openResolved && sec > checkedTo) {
        if (shownFrom != null) {
          filledStart = shownFrom;
        }
        openResolved = true;
      }
    } else if (!isEmpty && runFrom !== null) {
      const to = sec - SECOND;
      const isShownOpen = !openResolved && shownFrom != null;
      // 짧은 공백은 찍지 않는다. 단 시작 줄을 이미 찍은 공백은 닫는 줄도 찍는다.
      if (isShownOpen || spanOf(runFrom, to) >= minSeconds) {
        let lateStart = filledStart;
        if (isShownOpen) {
          lateStart = runFrom !== shownFrom ? shownFrom : null;
        }
        const note = lateStart == null ? '' : `, ${filledNote(lateStart)}`;
        warnEmptyRange(chart, runFrom, to, note);
        rememberReported(chart, runFrom, to, winFrom);
        filledStart = null;
      }
      openResolved = true;
      runFrom = null;
    }
  }

  if (!openResolved && runFrom === null) {
    if (shownFrom != null) {
      filledStart = shownFrom;
    }
  } else if (!openResolved && shownFrom != null) {
    if (runFrom !== shownFrom) {
      warnEmptyStart(chart, runFrom, filledNote(shownFrom));
    }
    shown = true;
  } else if (runFrom !== null && spanOf(runFrom, last) >= minSeconds) {
    warnEmptyStart(chart, runFrom, filledStart == null ? '' : filledNote(filledStart));
    filledStart = null;
    shown = true;
  }
  chart._emptyLogOpenFrom = runFrom;
  chart._emptyLogOpenShown = shown;
  chart._emptyLogFilledStart = filledStart;
};

// 요소 → 차트 연결. unmount 때 끊는다 — 조회 객체가 차트 대신 이것을 들어, DevTools 가 콘솔 출력으로 쥔
// 조회 객체가 내려간 차트를 붙잡지 않는다.
const chartLinks = new WeakMap();

const createInspector = (link) => {
  const withChart =
    (fn) =>
    (...args) => {
      const chart = link.getChart?.();
      if (!chart) {
        Console.warn(`${LOG_PREFIX} 언마운트된 차트다 — 화면의 차트 목록: ${GLOBAL_KEY}.list()`);
        return null;
      }
      return fn(chart, ...args);
    };
  return {
    get chart() {
      return link.getChart?.() ?? null;
    },
    version,
    query: withChart(queryRealTimeScatter),
    queryData: withChart(queryRealTimeScatterData),
    redraw: withChart(forceRedraw),
  };
};

const findChartElement = (target) => {
  const closest = target?.closest?.('.ev-chart');
  if (closest) {
    return closest;
  }
  const inner = target?.querySelectorAll?.('.ev-chart') ?? [];
  if (inner.length > 1) {
    Console.warn(
      `${LOG_PREFIX} 고른 요소 안에 차트가 ${inner.length}개다 — 차트 안쪽 요소를 고른다`,
    );
  }
  return inner.length === 1 ? inner[0] : null;
};

// 진단 대상은 realTimeScatter 차트뿐이다. 다른 차트는 목록·번호·조회 객체에서 뺀다.
const isRealTimeScatter = (chart) => !!chart?.options?.realTimeScatter?.use;

const chartOf = (element) => chartLinks.get(element)?.getChart?.() ?? null;

// 화면에 조금이라도 걸친 차트. 소비처가 화면 밖 차트의 조회를 멈추는 경우가 많아 목록도 같은 기준으로 보인다.
const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  const height = window.innerHeight || document.documentElement.clientHeight;
  return !(rect.bottom < 0 || rect.top > height);
};

const findChartElementByNo = (no) =>
  [...document.querySelectorAll('.ev-chart')].find(
    (element) => chartOf(element)?._inspectNo === no,
  ) ?? null;

const consoleEntry = (target) => {
  const element =
    typeof target === 'number' ? findChartElementByNo(target) : findChartElement(target);
  const chart = element ? chartOf(element) : null;
  if (chart && !isRealTimeScatter(chart)) {
    Console.warn(`${LOG_PREFIX} realTimeScatter 차트가 아니다 — 대상 목록: ${GLOBAL_KEY}.list()`);
    return null;
  }
  const inspector = element?.[ELEMENT_KEY];
  if (!inspector) {
    Console.warn(
      `${LOG_PREFIX} 차트를 찾지 못했다 — Elements 패널에서 차트 안 요소를 고른 뒤 ` +
        `${GLOBAL_KEY}($0) 또는 로그의 차트 번호로 ${GLOBAL_KEY}(번호). 화면의 차트 목록은 ${GLOBAL_KEY}.list()`,
    );
    return null;
  }
  return inspector;
};

consoleEntry.version = version;

// options.minSeconds: 이 길이(초) 이상인 빈 구간만 찍는다. 기본 1 — 모든 빈 초.
consoleEntry.logEmpty = (on, options) => {
  if (on === undefined) {
    const isOn = isEmptySecondLogOn();
    const min = emptyLogMinSeconds();
    const scope = min > 1 ? `${min}초 이상 빈 구간만` : '모든 빈 초';
    Console.log(
      `${LOG_PREFIX} realTimeScatter 빈 초 로그 ${isOn ? `켜져 있음 — ${scope}` : '꺼져 있음'}`,
    );
    return isOn;
  }
  // 이미 켜져 있을 때 다시 켜면 열린 공백(시작 줄만 찍힌 것)을 지우지 않도록 꺼짐 → 켜짐일 때만 올린다.
  if (on && !isEmptySecondLogOn()) {
    logEmptyGeneration += 1;
  }
  const minSeconds = toMinSeconds(options?.minSeconds);
  window[LOG_EMPTY_FLAG] = on ? minSeconds : false;
  try {
    if (on) {
      window.localStorage.setItem(LOG_EMPTY_STORAGE_KEY, String(minSeconds));
    } else {
      window.localStorage.removeItem(LOG_EMPTY_STORAGE_KEY);
    }
  } catch (e) {
    Console.warn(`${LOG_PREFIX} localStorage 를 쓸 수 없어 이 창에서만 적용된다`);
  }
  const state = on ? `켬${minSeconds > 1 ? ` (${minSeconds}초 이상 빈 구간만)` : ''}` : '끔';
  Console.log(
    `${LOG_PREFIX} realTimeScatter 빈 초 로그 ${state} — 이미 열린 다른 창은 새로고침해야 반영된다`,
  );
  return !!on;
};

consoleEntry.list = () => {
  const rows = [...document.querySelectorAll('.ev-chart')]
    .filter(isInViewport)
    .map(chartOf)
    .filter(isRealTimeScatter)
    .map((chart) => ({
      no: chartNoOf(chart),
      title: chartLabelOf(chart),
      series: describeSeries(chart, Object.keys(chart.seriesList ?? {})),
    }));
  // 행에 요소를 넣지 않는다 — 콘솔에 남은 반환값이 내려간 차트의 DOM 을 붙잡는다. 차트로는 번호로 들어간다.
  Console.table(rows);
  return rows;
};

/**
 * `.ev-chart` 요소에 조회 진입점을 단다. getter 라 부착 비용은 defineProperty 1회이고 접근 시점의 인스턴스를 읽는다.
 * @param {HTMLElement} element
 * @param {Function} getChart  현재 EvChart 인스턴스를 돌려준다
 * @returns {undefined}
 */
export const attachInspector = (element, getChart) => {
  if (!element) {
    return;
  }
  const link = { getChart };
  chartLinks.set(element, link);
  Object.defineProperty(element, ELEMENT_KEY, {
    configurable: true,
    enumerable: false,
    get: () => (isRealTimeScatter(getChart()) ? createInspector(link) : null),
  });
  const chart = getChart();
  if (isRealTimeScatter(chart)) {
    chartNoOf(chart);
  }
  if (typeof window !== 'undefined' && !window[GLOBAL_KEY]) {
    window[GLOBAL_KEY] = consoleEntry;
  }
};

/**
 * 요소에서 진입점을 지우고 차트 번호를 반납한다. DevTools `$0` 이 떨어진 요소나 콘솔에 남은 조회 객체가 있어도
 * 인스턴스가 남지 않게 destroy 전에 부른다.
 * @param {HTMLElement} element
 * @returns {undefined}
 */
export const detachInspector = (element) => {
  if (element) {
    // 진단 대상에서 빠진 뒤(realTimeScatter 를 끈 차트)에도 받은 번호는 반납해야 해 요소 getter 대신 연결로 읽는다.
    const no = chartOf(element)?._inspectNo;
    if (no != null) {
      usedChartNos.delete(no);
    }
    const link = chartLinks.get(element);
    if (link) {
      link.getChart = null;
      chartLinks.delete(element);
    }
    delete element[ELEMENT_KEY];
  }
};
