<template>
  <div class="api-docs">
    <ApiSidebar />
    <ApiDetailPanel />
    <TryItPanel />
  </div>
</template>

<script setup>
import ApiSidebar from './components/ApiSidebar.vue';
import ApiDetailPanel from './components/ApiDetailPanel.vue';
import TryItPanel from './components/TryItPanel.vue';
import { createApiDocsStore } from './composables/useApiDocsStore';

createApiDocsStore();
</script>

<style lang="scss">
/* ---------------------------------------------------------------------------
 * 테마 토큰 (CSS Variables)
 * 라이브러리 톤앤매너에 맞춰 이 블록만 오버라이드하면 테마 확장이 가능하다.
 * ------------------------------------------------------------------------- */
.api-docs {
  --apidoc-bg: #ffffff;
  --apidoc-bg-soft: #f7f8fa;
  --apidoc-bg-hover: rgba(26, 106, 254, 0.06);
  --apidoc-border: #e4e7ed;
  --apidoc-text: #1f2329;
  --apidoc-text-sub: #6b7280;
  --apidoc-primary: #1a6afe;
  --apidoc-primary-soft: rgba(26, 106, 254, 0.1);
  --apidoc-code-bg: #f1f3f6;
  --apidoc-badge-prop: #1a6afe;
  --apidoc-badge-event: #d97706;
  --apidoc-badge-slot: #059669;
  --apidoc-badge-type: #7c3aed;
  --apidoc-badge-required: #dc2626;
  --apidoc-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.dark .api-docs {
  --apidoc-bg: #0d0d0d;
  --apidoc-bg-soft: #17181c;
  --apidoc-bg-hover: rgba(0, 122, 255, 0.14);
  --apidoc-border: #2a2c33;
  --apidoc-text: #eceef2;
  --apidoc-text-sub: #9aa1ad;
  --apidoc-primary: #4c92ff;
  --apidoc-primary-soft: rgba(0, 122, 255, 0.18);
  --apidoc-code-bg: #23252c;
  --apidoc-badge-prop: #4c92ff;
  --apidoc-badge-event: #fbbf24;
  --apidoc-badge-slot: #34d399;
  --apidoc-badge-type: #a78bfa;
  --apidoc-badge-required: #f87171;
  --apidoc-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

/* ---------------------------------------------------------------------------
 * 3-Column 레이아웃
 * ------------------------------------------------------------------------- */
.api-docs {
  display: flex;
  height: calc(100vh - 60px);
  margin: -30px -40px; /* .evui-content 패딩 상쇄 → 풀블리드 */
  overflow: hidden;
  color: var(--apidoc-text);
  background: var(--apidoc-bg);
  font-size: 14px;

  .apidoc-empty {
    padding: 24px 16px;
    color: var(--apidoc-text-sub);
    text-align: center;
  }

  code {
    padding: 1px 5px;
    border-radius: 4px;
    background: var(--apidoc-code-bg);
    font-family: 'SF Mono', Menlo, Consolas, monospace;
    font-size: 0.85em;
  }

  /* --- [Left] Sidebar ----------------------------------------------------- */
  .apidoc-sidebar {
    display: flex;
    flex-direction: column;
    flex: 0 0 300px;
    min-width: 0;
    border-right: 1px solid var(--apidoc-border);
    background: var(--apidoc-bg-soft);
  }
  .apidoc-sidebar-head {
    position: relative;
    padding: 12px;
    border-bottom: 1px solid var(--apidoc-border);
  }
  .apidoc-component-picker {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 8px 10px;
    border: 1px solid var(--apidoc-border);
    border-radius: 6px;
    color: var(--apidoc-text);
    background: var(--apidoc-bg);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &:hover,
    &:focus {
      border-color: var(--apidoc-primary);
      outline: none;
    }
  }
  .apidoc-picker-caret {
    width: 0;
    height: 0;
    border-top: 5px solid var(--apidoc-text-sub);
    border-right: 4px solid transparent;
    border-left: 4px solid transparent;
    transition: transform 0.15s;

    &.is-open {
      transform: rotate(180deg);
    }
  }
  .apidoc-picker-backdrop {
    position: fixed;
    inset: 0;
    z-index: 19;
  }
  .apidoc-picker-panel {
    position: absolute;
    top: calc(100% - 4px);
    right: 12px;
    left: 12px;
    z-index: 20;
    max-height: 62vh;
    padding: 6px;
    overflow-y: auto;
    border: 1px solid var(--apidoc-border);
    border-radius: 8px;
    background: var(--apidoc-bg);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  }
  .apidoc-picker-category {
    padding: 10px 8px 4px;
    color: var(--apidoc-text-sub);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .apidoc-picker-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 7px 10px;
    border: none;
    border-radius: 6px;
    color: var(--apidoc-text);
    background: none;
    font-size: 13px;
    text-align: left;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: var(--apidoc-bg-hover);
    }
    &.is-active {
      background: var(--apidoc-primary-soft);
      color: var(--apidoc-primary);
      font-weight: 600;
    }
    &:disabled {
      color: var(--apidoc-text-sub);
      cursor: not-allowed;
      opacity: 0.55;
    }
  }
  .apidoc-picker-soon {
    padding: 1px 6px;
    border-radius: 8px;
    color: var(--apidoc-text-sub);
    background: var(--apidoc-code-bg);
    font-size: 10px;
  }

  /* md 폴백 안내/뷰 */
  .apidoc-md-notice {
    padding: 16px 14px;
    color: var(--apidoc-text-sub);
    font-size: 12.5px;
    line-height: 1.7;
  }
  .apidoc-md-fallback {
    padding-top: 0;
    overflow-x: auto;
  }

  .apidoc-tabs {
    display: flex;
    border-bottom: 1px solid var(--apidoc-border);
  }
  .apidoc-tab {
    flex: 1;
    padding: 10px 0;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--apidoc-text-sub);
    background: none;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: var(--apidoc-text);
    }
    &.is-active {
      border-bottom-color: var(--apidoc-primary);
      color: var(--apidoc-primary);
    }
  }

  .apidoc-search {
    position: relative;
    padding: 10px 12px;
  }
  .apidoc-search-input {
    width: 100%;
    padding: 7px 28px 7px 10px;
    border: 1px solid var(--apidoc-border);
    border-radius: 6px;
    color: var(--apidoc-text);
    background: var(--apidoc-bg);
    font-size: 13px;

    &::placeholder {
      color: var(--apidoc-text-sub);
    }
    &:focus {
      border-color: var(--apidoc-primary);
      outline: none;
    }
  }
  .apidoc-search-clear {
    position: absolute;
    top: 50%;
    right: 20px;
    padding: 2px;
    border: none;
    color: var(--apidoc-text-sub);
    background: none;
    cursor: pointer;
    transform: translateY(-50%);
  }

  .apidoc-tree-scroll {
    flex: 1;
    padding-bottom: 20px;
    overflow-y: auto;
  }
  .apidoc-tree-section {
    padding: 14px 12px 6px;
    color: var(--apidoc-text-sub);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .apidoc-tree,
  .apidoc-tree-children {
    list-style: none;
  }
  .apidoc-tree-row {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 8px;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;

    &:hover {
      background: var(--apidoc-bg-hover);
    }
    &.is-active {
      background: var(--apidoc-primary-soft);
      color: var(--apidoc-primary);
      font-weight: 600;
    }
  }
  .apidoc-tree-caret {
    flex: 0 0 14px;
    width: 14px;
    height: 14px;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 4px;
      left: 5px;
      border-top: 4px solid transparent;
      border-bottom: 4px solid transparent;
      border-left: 5px solid var(--apidoc-text-sub);
      transition: transform 0.15s;
    }
    &.is-open::before {
      transform: rotate(90deg);
    }
    &.is-leaf::before {
      display: none;
    }
  }
  .apidoc-tree-label {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
  }
  .apidoc-tree-required {
    color: var(--apidoc-badge-required);
    font-weight: 700;
  }
  .apidoc-tree-count {
    margin-left: auto;
    padding: 0 6px;
    border-radius: 8px;
    color: var(--apidoc-text-sub);
    background: var(--apidoc-code-bg);
    font-size: 11px;
  }

  .apidoc-examples {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0 10px 20px;
    overflow-y: auto;
  }
  .apidoc-example-link {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 2px;
    padding: 7px 10px;
    border: none;
    border-radius: 6px;
    color: var(--apidoc-text);
    background: none;
    font-size: 13px;
    text-align: left;
    text-decoration: none;
    cursor: pointer;

    &:hover {
      background: var(--apidoc-bg-hover);

      .apidoc-example-name {
        color: var(--apidoc-primary);
      }
    }
    &.is-active {
      background: var(--apidoc-primary-soft);

      .apidoc-example-name {
        color: var(--apidoc-primary);
      }
    }
  }
  .apidoc-example-name {
    font-weight: 600;
  }
  .apidoc-example-dev {
    padding: 0 5px;
    margin-left: 4px;
    border-radius: 8px;
    color: #fff;
    background: var(--apidoc-badge-event);
    font-size: 10px;
    font-weight: 700;
    vertical-align: 1px;
  }
  .apidoc-example-desc {
    display: -webkit-box;
    overflow: hidden;
    color: var(--apidoc-text-sub);
    font-size: 12px;
    line-height: 1.5;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  /* --- [Center] Detail ----------------------------------------------------- */
  .apidoc-detail {
    /* 스크롤 대상(offsetTop) 좌표 기준을 이 컨테이너로 고정한다.
       static이면 offsetParent가 .evui-wrapper가 되어 헤더 높이만큼 어긋난다. */
    position: relative;
    flex: 1;
    min-width: 0;
    padding: 24px 32px 60vh; /* 하단 여백: 마지막 항목도 스파이 기준선에 닿도록 */
    overflow-y: auto;
    scroll-behavior: smooth;
  }
  .apidoc-detail-intro {
    padding-bottom: 16px;
    margin-bottom: 8px;
    border-bottom: 1px solid var(--apidoc-border);
  }
  .apidoc-detail-component {
    font-size: 24px;
    font-weight: 700;
  }
  .apidoc-detail-summary {
    margin-top: 6px;
    color: var(--apidoc-text-sub);
  }
  .apidoc-example-intro {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
  }
  .apidoc-example-group {
    margin-bottom: 2px;
    color: var(--apidoc-text-sub);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .apidoc-example-back {
    flex: 0 0 auto;
    padding: 6px 12px;
    border: 1px solid var(--apidoc-border);
    border-radius: 6px;
    color: var(--apidoc-text-sub);
    background: none;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
      border-color: var(--apidoc-primary);
      color: var(--apidoc-primary);
    }
  }

  /* 예제 뷰: 인트로 헤더에 제목이 이미 있으므로 Example 내부 제목/설명은 중복 숨김 */
  .apidoc-detail .article-wrapper {
    .article-title,
    .article-description {
      display: none;
    }
  }

  /* 예제 뷰: 남은 패널 영역을 예제(article-example)가 꽉 채운다 */
  .apidoc-detail.is-example {
    display: flex;
    flex-direction: column;
    padding-bottom: 24px;

    .apidoc-detail-intro {
      flex-shrink: 0;
    }
    .article-wrapper {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      padding: 16px 0 0;
    }
    .article-example {
      flex: 1;
      height: auto;
      min-height: 320px;
    }
  }

  .apidoc-detail-section {
    margin: 28px 0 4px;
    color: var(--apidoc-text-sub);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .apidoc-item {
    padding: 14px 16px;
    margin-top: 10px;
    border: 1px solid var(--apidoc-border);
    border-left: 3px solid transparent;
    border-radius: 8px;
    background: var(--apidoc-bg);
    box-shadow: var(--apidoc-shadow);
    /* 대용량 문서 대응: 화면 밖 카드는 렌더링 생략 */
    content-visibility: auto;
    contain-intrinsic-size: auto 200px;
    /* 플래시 하이라이트가 부드럽게 사라지도록 */
    transition: border-color 0.8s ease, background-color 0.8s ease;

    &.is-active {
      border-left-color: var(--apidoc-primary);
      background: var(--apidoc-bg-soft);
      transition: none; /* 나타날 때는 즉시 */
    }
  }
  .apidoc-item-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }
  .apidoc-item-title {
    font-family: 'SF Mono', Menlo, Consolas, monospace;
    font-size: 15px;
    font-weight: 400;
  }
  .apidoc-item-parent-path {
    color: var(--apidoc-text-sub);
  }
  .apidoc-item-name {
    color: var(--apidoc-text);
    font-weight: 700;
  }
  .apidoc-tryit-btn-row {
    padding: 1px 8px;
    margin-left: auto;
    font-size: 11px;
  }
  .apidoc-tryit-btn {
    flex: 0 0 auto;
    padding: 4px 10px;
    border: 1px solid var(--apidoc-primary);
    border-radius: 6px;
    color: var(--apidoc-primary);
    background: none;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
      color: #fff;
      background: var(--apidoc-primary);
    }
  }

  .apidoc-item-badges {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
  }
  .apidoc-badge {
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.6;
    color: #fff;

    code {
      padding: 0;
      color: inherit;
      background: none;
    }
  }
  .apidoc-badge-kind-props {
    background: var(--apidoc-badge-prop);
  }
  .apidoc-badge-kind-events {
    background: var(--apidoc-badge-event);
  }
  .apidoc-badge-kind-slots {
    background: var(--apidoc-badge-slot);
  }
  .apidoc-badge-type {
    color: var(--apidoc-badge-type);
    background: var(--apidoc-primary-soft);
    font-family: 'SF Mono', Menlo, Consolas, monospace;
    font-weight: 700;
  }
  .apidoc-badge-required {
    color: var(--apidoc-badge-required);
    background: rgba(220, 38, 38, 0.1);
  }
  .apidoc-badge-default {
    color: var(--apidoc-text-sub);
    background: var(--apidoc-code-bg);
  }
  .apidoc-badge-version {
    color: var(--apidoc-badge-slot);
    background: rgba(5, 150, 105, 0.1);
  }

  .apidoc-item-desc {
    margin-top: 8px;
    color: var(--apidoc-text);
    line-height: 1.65;
  }

  /* 그룹 내부 leaf 속성 행 */
  .apidoc-group-rows {
    margin-top: 14px;
    border-top: 1px solid var(--apidoc-border);
    list-style: none;
  }
  .apidoc-group-row {
    padding: 10px 10px 10px 14px;
    border-bottom: 1px solid var(--apidoc-border);
    border-left: 2px solid transparent;
    cursor: pointer;
    /* 플래시 하이라이트가 부드럽게 사라지도록 */
    transition: border-color 0.8s ease, background-color 0.8s ease;

    &:last-child {
      border-bottom: none;
    }
    &:hover {
      background: var(--apidoc-bg-hover);
    }
    &.is-active {
      border-left-color: var(--apidoc-primary);
      background: var(--apidoc-primary-soft);
      transition: none; /* 나타날 때는 즉시 */
    }
  }
  .apidoc-row-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }
  .apidoc-row-name {
    padding: 0;
    background: none;
    color: var(--apidoc-text);
    font-size: 13px;
    font-weight: 700;
  }
  /* full path 프리픽스: 이름은 굵게, 부모 경로는 muted */
  .apidoc-row-path {
    color: var(--apidoc-text-sub);
    font-weight: 400;
  }
  /* 중첩 객체 행: 하위 속성들의 소제목 역할 */
  .apidoc-group-row.is-object .apidoc-row-name {
    font-size: 14px;

    &::after {
      content: ' { … }';
      color: var(--apidoc-text-sub);
      font-size: 12px;
      font-weight: 400;
    }
  }
  .apidoc-row-desc {
    margin-top: 4px;
    color: var(--apidoc-text-sub);
    font-size: 13px;
    line-height: 1.6;
  }
  .apidoc-item-values {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
  }
  .apidoc-item-values-label {
    color: var(--apidoc-text-sub);
    font-size: 12px;
  }

  /* --- [Right] Try It Panel ------------------------------------------------ */
  .apidoc-tryit {
    display: flex;
    position: relative;
    flex-direction: column;
    flex: 0 0 0;
    overflow: hidden;
    border-left: 1px solid transparent;
    background: var(--apidoc-bg-soft);
    transition: flex-basis 0.25s ease-in-out;

    &.is-open {
      flex-basis: 500px;
      border-left-color: var(--apidoc-border);
    }
    /* 드래그 중에는 커서를 즉각 따라가도록 애니메이션 해제 */
    &.is-resizing {
      transition: none;
    }
  }
  .apidoc-tryit-resize-handle {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 5;
    width: 6px;
    cursor: col-resize;

    &:hover,
    &:active {
      background: var(--apidoc-primary-soft);
      box-shadow: inset 2px 0 0 var(--apidoc-primary);
    }
  }
  .apidoc-tryit-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 12px 14px;
    border-bottom: 1px solid var(--apidoc-border);
  }
  .apidoc-tryit-title {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .apidoc-tryit-path {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .apidoc-tryit-close {
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    color: var(--apidoc-text-sub);
    background: none;
    cursor: pointer;

    &:hover {
      background: var(--apidoc-bg-hover);
      color: var(--apidoc-text);
    }
  }
  .apidoc-tryit-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }
  .apidoc-tryit-live {
    flex: 0 0 300px;
    padding: 10px 14px;
    overflow: hidden;
    border-bottom: 1px solid var(--apidoc-border);
    background: var(--apidoc-bg);

    > * {
      height: 100%;
    }

    /* 예제 루트가 ResizableWrapper인 경우: 인라인 높이(기본 300px)를
       패널 영역에 맞게 강제하고, 자체 리사이즈 핸들은 숨긴다 */
    .resizable-wrapper {
      height: 100%;

      .component-area {
        height: calc(100% - 4px) !important;
      }
      .resize-handle {
        display: none;
      }
    }
  }
  .apidoc-tryit-editor {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;

    .playground-editor {
      flex: 1;
      min-height: 0;
    }
  }
  .apidoc-tryit-editor-tabs {
    display: flex;
    flex-shrink: 0;
    border-bottom: 1px solid var(--apidoc-border);
    background: var(--apidoc-bg);
  }
  .apidoc-tryit-editor-tab {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 8px 14px;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--apidoc-text-sub);
    background: none;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
      color: var(--apidoc-text);
    }
    &.is-active {
      border-bottom-color: var(--apidoc-primary);
      color: var(--apidoc-primary);
    }
  }
  .apidoc-tryit-event-count {
    padding: 0 6px;
    border-radius: 8px;
    color: #fff;
    background: var(--apidoc-primary);
    font-size: 10px;
    line-height: 1.6;
  }

  /* ── Events 콘솔 ── */
  .apidoc-tryit-chart {
    height: 100%;
  }
  .apidoc-tryit-console {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }
  .apidoc-tryit-console-bar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 6px 10px;
    border-bottom: 1px solid var(--apidoc-border);
  }
  .apidoc-tryit-console-info {
    overflow: hidden;
    color: var(--apidoc-text-sub);
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .apidoc-tryit-console-clear {
    flex-shrink: 0;
    padding: 3px 10px;
    border: 1px solid var(--apidoc-border);
    border-radius: 4px;
    color: var(--apidoc-text-sub);
    background: none;
    font-size: 11px;
    cursor: pointer;

    &:hover {
      border-color: var(--apidoc-primary);
      color: var(--apidoc-primary);
    }
  }
  .apidoc-tryit-console-body {
    flex: 1;
    min-height: 0;
    padding: 8px 10px;
    overflow-y: auto;
    background: #16181d;
    font-family: 'SF Mono', Menlo, Consolas, monospace;
    font-size: 11.5px;
    line-height: 1.7;
  }
  .apidoc-tryit-console-empty {
    color: #6b7280;
  }
  .apidoc-tryit-console-line {
    display: flex;
    gap: 8px;
    padding: 1px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    word-break: break-all;
  }
  .apidoc-tryit-console-time {
    flex-shrink: 0;
    color: #6b7280;
  }
  .apidoc-tryit-console-name {
    flex-shrink: 0;
    color: #7ee787;
    font-weight: 700;
  }
  .apidoc-tryit-console-payload {
    color: #c9d1d9;
  }

  /* --- 반응형 -------------------------------------------------------------- */
  @media (max-width: 1280px) {
    .apidoc-tryit.is-open {
      position: absolute;
      top: 60px;
      right: 0;
      bottom: 0;
      z-index: 10;
      flex-basis: auto;
      width: min(500px, 90vw);
      box-shadow: -8px 0 24px rgba(0, 0, 0, 0.15);
    }
  }
  @media (max-width: 900px) {
    .apidoc-sidebar {
      flex-basis: 240px;
    }
    .apidoc-detail {
      padding: 16px 16px 60vh;
    }
  }
}
</style>
