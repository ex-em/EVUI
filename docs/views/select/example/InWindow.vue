<template>
  <div class="case">
    <p class="case-title">Dropbox flip (window 상단 근처) - 기본값 + teleport 비교</p>
    <ev-window
      v-model:visible="isVisible2"
      title="Select near window top"
      width="500px"
      height="320px"
    >
      <div class="window-row">
        <div class="window-cell">
          <label>Default</label>
          <ev-select v-model="selectVal2" :items="manyItems" placeholder="Please select value." />
        </div>
        <div class="window-cell">
          <label>Teleport</label>
          <ev-select
            v-model="selectVal2Teleport"
            :items="manyItems"
            placeholder="Please select value."
            teleport="body"
          />
        </div>
      </div>
      <div class="filler" />
      <div class="description">
        window content 상단에 가까운 select. 기본은 wrapper 내부에서 펼쳐지고,
        <strong>teleport</strong>는 body로 옮겨져 펼쳐진다.
      </div>
    </ev-window>
    <div class="description">
      <button class="btn" @click="clickButton2">click to open window!</button>
    </div>
  </div>

  <div class="case">
    <p class="case-title">Dropbox flip (window 하단 근처) - 기본값 + teleport 비교</p>
    <ev-window
      v-model:visible="isVisible1"
      title="Select near window bottom"
      width="500px"
      height="320px"
    >
      <div class="filler" />
      <div class="window-row">
        <div class="window-cell">
          <label>Default</label>
          <ev-select v-model="selectVal1" :items="manyItems" placeholder="Please select value." />
        </div>
        <div class="window-cell">
          <label>Teleport</label>
          <ev-select
            v-model="selectVal1Teleport"
            :items="manyItems"
            placeholder="Please select value."
            teleport="body"
          />
        </div>
      </div>
      <div class="description">
        window content 하단에 가까운 select. 기본은 window 컨테이너 경계 기준으로 flip 되고,
        <strong>teleport</strong>는 viewport 경계 기준으로 flip 되어 window 밖으로도 펼쳐진다.
      </div>
    </ev-window>
    <div class="description">
      <button class="btn" @click="clickButton1">click to open window!</button>
    </div>
  </div>

  <div class="case">
    <p class="case-title">Draggable / Resizable window + Footer + 기본값 + teleport 비교</p>
    <ev-window
      v-model:visible="isVisible3"
      title="Window with footer (non-scrollable)"
      width="500px"
      height="320px"
      draggable
      resizable
      maximizable
    >
      <div class="filler" />
      <div class="window-row">
        <div class="window-cell">
          <label>Default</label>
          <ev-select v-model="selectVal3" :items="manyItems" placeholder="Please select value." />
        </div>
        <div class="window-cell">
          <label>Teleport</label>
          <ev-select
            v-model="selectVal3Teleport"
            :items="manyItems"
            placeholder="Please select value."
            teleport="body"
          />
        </div>
      </div>
      <div class="description">
        window를 화면 하단까지 드래그해서 옮긴 후 두 select를 각각 열어보세요. 기본은 window 경계에
        맞춰 flip 되고, teleport는 viewport 기준으로 flip 된다.
        <br />
        <br />
      </div>
      <template #footer>
        <div class="window-footer-buttons">
          <ev-button @click="closeWindow3">닫기</ev-button>
        </div>
      </template>
    </ev-window>
    <div class="description">
      <button class="btn" @click="clickButton3">click to open window!</button>
    </div>
  </div>

  <div class="case">
    <p class="case-title">Multiple + Teleport (회귀 가드: tag wrap 시 dropbox 유지)</p>
    <ev-window
      v-model:visible="isVisible4"
      title="Multiple select inside window"
      width="500px"
      height="360px"
    >
      <div class="window-row">
        <div class="window-cell">
          <label>Default Multi</label>
          <ev-select
            v-model="multiDefaultVal"
            :tag-max-rows="3"
            :items="manyItems"
            multiple
            checkable
            filterable
            placeholder="Please select values."
          />
        </div>
        <div class="window-cell">
          <label>Multi Teleport</label>
          <ev-select
            v-model="multiTeleportVal"
            :tag-max-rows="3"
            :items="manyItems"
            multiple
            checkable
            filterable
            placeholder="Please select values."
            teleport="body"
          />
        </div>
      </div>
      <div class="filler" />
      <div class="description">
        <strong>multiple + teleport</strong> 조합. dropbox를 열고 항목을 4~5개 이상 차례로 선택해서
        tag가 두 번째 줄로 <strong>wrap</strong>되는 순간에도 dropbox가 그대로 유지되어 다중 선택
        흐름이 끊기지 않는지 확인 (Default Multi 와 동일하게 유지되어야 함).
      </div>
    </ev-window>
    <div class="description">
      <button class="btn" @click="clickButton4">click to open window!</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const manyItems = ref(
      Array.from({ length: 10 }, (_, i) => ({
        name: `name${i}`,
        value: `value${i}`,
      })),
    );

    const isVisible1 = ref(false);
    const isVisible2 = ref(false);
    const isVisible3 = ref(false);
    const isVisible4 = ref(false);

    const clickButton1 = () => {
      isVisible1.value = true;
    };
    const clickButton2 = () => {
      isVisible2.value = true;
    };
    const clickButton3 = () => {
      isVisible3.value = true;
    };
    const clickButton4 = () => {
      isVisible4.value = true;
    };
    const closeWindow3 = () => {
      isVisible3.value = false;
    };

    const selectVal1 = ref('');
    const selectVal2 = ref('');
    const selectVal3 = ref('');
    const selectVal1Teleport = ref('');
    const selectVal2Teleport = ref('');
    const selectVal3Teleport = ref('');
    const multiDefaultVal = ref([]);
    const multiTeleportVal = ref([]);

    return {
      manyItems,
      isVisible1,
      isVisible2,
      isVisible3,
      isVisible4,
      clickButton1,
      clickButton2,
      clickButton3,
      clickButton4,
      closeWindow3,
      selectVal1,
      selectVal2,
      selectVal3,
      selectVal1Teleport,
      selectVal2Teleport,
      selectVal3Teleport,
      multiDefaultVal,
      multiTeleportVal,
    };
  },
};
</script>

<style lang="scss" scoped>
.window-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 8px 0;
}
.window-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;

  label {
    min-width: 60px;
  }
}
.filler {
  height: 140px;
  background-color: #f5f5f5;
  border: 1px dashed #ccc;
}
.window-footer-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
