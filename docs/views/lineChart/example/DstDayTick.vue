<template>
  <div class="case dst-cases">
    <div v-for="scenario in scenarios" :key="scenario.key" class="dst-case">
      <div class="dst-case__head">
        <strong>{{ scenario.name }}</strong>
        <span>결함: {{ scenario.note }}</span>
      </div>
      <resizable-wrapper height="180px">
        <ev-chart :data="scenario.chartData" :options="scenario.chartOptions" />
      </resizable-wrapper>
    </div>
  </div>

  <div class="description">
    <div class="section">
      <h3 class="section-title">브라우저 타임존</h3>
      <div class="section-body section-body--col">
        <div class="section-item">
          <label>timeZone</label>
          <strong>{{ tzInfo.zone }}</strong>
        </div>
        <div class="section-item">
          <label>UTC offset</label>
          <span>1월 {{ tzInfo.january }} / 7월 {{ tzInfo.july }}</span>
        </div>
        <div class="section-item">
          <label>DST 관측</label>
          <strong>{{ tzInfo.observesDst ? 'YES' : 'NO' }}</strong>
        </div>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">기대</h3>
      <div class="section-body section-body--col">
        <div class="section-item">
          모든 차트의 x축 tick 은 전 구간 <strong>00:00</strong> 이어야 한다.
        </div>
        <div class="section-item">
          DST 미관측 존(<code>Asia/Seoul</code>·<code>UTC</code>)에서는 재현되지 않는다.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs';

/**
 * time 축 day 틱의 DST 앵커 결함 재현용 임시 예시 (ex-em/EVUI#2334).
 * timeFormat 에 시각을 넣어야 밀린 tick 이 보이므로 'MM-DD HH:mm' 을 쓴다.
 * 전환일은 US/멕시코 북부 국경(3월 2주차 일요일 / 11월 1주차 일요일) 기준이다.
 */
const SCENARIOS = [
  {
    key: 'spring',
    name: '봄 전환 포함 (03-05 ~ 03-12)',
    from: '2026-03-05 00:00:00',
    to: '2026-03-12 00:00:00',
    interval: 'day',
    note: '전환(03-08) 이후 tick 이 01:00 으로 밀린다.',
  },
  {
    key: 'fall',
    name: '가을 전환 포함 (10-29 ~ 11-05)',
    from: '2026-10-29 00:00:00',
    to: '2026-11-05 00:00:00',
    interval: 'day',
    note: '전환(11-01) 이전 tick 이 01:00 으로 밀린다.',
  },
  {
    key: 'dstOnly',
    name: 'DST 구간 전체 (06-01 ~ 06-09, 전환 미포함)',
    from: '2026-06-01 00:00:00',
    to: '2026-06-09 00:00:00',
    interval: 'day',
    note: '구간 안에 전환이 없어도 연초 앵커와 offset 이 달라 전 구간이 밀린다.',
  },
  {
    key: 'month',
    name: '31일 조회 (02-20 ~ 03-23, 봄 전환 포함)',
    from: '2026-02-20 00:00:00',
    to: '2026-03-23 00:00:00',
    interval: 'day',
    note: '실사용 형태. 전환일을 기점으로 00:00 → 01:00 으로 바뀐다.',
  },
  {
    key: 'day8',
    name: '8일 간격 ({ time: 8, unit: day })',
    from: '2026-02-20 00:00:00',
    to: '2026-03-23 00:00:00',
    interval: { time: 8, unit: 'day' },
    note: '다일 간격도 전환 이후 01:00 으로 밀린다.',
  },
];

const buildChartData = ({ from, to }) => {
  const end = dayjs(to);
  const labels = [];
  const values = [];
  for (let cursor = dayjs(from); !cursor.isAfter(end); cursor = cursor.add(1, 'hour')) {
    labels.push(cursor);
    values.push(50 + Math.round(30 * Math.sin(labels.length / 12)));
  }
  return { series: { series1: { name: 'value' } }, labels, data: { series1: values } };
};

const buildChartOptions = ({ interval }) => ({
  type: 'line',
  width: '100%',
  legend: { show: false },
  axesX: [{ type: 'time', showGrid: true, timeFormat: 'MM-DD HH:mm', interval }],
  axesY: [{ type: 'linear', showGrid: true, startToZero: true }],
});

const formatOffset = (minutes) => {
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');
  return `${sign}${hh}:${mm}`;
};

export default {
  setup() {
    const scenarios = SCENARIOS.map((scenario) => ({
      ...scenario,
      chartData: buildChartData(scenario),
      chartOptions: buildChartOptions(scenario),
    }));

    const januaryOffset = -new Date(2026, 0, 1).getTimezoneOffset();
    const julyOffset = -new Date(2026, 6, 1).getTimezoneOffset();
    const tzInfo = {
      zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      january: formatOffset(januaryOffset),
      july: formatOffset(julyOffset),
      observesDst: januaryOffset !== julyOffset,
    };

    return { scenarios, tzInfo };
  },
};
</script>

<style lang="scss">
.dst-cases {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dst-case__head {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 0 4px;
  font-size: 12px;

  span {
    opacity: 0.7;
  }
}
</style>
