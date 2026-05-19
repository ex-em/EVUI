<template>
  <div class="case">
    <p class="case-title">Dropbox flip (window 상단 근처) - 기본값</p>
    <ev-window
      v-model:visible="isVisible2"
      title="Select near window top"
      width="500px"
      height="320px"
    >
      <div class="window-row">
        <label>Top Select</label>
        <ev-select v-model="selectVal2" :items="manyItems" placeholder="Please select value." />
      </div>
      <div class="filler" />
      <div class="description">
        window content 상단에 가까운 select. 위로 펼칠 공간이 부족하므로
        <strong>아래쪽으로 펼쳐져야</strong> 한다.
      </div>
    </ev-window>
    <div class="description">
      <button class="btn" @click="clickButton2">click to open window!</button>
    </div>
  </div>

  <div class="case">
    <p class="case-title">Dropbox flip (window 하단 근처)</p>
    <ev-window
      v-model:visible="isVisible1"
      title="Select near window bottom"
      width="500px"
      height="320px"
    >
      <div class="filler" />
      <div class="window-row">
        <label>Bottom Select</label>
        <ev-select v-model="selectVal1" :items="manyItems" placeholder="Please select value." />
      </div>
      <div class="description">
        window content 하단에 가까운 select. 옵션 레이어가 viewport에는 들어가도 window 컨테이너
        하단을 넘기면 <strong>위쪽으로 펼쳐져야</strong> 한다.
      </div>
    </ev-window>
    <div class="description">
      <button class="btn" @click="clickButton1">click to open window!</button>
    </div>
  </div>

  <div class="case">
    <p class="case-title">Draggable / Resizable window + Footer + Select</p>
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
        <label>Select</label>
        <ev-select v-model="selectVal3" :items="manyItems" placeholder="Please select value." />
      </div>
      <div class="description">
        window를 화면 하단까지 드래그해서 옮긴 후 select를 열어보세요. viewport 하단과 window 하단
        모두에 의해 flip 이 결정되어야 한다.
        <br />
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

    const clickButton1 = () => {
      isVisible1.value = true;
    };
    const clickButton2 = () => {
      isVisible2.value = true;
    };
    const clickButton3 = () => {
      isVisible3.value = true;
    };
    const closeWindow3 = () => {
      isVisible3.value = false;
    };

    const selectVal1 = ref('');
    const selectVal2 = ref('');
    const selectVal3 = ref('');

    return {
      manyItems,
      isVisible1,
      isVisible2,
      isVisible3,
      clickButton1,
      clickButton2,
      clickButton3,
      closeWindow3,
      selectVal1,
      selectVal2,
      selectVal3,
    };
  },
};
</script>

<style lang="scss" scoped>
.window-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 0;

  label {
    min-width: 100px;
  }
}
.filler {
  height: 140px;
  background-color: #f5f5f5;
  border: 1px dashed #ccc;

  &.tall {
    height: 600px;
  }
}
.window-footer-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
