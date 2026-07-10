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

const toJSLiteral = (value, indent = 0) => {
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
    const src = value.toString();
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
      (v) => `${inner}${toJSLiteral(v, indent + 2)}`,
    );
    return `[\n${items.join(',\n')},\n${pad}]`;
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    if (!entries.length) return '{}';
    const rows = entries.map(([k, v]) => {
      const key = /^[a-zA-Z_$]\w*$/.test(k)
        ? k
        : JSON.stringify(k);
      return `${inner}${key}: ${toJSLiteral(v, indent + 2)}`;
    });
    return `{\n${rows.join(',\n')},\n${pad}}`;
  }

  return String(value);
};

const evaluate = (code) => {
  // eslint-disable-next-line no-new-func
  const fn = new Function('dayjs', `return (\n${code}\n)`);
  return fn(dayjs);
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
  },
  emits: ['apply'],
  setup(props, { emit }) {
    const editorEl = ref(null);
    const error = ref('');
    let view = null;
    let initialJS = '';

    onMounted(() => {
      if (!props.modelValue) return;
      initialJS = toJSLiteral(props.modelValue);
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
        emit('apply', evaluate(view.state.doc.toString()));
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
        emit('apply', evaluate(initialJS));
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
