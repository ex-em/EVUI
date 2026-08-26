<template>
  <div class="playground-editor">
    <div ref="editorEl" class="playground-editor__cm" />
    <div class="playground-editor__toolbar">
      <button
        class="playground-editor__btn playground-editor__btn--apply"
        @click="applyChanges"
      >
        Apply
      </button>
      <button
        class="playground-editor__btn playground-editor__btn--reset"
        @click="resetChanges"
      >
        Reset
      </button>
    </div>
    <p v-if="error" class="playground-editor__error">
      {{ error }}
    </p>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import dayjs from 'dayjs';

const isPlainObject = (v) => (
  v !== null && typeof v === 'object' && !Array.isArray(v)
);

/** 들여쓰기 차이를 무시하고 함수 본문을 비교하기 위한 키 */
const normalizeFnSource = (src) => src.replace(/\s+/g, ' ').trim();

/* ------------------------------------------------------------------ *
 * 예제 원문에서 함수 소스 추출
 *
 * Function.prototype.toString 은 번들러가 남긴 코드를 그대로 돌려준다.
 * 프로덕션 빌드는 모듈 스코프 식별자를 압축하므로(dayjs → ie 등) 그대로
 * 보여주면 읽을 수도 고칠 수도 없다. 예제 .vue 원문(?raw)에서 같은 자리의
 * 함수 소스를 찾아 에디터에 보여준다.
 * ------------------------------------------------------------------ */

const OPENERS = '([{';
const CLOSERS = ')]}';

const isTokenStart = (src, i) => {
  const c = src[i];
  return c === '"' || c === "'" || c === '`'
    || (c === '/' && (src[i + 1] === '/' || src[i + 1] === '*'));
};

/** src[i] 에서 시작하는 문자열/템플릿/주석을 건너뛴 다음 인덱스 */
const skipToken = (src, i) => {
  const c = src[i];
  if (c === '/' && src[i + 1] === '/') {
    const end = src.indexOf('\n', i);
    return end < 0 ? src.length : end;
  }
  if (c === '/' && src[i + 1] === '*') {
    const end = src.indexOf('*/', i + 2);
    return end < 0 ? src.length : end + 2;
  }
  let j = i + 1;
  while (j < src.length) {
    if (src[j] === '\\') {
      j += 2;
    } else if (src[j] === c) {
      return j + 1;
    } else if (c === '`' && src[j] === '$' && src[j + 1] === '{') {
      // eslint-disable-next-line no-use-before-define
      j = scanBalanced(src, j + 1);
    } else {
      j += 1;
    }
  }
  return src.length;
};

/** src[start] 의 여는 괄호와 짝이 맞는 닫는 괄호 바로 다음 인덱스 */
const scanBalanced = (src, start) => {
  let depth = 0;
  let j = start;
  while (j < src.length) {
    if (isTokenStart(src, j)) {
      j = skipToken(src, j);
    } else if (OPENERS.includes(src[j])) {
      depth += 1;
      j += 1;
    } else if (CLOSERS.includes(src[j])) {
      depth -= 1;
      j += 1;
      if (depth === 0) return j;
    } else {
      j += 1;
    }
  }
  return src.length;
};

/** 값 하나가 끝나는 위치 — 깊이 0 에서 만나는 `,` 또는 닫는 괄호 */
const readValueEnd = (src, i) => {
  let depth = 0;
  let j = i;
  while (j < src.length) {
    if (isTokenStart(src, j)) {
      j = skipToken(src, j);
    } else if (OPENERS.includes(src[j])) {
      depth += 1;
      j += 1;
    } else if (CLOSERS.includes(src[j])) {
      if (depth === 0) return j;
      depth -= 1;
      j += 1;
    } else if (src[j] === ',' && depth === 0) {
      return j;
    } else {
      j += 1;
    }
  }
  return src.length;
};

const FN_HEAD = /^(async\s+)?(function\b|\(|[A-Za-z_$][\w$]*\s*=>)/;

/** 값 위치 i 가 함수 리터럴이면 그 소스 텍스트, 아니면 null */
const readFunctionAt = (src, i) => {
  const text = src.slice(i, readValueEnd(src, i)).trim();
  if (!FN_HEAD.test(text)) return null;
  // `(a + b)` 처럼 괄호로 시작할 뿐인 표현식은 제외
  if (!text.includes('=>') && !/^(async\s+)?function\b/.test(text)) return null;
  try {
    // 실행하지 않고 구문만 검증한다 — 생성자 호출 시점에 컴파일된다
    // eslint-disable-next-line no-new, no-new-func
    new Function(`return (\n${text}\n)`);
  } catch {
    return null;
  }
  return text;
};

const KEY_RE = /([A-Za-z_$][\w$]*)\s*:\s*/y;

/** 블록 안의 함수형 프로퍼티를 키 이름별로 등장 순서대로 모은다 */
const collectRawFunctions = (block) => {
  const found = new Map();
  let j = 0;
  while (j < block.length) {
    if (isTokenStart(block, j)) {
      j = skipToken(block, j);
      // eslint-disable-next-line no-continue
      continue;
    }
    KEY_RE.lastIndex = j;
    const matched = KEY_RE.exec(block);
    // 식별자 중간이나 `.` 뒤에서 잘못 걸리지 않게 앞 글자를 확인한다
    const atKeyStart = matched && (j === 0 || !/[\w$.]/.test(block[j - 1]));
    const fnSrc = atKeyStart
      ? readFunctionAt(block, j + matched[0].length)
      : null;
    if (fnSrc) {
      const list = found.get(matched[1]) ?? [];
      list.push(fnSrc);
      found.set(matched[1], list);
      j += matched[0].length + fnSrc.length;
    } else {
      j += 1;
    }
  }
  return found;
};

/** 원문에서 `<varName> = ref(...)` 의 인자 블록을 잘라낸다 */
const extractRefBlock = (script, varName) => {
  const matched = new RegExp(`\\b${varName}\\s*=\\s*ref\\s*\\(`).exec(script);
  if (!matched) return null;
  const open = matched.index + matched[0].length - 1;
  return script.slice(open + 1, scanBalanced(script, open) - 1);
};

/** 실제 객체에 들어 있는 함수 개수를 키 이름별로 센다 */
const countFunctionKeys = (node, counts = new Map()) => {
  if (!node || typeof node !== 'object' || node.$isDayjsObject) return counts;
  const isArray = Array.isArray(node);
  const keys = isArray ? node.map((_, i) => i) : Object.keys(node);
  keys.forEach((key) => {
    const child = node[key];
    if (typeof child === 'function') {
      if (!isArray) counts.set(key, (counts.get(key) ?? 0) + 1);
    } else {
      countFunctionKeys(child, counts);
    }
  });
  return counts;
};

/**
 * 키 이름 → 원문 함수 소스 배열. 원문과 실제 객체의 함수 개수가 정확히
 * 일치하는 키만 쓴다 — 어긋난 채로 순서만 맞추면 엉뚱한 소스가 붙는다.
 */
const buildRawFnMap = (rawScript, sourceVar, model) => {
  if (!rawScript || !/^[A-Za-z_$][\w$]*$/.test(sourceVar)) return null;
  const block = extractRefBlock(rawScript, sourceVar);
  if (!block) return null;
  const live = countFunctionKeys(model);
  const usable = new Map();
  collectRawFunctions(block).forEach((list, key) => {
    if (live.get(key) === list.length) usable.set(key, list);
  });
  return usable.size ? usable : null;
};

/** 해당 키의 다음 원문 함수 소스를 하나 꺼낸다 */
const takeRawFnSource = (ctx, key) => {
  const list = key ? ctx?.rawFns?.get(key) : null;
  if (!list) return null;
  const used = ctx.counters.get(key) ?? 0;
  ctx.counters.set(key, used + 1);
  return list[used] ?? null;
};

const toJSLiteral = (value, indent = 0, ctx = null, key = null) => {
  const pad = ' '.repeat(indent);
  const inner = ' '.repeat(indent + 2);

  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'null';
  }
  if (typeof value === 'string') return JSON.stringify(value);

  if (typeof value === 'function') {
    const raw = takeRawFnSource(ctx, key);
    const src = raw ?? value.toString();
    // 압축본과 원문 양쪽을 등록해 둔다 — 어느 쪽이 에디터에 실렸든
    // 사용자가 손대지 않았다면 원본 참조로 되돌릴 수 있어야 한다.
    ctx?.fnRegistry?.set(normalizeFnSource(value.toString()), value);
    if (raw) ctx?.fnRegistry?.set(normalizeFnSource(raw), value);
    const lines = src.split('\n');
    if (lines.length <= 1) return src;
    const rest = lines.slice(1);
    const nonEmpty = rest.filter((l) => l.trim());
    const min = nonEmpty.length
      ? Math.min(...nonEmpty.map((l) => l.search(/\S/)))
      : 0;
    return [
      lines[0],
      ...rest.map((l) => (l.trim() ? pad + l.slice(min) : '')),
    ].join('\n');
  }

  if (value?.$isDayjsObject) {
    return `dayjs("${value.format('YYYY-MM-DD HH:mm:ss')}")`;
  }

  if (Array.isArray(value)) {
    if (!value.length) return '[]';
    const items = value.map(
      (v) => `${inner}${toJSLiteral(v, indent + 2, ctx, key)}`,
    );
    return `[\n${items.join(',\n')},\n${pad}]`;
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    if (!entries.length) return '{}';
    const rows = entries.map(([k, v]) => {
      const label = /^[a-zA-Z_$]\w*$/.test(k)
        ? k
        : JSON.stringify(k);
      return `${inner}${label}: ${toJSLiteral(v, indent + 2, ctx, k)}`;
    });
    return `{\n${rows.join(',\n')},\n${pad}}`;
  }

  return String(value);
};

/**
 * new Function 으로 재평가된 함수는 원본의 클로저를 잃는다. 프로덕션 번들은
 * 모듈 스코프 식별자를 압축하므로(dayjs → ie 등) 재평가된 본문이 참조하는
 * 자유 변수가 ReferenceError 를 낸다. 사용자가 손대지 않은 함수는 원본 참조로
 * 되돌려 클로저를 보존한다 — 편집된 함수는 그대로 두어 evaluate 스코프
 * (dayjs) 로 동작하게 한다.
 */
const restoreFunctions = (node, fnRegistry) => {
  if (!node || typeof node !== 'object' || node.$isDayjsObject) return;
  const keys = Array.isArray(node)
    ? node.map((_, i) => i)
    : Object.keys(node);
  keys.forEach((key) => {
    const child = node[key];
    if (typeof child === 'function') {
      const original = fnRegistry.get(normalizeFnSource(child.toString()));
      if (original) node[key] = original;
    } else {
      restoreFunctions(child, fnRegistry);
    }
  });
};

const evaluate = (code, fnRegistry) => {
  // eslint-disable-next-line no-new-func
  const fn = new Function('dayjs', `return (\n${code}\n)`);
  const result = fn(dayjs);
  if (typeof result === 'function') {
    return fnRegistry.get(normalizeFnSource(result.toString())) ?? result;
  }
  restoreFunctions(result, fnRegistry);
  return result;
};

export default {
  name: 'ChartPlaygroundEditor',
  props: {
    modelValue: {
      type: Object,
      default: null,
    },
    /** 마운트 시 커서를 이동할 키 경로 (예: ['legend', 'position']) */
    focusPath: {
      type: Array,
      default: null,
    },
    /** 예제 .vue 의 <script> 원문 — 함수 값을 원본 소스로 보여주는 데 쓴다 */
    rawScript: {
      type: String,
      default: '',
    },
    /** 원문에서 찾을 변수 이름 (예: 'chartOptions') */
    sourceVar: {
      type: String,
      default: '',
    },
  },
  emits: ['apply'],
  setup(props, { emit }) {
    const editorEl = ref(null);
    const error = ref('');
    let view = null;
    let initialJS = '';
    /** 직렬화된 원본 함수: 정규화된 소스 → 원본 참조 */
    const fnRegistry = new Map();

    onMounted(() => {
      if (!props.modelValue) return;
      initialJS = toJSLiteral(props.modelValue, 0, {
        fnRegistry,
        rawFns: buildRawFnMap(props.rawScript, props.sourceVar, props.modelValue),
        counters: new Map(),
      });
      view = new EditorView({
        state: EditorState.create({
          doc: initialJS,
          extensions: [
            basicSetup,
            javascript(),
            EditorView.lineWrapping,
            EditorView.theme({
              '&': { fontSize: '13px', height: '100%' },
              '.cm-scroller': {
                overflow: 'auto',
              },
            }),
          ],
        }),
        parent: editorEl.value,
      });

      // focusPath 순서대로 키를 찾아 해당 위치로 커서 이동 + 스크롤
      if (props.focusPath?.length) {
        let pos = 0;
        let found = true;
        props.focusPath.forEach((seg) => {
          if (!found) return;
          let idx = initialJS.indexOf(`${seg}:`, pos);
          if (idx < 0) idx = initialJS.indexOf(`"${seg}":`, pos);
          if (idx < 0) {
            found = false;
            return;
          }
          pos = idx;
        });
        if (found && pos > 0) {
          const lastSeg = props.focusPath[props.focusPath.length - 1];
          view.dispatch({
            selection: { anchor: pos, head: pos + lastSeg.length },
            effects: EditorView.scrollIntoView(pos, { y: 'center' }),
          });
        }
      }
    });

    const applyChanges = () => {
      if (!view) return;
      error.value = '';
      try {
        emit('apply', evaluate(view.state.doc.toString(), fnRegistry));
      } catch (e) {
        error.value = `${e.message}`;
      }
    };

    const resetChanges = () => {
      if (!view) return;
      error.value = '';
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: initialJS,
        },
      });
      try {
        emit('apply', evaluate(initialJS, fnRegistry));
      } catch (e) {
        error.value = `${e.message}`;
      }
    };

    onBeforeUnmount(() => {
      if (view) {
        view.destroy();
        view = null;
      }
    });

    return { editorEl, error, applyChanges, resetChanges };
  },
};
</script>

<style lang="scss">
@import '../style/index.scss';

.playground-editor {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__cm {
    flex: 1;
    overflow: auto;

    .cm-editor {
      height: 100%;

      @include themify() {
        background-color: themed('background-color-base');
      }
    }
  }

  &__toolbar {
    display: flex;
    gap: 6px;
    padding: 8px;
    flex-shrink: 0;

    @include themify() {
      border-top: 1px solid themed('border-color-base');
    }
  }

  &__btn {
    padding: 4px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all $animate-fast;

    &--apply {
      background-color: $color-blue;
      color: $color-white;

      &:hover {
        opacity: 0.85;
      }
    }

    &--reset {
      @include themify() {
        background-color: themed('background-color-description');
        color: themed('font-color-base');
        border: 1px solid themed('border-color-base');
      }

      &:hover {
        background-color: rgba($color-yellow, 0.3);
      }
    }
  }

  &__error {
    margin: 0;
    padding: 6px 8px;
    font-size: 11px;
    color: #e74c3c;
    background-color: rgba(231, 76, 60, 0.08);
    flex-shrink: 0;
  }
}
</style>
