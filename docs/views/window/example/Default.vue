<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-window
      v-model:visible="isVisible1"
    >
      <div>COMMON CONTENTS</div>
    </ev-window>
    <div class="description">
      <button
        class="btn"
        @click="clickButton1"
      >
        click to open window!
      </button>
    </div>
  </div>
  <div class="case">
    <p class="case-title">Custom</p>
    <ev-window
      v-model:visible="isVisible2"
      :title="'CUSTOM TITLE'"
      :width="'100%'"
      :icon-class="'ev-icon-binder'"
    >
      <div>CUSTOM CONTENTS</div>
      <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
      <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
      <button
        class="nested-btn"
        @click="clickButton3"
      >
        click to nested window!
      </button>
      <ev-window
        v-model:visible="isVisible3"
        :title="'NESTED TITLE'"
        :icon-class="'ev-icon-info2'"
      >
        NESTED CONTENTS
      </ev-window>
      <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
      <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
      <div>CUSTOM CONTENTS</div>
    </ev-window>
    <div class="description">
      <button
        class="btn"
        @click="clickButton2"
      >
        click to open window!
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const isVisible1 = ref(false);
    const clickButton1 = () => {
      isVisible1.value = true;
    };

    const isVisible2 = ref(false);
    const clickButton2 = () => {
      isVisible2.value = true;
    };

    const isVisible3 = ref(false);
    const clickButton3 = () => {
      isVisible3.value = true;
    };

    return {
      isVisible1,
      clickButton1,
      isVisible2,
      clickButton2,
      isVisible3,
      clickButton3,
    };
  },
};
</script>

<style lang="scss">
@import '../../../style/index.scss';

.nested-btn {
  padding: 4px 7px;
  outline: none;
  cursor: pointer;
  background-color: rgba($color-yellow, 0.5);
  border: 1px solid $color-yellow;

  @include themify() {
    color: themed('font-color-base');
  }
  &:hover {
    background-color: $color-yellow;
  }
}
</style>
