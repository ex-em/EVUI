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
  --ad-bg: #ffffff;
  --ad-bg-soft: #f7f8fa;
  --ad-bg-hover: rgba(26, 106, 254, 0.06);
  --ad-border: #e4e7ed;
  --ad-text: #1f2329;
  --ad-text-sub: #6b7280;
  --ad-primary: #1a6afe;
  --ad-primary-soft: rgba(26, 106, 254, 0.1);
  --ad-code-bg: #f1f3f6;
  --ad-badge-prop: #1a6afe;
  --ad-badge-event: #d97706;
  --ad-badge-slot: #059669;
  --ad-badge-type: #7c3aed;
  --ad-badge-required: #dc2626;
  --ad-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.dark .api-docs {
  --ad-bg: #0d0d0d;
  --ad-bg-soft: #17181c;
  --ad-bg-hover: rgba(0, 122, 255, 0.14);
  --ad-border: #2a2c33;
  --ad-text: #eceef2;
  --ad-text-sub: #9aa1ad;
  --ad-primary: #4c92ff;
  --ad-primary-soft: rgba(0, 122, 255, 0.18);
  --ad-code-bg: #23252c;
  --ad-badge-prop: #4c92ff;
  --ad-badge-event: #fbbf24;
  --ad-badge-slot: #34d399;
  --ad-badge-type: #a78bfa;
  --ad-badge-required: #f87171;
  --ad-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

/* ---------------------------------------------------------------------------
 * 3-Column 레이아웃
 * ------------------------------------------------------------------------- */
.api-docs {
  display: flex;
  height: calc(100vh - 60px);
  margin: -30px -40px; /* .evui-content 패딩 상쇄 → 풀블리드 */
  overflow: hidden;
  color: var(--ad-text);
  background: var(--ad-bg);
  font-size: 14px;

  .ad-empty {
    padding: 24px 16px;
    color: var(--ad-text-sub);
    text-align: center;
  }

  code {
    padding: 1px 5px;
    border-radius: 4px;
    background: var(--ad-code-bg);
    font-family: 'SF Mono', Menlo, Consolas, monospace;
    font-size: 0.85em;
  }

  /* --- [Left] Sidebar ----------------------------------------------------- */
  .ad-sidebar {
    display: flex;
    flex-direction: column;
    flex: 0 0 300px;
    min-width: 0;
    border-right: 1px solid var(--ad-border);
    background: var(--ad-bg-soft);
  }
  .ad-sidebar-head {
    position: relative;
    padding: 12px;
    border-bottom: 1px solid var(--ad-border);
  }
  .ad-component-picker {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 8px 10px;
    border: 1px solid var(--ad-border);
    border-radius: 6px;
    color: var(--ad-text);
    background: var(--ad-bg);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &:hover,
    &:focus {
      border-color: var(--ad-primary);
      outline: none;
    }
  }
  .ad-picker-caret {
    width: 0;
    height: 0;
    border-top: 5px solid var(--ad-text-sub);
    border-right: 4px solid transparent;
    border-left: 4px solid transparent;
    transition: transform 0.15s;

    &.is-open {
      transform: rotate(180deg);
    }
  }
  .ad-picker-backdrop {
    position: fixed;
    inset: 0;
    z-index: 19;
  }
  .ad-picker-panel {
    position: absolute;
    top: calc(100% - 4px);
    right: 12px;
    left: 12px;
    z-index: 20;
    max-height: 62vh;
    padding: 6px;
    overflow-y: auto;
    border: 1px solid var(--ad-border);
    border-radius: 8px;
    background: var(--ad-bg);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  }
  .ad-picker-category {
    padding: 10px 8px 4px;
    color: var(--ad-text-sub);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .ad-picker-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 7px 10px;
    border: none;
    border-radius: 6px;
    color: var(--ad-text);
    background: none;
    font-size: 13px;
    text-align: left;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: var(--ad-bg-hover);
    }
    &.is-active {
      background: var(--ad-primary-soft);
      color: var(--ad-primary);
      font-weight: 600;
    }
    &:disabled {
      color: var(--ad-text-sub);
      cursor: not-allowed;
      opacity: 0.55;
    }
  }
  .ad-picker-soon {
    padding: 1px 6px;
    border-radius: 8px;
    color: var(--ad-text-sub);
    background: var(--ad-code-bg);
    font-size: 10px;
  }

  /* md 폴백 안내/뷰 */
  .ad-md-notice {
    padding: 16px 14px;
    color: var(--ad-text-sub);
    font-size: 12.5px;
    line-height: 1.7;
  }
  .ad-md-fallback {
    padding-top: 0;
    overflow-x: auto;
  }

  .ad-tabs {
    display: flex;
    border-bottom: 1px solid var(--ad-border);
  }
  .ad-tab {
    flex: 1;
    padding: 10px 0;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--ad-text-sub);
    background: none;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: var(--ad-text);
    }
    &.is-active {
      border-bottom-color: var(--ad-primary);
      color: var(--ad-primary);
    }
  }

  .ad-search {
    position: relative;
    padding: 10px 12px;
  }
  .ad-search-input {
    width: 100%;
    padding: 7px 28px 7px 10px;
    border: 1px solid var(--ad-border);
    border-radius: 6px;
    color: var(--ad-text);
    background: var(--ad-bg);
    font-size: 13px;

    &::placeholder {
      color: var(--ad-text-sub);
    }
    &:focus {
      border-color: var(--ad-primary);
      outline: none;
    }
  }
  .ad-search-clear {
    position: absolute;
    top: 50%;
    right: 20px;
    padding: 2px;
    border: none;
    color: var(--ad-text-sub);
    background: none;
    cursor: pointer;
    transform: translateY(-50%);
  }

  .ad-tree-scroll {
    flex: 1;
    padding-bottom: 20px;
    overflow-y: auto;
  }
  .ad-tree-section {
    padding: 14px 12px 6px;
    color: var(--ad-text-sub);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .ad-tree,
  .ad-tree-children {
    list-style: none;
  }
  .ad-tree-row {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 8px;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;

    &:hover {
      background: var(--ad-bg-hover);
    }
    &.is-active {
      background: var(--ad-primary-soft);
      color: var(--ad-primary);
      font-weight: 600;
    }
  }
  .ad-tree-caret {
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
      border-left: 5px solid var(--ad-text-sub);
      transition: transform 0.15s;
    }
    &.is-open::before {
      transform: rotate(90deg);
    }
    &.is-leaf::before {
      display: none;
    }
  }
  .ad-tree-label {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
  }
  .ad-tree-required {
    color: var(--ad-badge-required);
    font-weight: 700;
  }
  .ad-tree-count {
    margin-left: auto;
    padding: 0 6px;
    border-radius: 8px;
    color: var(--ad-text-sub);
    background: var(--ad-code-bg);
    font-size: 11px;
  }

  .ad-examples {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0 10px 20px;
    overflow-y: auto;
  }
  .ad-example-link {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 2px;
    padding: 7px 10px;
    border: none;
    border-radius: 6px;
    color: var(--ad-text);
    background: none;
    font-size: 13px;
    text-align: left;
    text-decoration: none;
    cursor: pointer;

    &:hover {
      background: var(--ad-bg-hover);

      .ad-example-name {
        color: var(--ad-primary);
      }
    }
    &.is-active {
      background: var(--ad-primary-soft);

      .ad-example-name {
        color: var(--ad-primary);
      }
    }
  }
  .ad-example-name {
    font-weight: 600;
  }
  .ad-example-dev {
    padding: 0 5px;
    margin-left: 4px;
    border-radius: 8px;
    color: #fff;
    background: var(--ad-badge-event);
    font-size: 10px;
    font-weight: 700;
    vertical-align: 1px;
  }
  .ad-example-desc {
    display: -webkit-box;
    overflow: hidden;
    color: var(--ad-text-sub);
    font-size: 12px;
    line-height: 1.5;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  /* --- [Center] Detail ----------------------------------------------------- */
  .ad-detail {
    /* 스크롤 대상(offsetTop) 좌표 기준을 이 컨테이너로 고정한다.
       static이면 offsetParent가 .evui-wrapper가 되어 헤더 높이만큼 어긋난다. */
    position: relative;
    flex: 1;
    min-width: 0;
    padding: 24px 32px 60vh; /* 하단 여백: 마지막 항목도 스파이 기준선에 닿도록 */
    overflow-y: auto;
    scroll-behavior: smooth;
  }
  .ad-detail-intro {
    padding-bottom: 16px;
    margin-bottom: 8px;
    border-bottom: 1px solid var(--ad-border);
  }
  .ad-detail-component {
    font-size: 24px;
    font-weight: 700;
  }
  .ad-detail-summary {
    margin-top: 6px;
    color: var(--ad-text-sub);
  }
  .ad-example-intro {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
  }
  .ad-example-group {
    margin-bottom: 2px;
    color: var(--ad-text-sub);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .ad-example-back {
    flex: 0 0 auto;
    padding: 6px 12px;
    border: 1px solid var(--ad-border);
    border-radius: 6px;
    color: var(--ad-text-sub);
    background: none;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
      border-color: var(--ad-primary);
      color: var(--ad-primary);
    }
  }

  /* 예제 뷰: 인트로 헤더에 제목이 이미 있으므로 Example 내부 제목/설명은 중복 숨김 */
  .ad-detail .article-wrapper {
    .article-title,
    .article-description {
      display: none;
    }
  }

  /* 예제 뷰: 남은 패널 영역을 예제(article-example)가 꽉 채운다 */
  .ad-detail.is-example {
    display: flex;
    flex-direction: column;
    padding-bottom: 24px;

    .ad-detail-intro {
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

  .ad-detail-section {
    margin: 28px 0 4px;
    color: var(--ad-text-sub);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .ad-item {
    padding: 14px 16px;
    margin-top: 10px;
    border: 1px solid var(--ad-border);
    border-left: 3px solid transparent;
    border-radius: 8px;
    background: var(--ad-bg);
    box-shadow: var(--ad-shadow);
    /* 대용량 문서 대응: 화면 밖 카드는 렌더링 생략 */
    content-visibility: auto;
    contain-intrinsic-size: auto 200px;
    /* 플래시 하이라이트가 부드럽게 사라지도록 */
    transition: border-color 0.8s ease, background-color 0.8s ease;

    &.is-active {
      border-left-color: var(--ad-primary);
      background: var(--ad-bg-soft);
      transition: none; /* 나타날 때는 즉시 */
    }
  }
  .ad-item-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }
  .ad-item-title {
    font-family: 'SF Mono', Menlo, Consolas, monospace;
    font-size: 15px;
    font-weight: 400;
  }
  .ad-item-parent-path {
    color: var(--ad-text-sub);
  }
  .ad-item-name {
    color: var(--ad-text);
    font-weight: 700;
  }
  .ad-tryit-btn-row {
    padding: 1px 8px;
    margin-left: auto;
    font-size: 11px;
  }
  .ad-tryit-btn {
    flex: 0 0 auto;
    padding: 4px 10px;
    border: 1px solid var(--ad-primary);
    border-radius: 6px;
    color: var(--ad-primary);
    background: none;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
      color: #fff;
      background: var(--ad-primary);
    }
  }

  .ad-item-badges {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
  }
  .ad-badge {
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
  .ad-badge-kind-props {
    background: var(--ad-badge-prop);
  }
  .ad-badge-kind-events {
    background: var(--ad-badge-event);
  }
  .ad-badge-kind-slots {
    background: var(--ad-badge-slot);
  }
  .ad-badge-type {
    color: var(--ad-badge-type);
    background: var(--ad-primary-soft);
    font-family: 'SF Mono', Menlo, Consolas, monospace;
    font-weight: 700;
  }
  .ad-badge-required {
    color: var(--ad-badge-required);
    background: rgba(220, 38, 38, 0.1);
  }
  .ad-badge-default {
    color: var(--ad-text-sub);
    background: var(--ad-code-bg);
  }
  .ad-badge-version {
    color: var(--ad-badge-slot);
    background: rgba(5, 150, 105, 0.1);
  }

  .ad-item-desc {
    margin-top: 8px;
    color: var(--ad-text);
    line-height: 1.65;
  }

  /* 그룹 내부 leaf 속성 행 */
  .ad-group-rows {
    margin-top: 14px;
    border-top: 1px solid var(--ad-border);
    list-style: none;
  }
  .ad-group-row {
    padding: 10px 10px 10px 14px;
    border-bottom: 1px solid var(--ad-border);
    border-left: 2px solid transparent;
    cursor: pointer;
    /* 플래시 하이라이트가 부드럽게 사라지도록 */
    transition: border-color 0.8s ease, background-color 0.8s ease;

    &:last-child {
      border-bottom: none;
    }
    &:hover {
      background: var(--ad-bg-hover);
    }
    &.is-active {
      border-left-color: var(--ad-primary);
      background: var(--ad-primary-soft);
      transition: none; /* 나타날 때는 즉시 */
    }
  }
  .ad-row-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }
  .ad-row-name {
    padding: 0;
    background: none;
    color: var(--ad-text);
    font-size: 13px;
    font-weight: 700;
  }
  /* full path 프리픽스: 이름은 굵게, 부모 경로는 muted */
  .ad-row-path {
    color: var(--ad-text-sub);
    font-weight: 400;
  }
  /* 중첩 객체 행: 하위 속성들의 소제목 역할 */
  .ad-group-row.is-object .ad-row-name {
    font-size: 14px;

    &::after {
      content: ' { … }';
      color: var(--ad-text-sub);
      font-size: 12px;
      font-weight: 400;
    }
  }
  .ad-row-desc {
    margin-top: 4px;
    color: var(--ad-text-sub);
    font-size: 13px;
    line-height: 1.6;
  }
  .ad-item-values {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
  }
  .ad-item-values-label {
    color: var(--ad-text-sub);
    font-size: 12px;
  }

  /* --- [Right] Try It Panel ------------------------------------------------ */
  .ad-tryit {
    display: flex;
    position: relative;
    flex-direction: column;
    flex: 0 0 0;
    overflow: hidden;
    border-left: 1px solid transparent;
    background: var(--ad-bg-soft);
    transition: flex-basis 0.25s ease-in-out;

    &.is-open {
      flex-basis: 500px;
      border-left-color: var(--ad-border);
    }
    /* 드래그 중에는 커서를 즉각 따라가도록 애니메이션 해제 */
    &.is-resizing {
      transition: none;
    }
  }
  .ad-tryit-resize-handle {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 5;
    width: 6px;
    cursor: col-resize;

    &:hover,
    &:active {
      background: var(--ad-primary-soft);
      box-shadow: inset 2px 0 0 var(--ad-primary);
    }
  }
  .ad-tryit-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 12px 14px;
    border-bottom: 1px solid var(--ad-border);
  }
  .ad-tryit-title {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .ad-tryit-path {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ad-tryit-close {
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    color: var(--ad-text-sub);
    background: none;
    cursor: pointer;

    &:hover {
      background: var(--ad-bg-hover);
      color: var(--ad-text);
    }
  }
  .ad-tryit-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }
  .ad-tryit-live {
    flex: 0 0 300px;
    padding: 10px 14px;
    overflow: hidden;
    border-bottom: 1px solid var(--ad-border);
    background: var(--ad-bg);

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
  .ad-tryit-editor {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;

    .playground-editor {
      flex: 1;
      min-height: 0;
    }
  }
  .ad-tryit-editor-tabs {
    display: flex;
    flex-shrink: 0;
    border-bottom: 1px solid var(--ad-border);
    background: var(--ad-bg);
  }
  .ad-tryit-editor-tab {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 8px 14px;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--ad-text-sub);
    background: none;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
      color: var(--ad-text);
    }
    &.is-active {
      border-bottom-color: var(--ad-primary);
      color: var(--ad-primary);
    }
  }
  .ad-tryit-event-count {
    padding: 0 6px;
    border-radius: 8px;
    color: #fff;
    background: var(--ad-primary);
    font-size: 10px;
    line-height: 1.6;
  }

  /* ── Events 콘솔 ── */
  .ad-tryit-chart {
    height: 100%;
  }
  .ad-tryit-console {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }
  .ad-tryit-console-bar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 6px 10px;
    border-bottom: 1px solid var(--ad-border);
  }
  .ad-tryit-console-info {
    overflow: hidden;
    color: var(--ad-text-sub);
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ad-tryit-console-clear {
    flex-shrink: 0;
    padding: 3px 10px;
    border: 1px solid var(--ad-border);
    border-radius: 4px;
    color: var(--ad-text-sub);
    background: none;
    font-size: 11px;
    cursor: pointer;

    &:hover {
      border-color: var(--ad-primary);
      color: var(--ad-primary);
    }
  }
  .ad-tryit-console-body {
    flex: 1;
    min-height: 0;
    padding: 8px 10px;
    overflow-y: auto;
    background: #16181d;
    font-family: 'SF Mono', Menlo, Consolas, monospace;
    font-size: 11.5px;
    line-height: 1.7;
  }
  .ad-tryit-console-empty {
    color: #6b7280;
  }
  .ad-tryit-console-line {
    display: flex;
    gap: 8px;
    padding: 1px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    word-break: break-all;
  }
  .ad-tryit-console-time {
    flex-shrink: 0;
    color: #6b7280;
  }
  .ad-tryit-console-name {
    flex-shrink: 0;
    color: #7ee787;
    font-weight: 700;
  }
  .ad-tryit-console-payload {
    color: #c9d1d9;
  }

  /* --- 반응형 -------------------------------------------------------------- */
  @media (max-width: 1280px) {
    .ad-tryit.is-open {
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
    .ad-sidebar {
      flex-basis: 240px;
    }
    .ad-detail {
      padding: 16px 16px 60vh;
    }
  }
}
</style>
