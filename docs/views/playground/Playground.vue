<template>
  <div class="playground-container">
    <header class="playground-header">
      <h1 class="playground-title">Chart Playground</h1>
      <p class="playground-description">
        API 응답 데이터를 직접 입력하고 EVUI Chart의 동작을 테스트할 수 있습니다.
        <span class="syntax-hint">JS 문법 허용: trailing comma, 주석, 따옴표 없는 키</span>
      </p>
    </header>

    <div class="toolbar">
      <div class="toolbar-left">
        <label class="toolbar-label">Chart Type:</label>
        <ev-select
          v-model="selectedChartType"
          :items="chartTypeItems"
          class="chart-type-select"
          @change="onChartTypeChange"
        />
      </div>
      <div class="toolbar-right">
        <ev-button type="default" @click="resetToTemplate">Reset</ev-button>
        <ev-button type="primary" @click="formatJson">Format</ev-button>
      </div>
    </div>

    <div class="main-content">
      <div class="chart-preview">
        <div v-if="error" class="error-overlay">
          <div class="error-icon">!</div>
          <div class="error-text">{{ error }}</div>
        </div>
        <ev-chart
          v-if="!error"
          :key="chartKey"
          :data="chartData"
          :options="chartOptions"
        />
      </div>

      <div class="editor-panel">
        <div class="editor-tabs">
          <button
            class="tab-button"
            :class="{ active: activeTab === 'data' }"
            @click="activeTab = 'data'"
          >
            Data
          </button>
          <button
            class="tab-button"
            :class="{ active: activeTab === 'options' }"
            @click="activeTab = 'options'"
          >
            Options
          </button>
        </div>

        <div class="editor-content">
          <monaco-editor
            v-show="activeTab === 'data'"
            v-model:value="dataJsonString"
            language="json"
            :options="editorOptions"
            @change="onDataChange"
            @mount="onDataEditorMount"
          />
          <monaco-editor
            v-show="activeTab === 'options'"
            v-model:value="optionsJsonString"
            language="json"
            :options="editorOptions"
            @change="onOptionsChange"
            @mount="onOptionsEditorMount"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { MonacoEditor, loader } from '@vue-monaco/editor';
import { debounce } from 'lodash-es';
import JSON5 from 'json5';
import { templates, chartTypes } from './templates';

loader.init().then((monaco) => {
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: false,
  });
});

export default {
  name: 'Playground',
  components: {
    MonacoEditor,
  },
  setup() {
    const selectedChartType = ref('line');
    const activeTab = ref('data');
    const error = ref(null);
    const chartKey = ref(0);

    const chartTypeItems = chartTypes.map(item => ({
      name: item.name,
      value: item.value,
    }));

    const chartData = reactive({});
    const chartOptions = reactive({});

    const dataJsonString = ref('');
    const optionsJsonString = ref('');

    let dataEditor = null;
    let optionsEditor = null;

    const editorOptions = {
      automaticLayout: true,
      formatOnPaste: true,
      formatOnType: false,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      tabSize: 2,
      fontSize: 13,
      lineNumbers: 'on',
      folding: true,
      wordWrap: 'on',
    };

    const loadTemplate = (type) => {
      const template = templates[type];
      if (template) {
        Object.keys(chartData).forEach(key => delete chartData[key]);
        Object.assign(chartData, JSON.parse(JSON.stringify(template.data)));

        Object.keys(chartOptions).forEach(key => delete chartOptions[key]);
        Object.assign(chartOptions, JSON.parse(JSON.stringify(template.options)));

        dataJsonString.value = JSON.stringify(template.data, null, 2);
        optionsJsonString.value = JSON.stringify(template.options, null, 2);

        error.value = null;
        chartKey.value++;
      }
    };

    const parseAndApply = debounce((jsonString, target, isData) => {
      try {
        const parsed = JSON5.parse(jsonString);
        Object.keys(target).forEach(key => delete target[key]);
        Object.assign(target, parsed);
        error.value = null;
        chartKey.value++;
      } catch (e) {
        error.value = `${isData ? 'Data' : 'Options'} 파싱 오류: ${e.message}`;
      }
    }, 500);

    const onDataChange = (value) => {
      parseAndApply(value, chartData, true);
    };

    const onOptionsChange = (value) => {
      parseAndApply(value, chartOptions, false);
    };

    const onChartTypeChange = () => {
      loadTemplate(selectedChartType.value);
    };

    const resetToTemplate = () => {
      loadTemplate(selectedChartType.value);
    };

    const formatJson = () => {
      try {
        if (activeTab.value === 'data') {
          const parsed = JSON5.parse(dataJsonString.value);
          dataJsonString.value = JSON.stringify(parsed, null, 2);
        } else {
          const parsed = JSON5.parse(optionsJsonString.value);
          optionsJsonString.value = JSON.stringify(parsed, null, 2);
        }
        error.value = null;
      } catch (e) {
        error.value = `포맷 오류: ${e.message}`;
      }
    };

    const onDataEditorMount = (editor) => {
      dataEditor = editor;
    };

    const onOptionsEditorMount = (editor) => {
      optionsEditor = editor;
    };

    onMounted(() => {
      nextTick(() => {
        loadTemplate(selectedChartType.value);
      });
    });

    return {
      selectedChartType,
      activeTab,
      chartTypeItems,
      chartData,
      chartOptions,
      dataJsonString,
      optionsJsonString,
      editorOptions,
      error,
      chartKey,
      onDataChange,
      onOptionsChange,
      onChartTypeChange,
      resetToTemplate,
      formatJson,
      onDataEditorMount,
      onOptionsEditorMount,
    };
  },
};
</script>

<style lang="scss" scoped>
.playground-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  padding: 20px;
  box-sizing: border-box;
}

.playground-header {
  margin-bottom: 20px;
}

.playground-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #303133;
}

.playground-description {
  font-size: 14px;
  color: #606266;
  margin: 0;
}

.syntax-hint {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 4px;
  font-size: 12px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.chart-type-select {
  width: 180px;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.main-content {
  display: flex;
  flex: 1;
  gap: 20px;
  min-height: 0;
}

.chart-preview {
  flex: 1;
  position: relative;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  overflow: hidden;
}

.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  z-index: 10;
}

.error-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f56c6c;
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.error-text {
  color: #f56c6c;
  font-size: 14px;
  text-align: center;
  max-width: 80%;
  word-break: break-word;
}

.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.editor-tabs {
  display: flex;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}

.tab-button {
  padding: 12px 24px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    color: #409eff;
    background: #f0f7ff;
  }

  &.active {
    color: #409eff;
    background: #fff;

    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: #409eff;
    }
  }
}

.editor-content {
  flex: 1;
  min-height: 0;
}
</style>
