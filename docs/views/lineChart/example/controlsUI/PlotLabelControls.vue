<template>
  <div class="grid">
    <div class="field">
      <span class="label">라벨 표시</span>
      <ev-toggle v-model="label.show" />
    </div>
    <div class="field">
      <span class="label">텍스트(alias)</span>
      <ev-text-field v-model="label.text" />
    </div>
    <div class="field">
      <span class="label">value 표시</span>
      <ev-toggle v-model="label.showValue" />
    </div>
    <div v-if="axis === 'y'" class="field">
      <span class="label">위치(position)</span>
      <ev-select v-model="label.position" :items="positionList" />
    </div>
    <div v-if="axis === 'y'" class="field">
      <span class="label">세로 정렬</span>
      <ev-select v-model="label.verticalAlign" :items="vAlignList" />
    </div>
    <div class="field">
      <span class="label">가로 정렬(textAlign)</span>
      <ev-select v-model="label.textAlign" :items="textAlignList" />
    </div>
    <div class="field">
      <span class="label">말풍선 꼬리 표시</span>
      <ev-toggle v-model="label.pointerShow" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlotLabelControls',
  props: {
    // 부모의 reactive 라벨 상태(직접 v-model로 양방향)
    label: {
      type: Object,
      required: true,
    },
    // 'y' | 'x' — x축은 position/verticalAlign 무시(항상 top), textAlign 만 사용
    axis: {
      type: String,
      default: 'y',
    },
  },
  setup() {
    const positionList = [
      { name: 'outside', value: 'outside' },
      { name: 'innerStart', value: 'innerStart' },
      { name: 'innerEnd', value: 'innerEnd' },
    ];
    const vAlignList = [
      { name: 'top', value: 'top' },
      { name: 'middle', value: 'middle' },
      { name: 'bottom', value: 'bottom' },
    ];
    const textAlignList = [
      { name: 'left', value: 'left' },
      { name: 'center', value: 'center' },
      { name: 'right', value: 'right' },
    ];
    return { positionList, vAlignList, textAlignList };
  },
};
</script>

<style lang="scss" scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 14px 18px;
  align-items: end;
}

.group-subtitle {
  margin: 16px 0 10px;
  padding-top: 12px;
  border-top: 1px dashed #e3e6eb;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #8a8f98;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;

  .label {
    font-size: 12px;
    color: #6b7280;
    white-space: nowrap;
  }

  .ev-text-field,
  .ev-input-number,
  .ev-select {
    width: 100%;
  }
}
</style>
