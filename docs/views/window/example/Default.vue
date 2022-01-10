<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-window
      v-model:visible="isVisible1"
      title="WINDOW TITLE"
    >
      <div>visible prop을 통해 윈도우를 여닫을 수 있습니다.</div>
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
    <p class="case-title">Nested</p>
    <ev-window
      v-model:visible="isVisible2"
      title="WINDOW TITLE"
      icon-class="ev-icon-binder"
      fullscreen
    >
      <template #header>
        <p class="nested-btn">
          #header slot을 활용하여 상단 타이틀 영역을 변경할 수 있습니다.
          <span class="header-right-icon">
            <i class="ev-icon-moon" />
            <i class="ev-icon-shard" />
          </span>
        </p>
      </template>
      <div>
        window를 중첩하여 사용할 수 있습니다.<br/>
        하단 버튼을 통해 중첩 window를 열어보세요!
      </div>
      <span class="height-box"/>
      <button
        class="nested-btn"
        @click="clickButton3"
      >
        click to nested window!
      </button>
      <span class="height-box" />
      <div>default slot의 길이가 길어질 경우 window 중앙에 스크롤이 생깁니다.</div>
      <span class="height-box" />
      <template #footer>
        <div>#footer slot을 활용하여 하단 콘텐츠를 넣을 수 있습니다.</div>
      </template>
    </ev-window>
    <ev-window
      v-model:visible="isVisible3"
      title="[NESTED] WINDOW TITLE"
      icon-class="ev-icon-pig"
      width="40%"
      height="60%"
    >
      <div>
        NESTED CONTENTS
      </div>
      <template #footer>
        <div>NESTED FOOTER</div>
      </template>
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
      title="WINDOW TITLE"
      :is-modal="false"
    >
      <div>is-modal prop을 활용하여 window 아래 modal 레이어를 지울 수 있습니다.</div>
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
    <p class="case-title">Block Hide Scroll</p>
    <ev-window
      v-model:visible="isVisible5"
      title="WINDOW TITLE"
      :hide-scroll="false"
    >
      <div>hide-scroll prop을 활용하여 body의 스크롤을 보이게 할 수 있습니다.</div>
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
  <div class="case">
    <p class="case-title">Draggable / Resizable / Maximizable</p>
    <ev-window
      v-model:visible="isVisible6"
      title="첫번째 WINDOW"
      draggable
      resizable
      maximizable
      @mousedown="mousedown"
      @mousedown-mouseup="mouseup"
      @mousedown-mousemove="mousemove"
      @resize="resize"
    >
      <div>
        Draggable & Resizable & Maximizable 기능을 사용할 수 있습니다.
      </div>
      <span class="height-box" />
      <button
        class="nested-btn"
        @click="clickButton7"
      >
        click to open nested window!
      </button>
    </ev-window>
    <ev-window
      v-model:visible="isVisible7"
      title="[NESTED] 두번째 WINDOW"
      width="80vw"
      height="30vh"
      min-width="50vw"
      min-height="30vh"
      draggable
      resizable
      maximizable
    >
      <button
        class="nested-btn"
        @click="clickButton8"
      >
        click to open nested window!
      </button>
    </ev-window>
    <ev-window
      v-model:visible="isVisible8"
      title="[NESTED] 세번째 WINDOW"
      :is-modal="false"
      :hide-scroll="false"
      width="30vw"
      height="40vh"
      draggable
      resizable
      maximizable
    >
      <div>WINDOW CONTENTS</div>
    </ev-window>

    <div class="description">
      <button
        class="btn"
        @click="clickButton6"
      >
        click to open window!
      </button>
    </div>
  </div>

  <div class="case">
    <p class="case-title">Esc Key Close</p>
    <!--Window 1개-->
    <ev-window
      v-model:visible="isVisible10"
      title="Esc Close Available Window"
      :esc-close="true"
    >
      <div>esc-close prop을 통해 윈도우를 여닫을 수 있습니다.</div>
    </ev-window>

    <!--Window 여러개-->
    <ev-window
      v-model:visible="isVisible11[0]"
      title="첫번째 Window"
      :esc-close="true"
      maximizable
      fullscreen
    >
      <div>
        Nested + Maximizable Window
        <br />
        <button class="nested-btn">
          Esc key로 닫을 수 있습니다.
        </button>
      </div>
    </ev-window>
    <ev-window
      v-model:visible="isVisible11[1]"
      title="두번째 Window"
      :esc-close="true"
      width="85%"
      height="85%"
      resizable
    >
      <div>
        Resizable Window
        <br />
        <button class="nested-btn">
          Esc key로 닫을 수 있습니다.
        </button>
      </div>
    </ev-window>
    <ev-window
      v-model:visible="isVisible11[2]"
      title="세번째 Window"
      :esc-close="true"
      :is-modal="false"
      width="70%"
      height="70%"
      draggable
    >
      <div>
        Draggable Window
        <br />
        <button class="nested-btn">
          Esc key로 닫을 수 있습니다.
        </button>
      </div>
    </ev-window>
    <ev-window
      v-model:visible="isVisible11[3]"
      title="네번째 Window"
      :esc-close="isEscClose"
      width="60%"
      height="60%"
      draggable
    >
      <div>
        Draggable Window
        <div class="esc-close-toggle-box">
          <label>
            esc-close prop 토글
            <ev-icon icon="ev-icon-allow2-right" />
          </label>
          <ev-toggle
            v-model="isEscClose"
            @change="changeEscClose"
          />
        </div>
        <p class="nested-btn">
          가장 상단에 위치한 Window의 esc-close prop가 false인 경우,
          <strong>수동으로 닫은 후</strong>에 아래에 있는 Window를 Esc 키로 닫을 수 있습니다.
        </p>
      </div>
    </ev-window>

    <div class="description">
      <button
        class="btn"
        @click="clickButton10"
      >
        click to open window!
      </button>
      <br />
      <br />
      <button
        class="btn"
        @click="clickButton11"
      >
        click to open different types of windows!
      </button>
    </div>
  </div>
  <div class="case">
    <p class="case-title">Increase z-index</p>
    <ev-window
        v-model:visible="isVisible13"
        title="Increase z-index"
        :is-modal="false"
        :esc-close="true"
        :increase-z-index-on-click="false"
        maximizable
        fullscreen
    >
      <div>
        <p>
          <i class="ev-icon-moon" />
          쌓여있는 Window를 클릭하면 가장 상단에 배치됩니다.
          <br/>
          <i class="ev-icon-moon" />
          해당 Window는 increase-z-index-on-click prop의 값이 false여서 클릭해도 상단으로 배치되지 않습니다.
          <br/>
          <i class="ev-icon-moon" />
          Esc 키로 Window를 닫을 수 있습니다.
        </p>
        <ev-window
          v-for="(_, idx) in isVisible12"
          :key="idx"
          v-model:visible="isVisible12[idx]"
          :title="`No. ${idx + 1}`"
          :is-modal="false"
          :esc-close="true"
          draggable
          width="300px"
          height="300px"
          :style="{
        transform: randomPositions[idx],
      }"
        >
          <div
            :style="{
          backgroundColor: randomColors[idx],
          width: '100%',
          height: '100%',
        }"
          ></div>
        </ev-window>
      </div>
    </ev-window>
    <div class="description">
      <button
        class="btn"
        @click="clickButton13"
      >
        click to open window!
      </button>
    </div>
  </div>
</template>

<script>
import { nextTick, ref, watch } from 'vue';

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

    const isVisible6 = ref(false);
    const clickButton6 = () => {
      isVisible6.value = true;
    };

    const isVisible7 = ref(false);
    const clickButton7 = () => {
      isVisible7.value = true;
    };

    const isVisible8 = ref(false);
    const clickButton8 = () => {
      isVisible8.value = true;
    };

    // Test
    const isVisible9 = ref(false);
    const clickButton9 = () => {
      isVisible9.value = true;
    };

    const isVisible10 = ref(false);
    const clickButton10 = () => {
      isVisible10.value = true;
    };

    const isVisible11 = ref([false, false, false, false]);
    const clickButton11 = () => {
      for (let i = 0; i < isVisible11.value.length; i++) {
        isVisible11.value[i] = true;
      }
    };

    const isVisible12 = ref([
      false, false, false, false, false,
      false, false,
    ]);

    const randomColors = Array(isVisible12.value.length)
      .fill(null)
      .map(() => `rgb(${Math.floor(255 * Math.random())}, ${Math.floor(255 * Math.random())}, ${Math.floor(255 * Math.random())})`);
    const randomPositions = Array(isVisible12.value.length)
      .fill(null)
      .map(() => `translate(${Math.floor(400 * (Math.random() - 0.5))}px, ${Math.floor(400 * (Math.random() - 0.5))}px)`);

    const isVisible13 = ref(false);
    const clickButton13 = () => {
      isVisible13.value = true;
    };

    watch(isVisible13, (isVisible) => {
      nextTick(() => {
        for (let i = 0; i < isVisible12.value.length; i++) {
          isVisible12.value[i] = isVisible;
        }
      });
    });

    const isEscClose = ref(false);
    const changeEscClose = (newValue) => {
      isEscClose.value = newValue;
    };

    const mousedown = clickedInfo => console.log('mousedown', clickedInfo);
    const mouseup = event => console.log('mousedown-mouseup', event);
    const mousemove = clickedInfo => console.log('mousedown-mousemove', clickedInfo);
    const resize = (event, positionInfo) => console.log('resize', event, positionInfo);

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
      isVisible6,
      clickButton6,
      isVisible7,
      clickButton7,
      isVisible8,
      clickButton8,
      isVisible9,
      clickButton9,
      isVisible10,
      clickButton10,
      isVisible11,
      clickButton11,
      isVisible12,
      randomColors,
      randomPositions,
      isVisible13,
      clickButton13,
      isEscClose,
      changeEscClose,
      mousedown,
      mouseup,
      mousemove,
      resize,
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
.height-box {
  display: block;
  height: 300px;
  background-color: #F5F5F5;
}
.header-right-title {
  margin-left: 10px;
}
.header-right-icon {
  margin-left: 20px;
}
.esc-close-toggle-box {
  display: flex;

  & > * {
    margin-right: 5px;
  }
}
</style>
