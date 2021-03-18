<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-window
      v-model:visible="isVisible1"
      :title="'COMMON TITLE'"
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
      :fullscreen="true"
      :icon-class="'ev-icon-binder'"
    >
      <div>CUSTOM CONTENTS</div>
      <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
      <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
      <template #footer>
        <div>FOOTER</div>
      </template>
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
        :width="'40%'"
        :height="'60%'"
        :hide-scroll="true"
      >
        <template #header>
          <div>
            NESTED TITLE >
          </div>
          <div class="header-right-title">
            CUSTOM TITLE
          </div>
          <span class="header-right-icon">
            <i class="ev-icon-calendar" />
            <i class="ev-icon-shard" />
          </span>
        </template>
        <div>
          NESTED CONTENTS
        </div>
        <template #footer>
          <div>NESTED FOOTER</div>
        </template>
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
  <div class="case">
    <p class="case-title">Hide Dim Layer (Modeless)</p>
    <ev-window
      v-model:visible="isVisible4"
      :title="'COMMON TITLE'"
      :is-modal="false"
    >
      <div>COMMON CONTENTS</div>
    </ev-window>
    <div class="description">
      <button
        class="btn"
        @click="clickButton4"
      >
        click to open window!
      </button>
    </div>
  </div>
  <div class="case">
    <p class="case-title">Hide Scroll</p>
    <ev-window
      v-model:visible="isVisible5"
      :title="'COMMON TITLE'"
      :hide-scroll="true"
    >
      <div>HIDE BODY SCROLL WITH CONTENTS</div>
    </ev-window>
    <div class="description">
      <button
        class="btn"
        @click="clickButton5"
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

    const isVisible4 = ref(false);
    const clickButton4 = () => {
      isVisible4.value = true;
    };

    const isVisible5 = ref(false);
    const clickButton5 = () => {
      isVisible5.value = true;
    };

    return {
      isVisible1,
      clickButton1,
      isVisible2,
      clickButton2,
      isVisible3,
      clickButton3,
      isVisible4,
      clickButton4,
      isVisible5,
      clickButton5,
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

.header-right-title {
  margin-left: 10px;
}
.header-right-icon {
  margin-left: 20px;
}
</style>
