<template>
  <aside
    class="apidoc-tryit"
    :class="{ 'is-open': !!node, 'is-resizing': isResizing }"
    :style="panelStyle"
  >
    <template v-if="node">
      <div class="apidoc-tryit-resize-handle" @mousedown="startResize" />
      <header class="apidoc-tryit-header">
        <div class="apidoc-tryit-title">
          <span class="apidoc-badge" :class="`apidoc-badge-kind-${node.kind}`">{{ node.kind }}</span>
          <code class="apidoc-tryit-path">{{ node.path }}</code>
        </div>
        <button class="apidoc-tryit-close" title="닫기" @click="store.closeTryIt()">✕</button>
      </header>

      <div v-if="playground" class="apidoc-tryit-body">
        <!-- 라이브 미리보기 -->
        <div class="apidoc-tryit-live">
          <!-- 시딩 단계: 예제 컴포넌트를 잠시 렌더링해 초기 chartData/chartOptions 추출 -->
          <component :is="playground.component" v-if="!seeded" ref="pgCompRef" />
          <!-- 시딩 후: 패널 소유 컴포넌트(playground.tag) — 문서의 Events 섹션 기반 리스너 연결 -->
          <div v-else class="apidoc-tryit-chart">
            <component
              :is="playground.tag"
              :data="liveData"
              :options="liveOptions"
              v-on="chartListeners"
            />
          </div>
        </div>

        <!-- 에디터/이벤트 영역 -->
        <div class="apidoc-tryit-editor">
          <div class="apidoc-tryit-editor-tabs">
            <button
              v-for="tab in EDITOR_TABS"
              :key="tab.key"
              class="apidoc-tryit-editor-tab"
              :class="{ 'is-active': editorTab === tab.key }"
              @click="editorTab = tab.key"
            >
              {{ tab.label }}
              <span v-if="tab.key === 'events' && eventLog.length" class="apidoc-tryit-event-count">
                {{ eventLog.length }}
              </span>
            </button>
          </div>

          <ChartPlaygroundEditor
            v-if="editorReady && editorTab === 'data'"
            :key="`data-${node.id}`"
            :model-value="snapshotData"
            :focus-path="dataFocus"
            @apply="applyData"
          />
          <ChartPlaygroundEditor
            v-if="editorReady && editorTab === 'options'"
            :key="`options-${node.id}`"
            :model-value="snapshotOptions"
            :focus-path="optionsFocus"
            @apply="applyOptions"
          />

          <!-- Events 콘솔 -->
          <div v-show="editorTab === 'events'" class="apidoc-tryit-console">
            <div class="apidoc-tryit-console-bar">
              <span class="apidoc-tryit-console-info">
                connected: <code>{{ eventNames.join(', ') || '없음' }}</code>
              </span>
              <button class="apidoc-tryit-console-clear" @click="clearLog">Clear</button>
            </div>
            <div ref="consoleRef" class="apidoc-tryit-console-body">
              <p v-if="!eventLog.length" class="apidoc-tryit-console-empty">
                차트를 클릭·드래그하면 이벤트 로그가 여기에 출력됩니다.
              </p>
              <div v-for="entry in eventLog" :key="entry.seq" class="apidoc-tryit-console-line">
                <span class="apidoc-tryit-console-time">{{ entry.time }}</span>
                <span class="apidoc-tryit-console-name">{{ entry.name }}</span>
                <span class="apidoc-tryit-console-payload">{{ entry.payload }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p v-else class="apidoc-empty">
        이 컴포넌트는 아직 플레이그라운드 예제가 등록되지 않았습니다.<br />
        (JSON 문서의 playground 필드로 지정합니다)
      </p>
    </template>
  </aside>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import dayjs from 'dayjs';
import ChartPlaygroundEditor from 'docs/components/ChartPlaygroundEditor';
import { useApiDocsStore } from '../composables/useApiDocsStore';

// --- 노드별 tryIt 스니펫 (부분 오버라이드) ------------------------------------
// JSON의 tryIt.data / tryIt.options는 JS 리터럴 문자열 — 함수·dayjs 사용 가능
const evaluateSnippet = (code) => {
  // eslint-disable-next-line no-new-func
  const fn = new Function('dayjs', `return (\n${code}\n)`);
  return fn(dayjs);
};

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** base 위에 override를 깊은 병합 (원본 불변, 배열/원시값은 교체) */
const deepMerge = (base, override) => {
  if (!isPlainObject(base) || !isPlainObject(override)) return override;
  const result = { ...base };
  Object.keys(override).forEach((key) => {
    result[key] = deepMerge(base[key], override[key]);
  });
  return result;
};

const EDITOR_TABS = [
  { key: 'data', label: 'chartData' },
  { key: 'options', label: 'chartOptions' },
  { key: 'events', label: 'Events' },
];
const MAX_LOG = 200;

const store = useApiDocsStore();

const node = computed(() => store.tryItNode.value);
const playground = computed(() => store.playgroundExample.value);

const pgCompRef = ref(null);
const seeded = ref(false);
const liveData = ref(null);
const liveOptions = ref(null);

const editorTab = ref('options');
const editorReady = ref(false);
const snapshotData = ref(null);
const snapshotOptions = ref(null);

// --- 이벤트 로그 (console 느낌) ---------------------------------------------
const eventLog = ref([]);
const consoleRef = ref(null);
let logSeq = 0;
// 고빈도 이벤트는 콘솔 도배 방지를 위해 스로틀링해 기록한다
const HIGH_FREQ_EVENTS = new Set(['mouse-move']);
const HIGH_FREQ_THROTTLE_MS = 400;
const lastLogAt = {};

/** 문서 Events 섹션의 최상위 이벤트명 → 차트 리스너 자동 연결 대상 */
const eventNames = computed(() =>
  store.flatNodes.value
    .filter((n) => n.kind === 'events' && n.depth === 0)
    .map((n) => n.name));

const formatPayload = (args) => {
  if (!args.length) return '';
  const seen = new WeakSet();
  const replacer = (key, value) => {
    if (typeof value === 'function') return 'ƒ()';
    if (typeof Event !== 'undefined' && value instanceof Event) {
      return `[${value.constructor.name}]`;
    }
    if (typeof Node !== 'undefined' && value instanceof Node) {
      return `[<${value.nodeName.toLowerCase()}>]`;
    }
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    return value;
  };
  try {
    const text = args
      .map((arg) => (arg === undefined ? 'undefined' : JSON.stringify(arg, replacer)))
      .join(', ');
    return text.length > 400 ? `${text.slice(0, 400)}…` : text;
  } catch (e) {
    return '[unserializable]';
  }
};

const logEvent = (name, args) => {
  if (HIGH_FREQ_EVENTS.has(name)) {
    const now = Date.now();
    if (lastLogAt[name] && now - lastLogAt[name] < HIGH_FREQ_THROTTLE_MS) return;
    lastLogAt[name] = now;
  }
  logSeq += 1;
  eventLog.value.push({
    seq: logSeq,
    time: new Date().toLocaleTimeString('en-GB'),
    name,
    payload: formatPayload(args),
  });
  if (eventLog.value.length > MAX_LOG) {
    eventLog.value.splice(0, eventLog.value.length - MAX_LOG);
  }
};

const clearLog = () => {
  eventLog.value = [];
};

// 새 로그가 쌓이면 콘솔을 맨 아래로
watch(
  () => eventLog.value.length,
  async () => {
    await nextTick();
    const el = consoleRef.value;
    if (el) el.scrollTop = el.scrollHeight;
  },
);

const chartListeners = computed(() => {
  const handlers = {};
  eventNames.value.forEach((name) => {
    handlers[name] = (...args) => logEvent(name, args);
  });
  return handlers;
});

// --- 에디터 포커스 경로 ------------------------------------------------------
const focusSegments = computed(() => {
  if (!node.value || node.value.kind !== 'props') return null;
  const segments = node.value.path.split('.');
  return segments.length > 1 ? segments.slice(1) : null;
});
const dataFocus = computed(() =>
  (node.value?.path.startsWith('data') ? focusSegments.value : null));
const optionsFocus = computed(() =>
  (node.value?.path.startsWith('options') ? focusSegments.value : null));

// --- 시딩 & 노드 전환 --------------------------------------------------------
// 예제 컴포넌트에서 초기 상태를 한 번 시딩한 뒤 패널 소유 ev-chart로 교체하고,
// 노드가 바뀌면 현재 라이브 상태를 스냅샷해 에디터를 다시 연다.
watch(
  [node, pgCompRef],
  async ([n]) => {
    if (!n || !playground.value) return;
    editorReady.value = false;
    await nextTick();
    if (!seeded.value) {
      const comp = pgCompRef.value;
      if (!comp) return;
      liveData.value = comp.chartData;
      liveOptions.value = comp.chartOptions;
      seeded.value = true;
      await nextTick();
    }
    // 노드에 tryIt 스니펫이 있으면 현재 상태 위에 병합한 코드를 에디터에 보여준다
    // (차트에는 아직 미적용 — Apply를 눌러야 반영)
    let mergedData = liveData.value;
    let mergedOptions = liveOptions.value;
    if (n.tryIt) {
      try {
        if (n.tryIt.data) {
          mergedData = deepMerge(liveData.value, evaluateSnippet(n.tryIt.data));
        }
        if (n.tryIt.options) {
          mergedOptions = deepMerge(liveOptions.value, evaluateSnippet(n.tryIt.options));
        }
      } catch (err) {
        // 스니펫 오류 시 기본(현재 상태) 코드로 폴백
        console.warn(`[api-docs] tryIt 스니펫 평가 실패 (${n.path}):`, err);
      }
    }
    snapshotData.value = mergedData;
    snapshotOptions.value = mergedOptions;

    if (n.kind === 'events') {
      editorTab.value = 'events';
    } else if (n.tryIt?.data && !n.tryIt?.options) {
      editorTab.value = 'data';
    } else if (n.tryIt?.options) {
      editorTab.value = 'options';
    } else {
      editorTab.value = n.path.startsWith('data') ? 'data' : 'options';
    }
    editorReady.value = true;
  },
  { immediate: true },
);

// 컴포넌트 문서 전환 시 시딩/로그 초기화
watch(
  () => store.currentKey.value,
  () => {
    seeded.value = false;
    liveData.value = null;
    liveOptions.value = null;
    eventLog.value = [];
  },
);

const applyData = (value) => {
  liveData.value = value;
};
const applyOptions = (value) => {
  liveOptions.value = value;
};

// --- 패널 너비 리사이즈 ------------------------------------------------------
const WIDTH_STORAGE_KEY = 'evui-docs-tryit-width';
const DEFAULT_WIDTH = 500;
const MIN_WIDTH = 340;
const maxWidth = () => Math.round(window.innerWidth * 0.7);
const clampWidth = (width) => Math.min(Math.max(width, MIN_WIDTH), maxWidth());

const panelWidth = ref(
  clampWidth(Number(localStorage.getItem(WIDTH_STORAGE_KEY)) || DEFAULT_WIDTH),
);
const isResizing = ref(false);

// width는 오버레이(absolute) 모드용, flex-basis는 3-column 플렉스 모드용
const panelStyle = computed(() =>
  (node.value ? { flexBasis: `${panelWidth.value}px`, width: `${panelWidth.value}px` } : null));

const startResize = (e) => {
  e.preventDefault();
  isResizing.value = true;
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';

  const onMouseMove = (ev) => {
    // 패널 오른쪽 끝은 뷰포트 오른쪽에 붙어 있으므로 너비 = 뷰포트 너비 - 커서 X
    panelWidth.value = clampWidth(window.innerWidth - ev.clientX);
  };
  const onMouseUp = () => {
    isResizing.value = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    localStorage.setItem(WIDTH_STORAGE_KEY, String(panelWidth.value));
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};
</script>
