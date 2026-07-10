<template>
  <aside class="ad-tryit" :class="{ 'is-open': !!node }">
    <template v-if="node">
      <header class="ad-tryit-header">
        <div class="ad-tryit-title">
          <span class="ad-badge" :class="`ad-badge-kind-${node.kind}`">{{ node.kind }}</span>
          <code class="ad-tryit-path">{{ node.path }}</code>
        </div>
        <button class="ad-tryit-close" title="닫기" @click="store.closeTryIt()">✕</button>
      </header>

      <div class="ad-tryit-body">
        <!-- TODO: 코드 에디터 연동 예정 (예: CodeMirror) -->
        <div class="ad-tryit-pane">
          <p class="ad-tryit-pane-label">Code</p>
          <pre class="ad-tryit-code">{{ stubCode }}</pre>
        </div>
        <!-- TODO: 라이브 컴포넌트 렌더링 영역 -->
        <div class="ad-tryit-pane">
          <p class="ad-tryit-pane-label">Preview</p>
          <div class="ad-tryit-preview">
            <p>여기에 라이브 미리보기가 표시될 예정입니다.</p>
          </div>
        </div>
      </div>
    </template>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import { useApiDocsStore } from '../composables/useApiDocsStore';

const store = useApiDocsStore();
const node = computed(() => store.tryItNode.value);

const stubCode = computed(() => {
  if (!node.value) return '';
  const value = node.value.default !== undefined ? node.value.default : '...';
  return [
    '// 편집 가능한 예제 코드가 여기에 로드됩니다.',
    `// 대상: ${node.value.path}`,
    '{',
    `  ${node.value.name}: ${value},`,
    '}',
  ].join('\n');
});
</script>
