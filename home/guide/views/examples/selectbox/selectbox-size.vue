<template>
  <div class="selectbox-size">
    <br>

    <!-- Default size-->
    <div>
      <span style="font-size: 14px; font-weight: bold;">1. Default size</span><br><br>
    </div>
    <div style="display: inline-flex; height: 170px;">
      <!-- size small -->
      <div :style="{ display: 'inline-block', flex: 1, maxWidth: '30%' }">
        <span style="font-size: 14px;">size: small</span><br><br>
        <ev-selectbox
          v-model="vModel0"
          :name="'box_0'"
          :size="'small'"
          :multiple="true"
          :init-select-idx="0"
          :items="getItemList()"
        />
        <br><br>
        <span style="font-size: 12px;">value: </span>
        <span style="font-weight: bold; color: blue;">{{ vModel0 }}</span>
      </div>

      <!-- size medium -->
      <div :style="{ display: 'inline-block', flex: 1, maxWidth: '30%', marginLeft: '50px' }">
        <span style="font-size: 14px;">size: medium</span><br><br>
        <ev-selectbox
          v-model="vModel1"
          :name="'box_1'"
          :size="'medium'"
          :multiple="true"
          :init-select-idx="1"
          :items="getItemList()"
        />
        <br><br>
        <span style="font-size: 12px;">value: </span>
        <span style="font-weight: bold; color: blue;">{{ vModel1 }}</span>
      </div>

      <!-- size large -->
      <div :style="{ display: 'inline-block', flex: 1, maxWidth: '30%', marginLeft: '50px' }">
        <span style="font-size: 14px;">size: large</span><br><br>
        <ev-selectbox
          v-model="vModel2"
          :name="'box_2'"
          :size="'large'"
          :multiple="true"
          :init-select-idx="2"
          :items="getItemList()"
        />
        <br><br>
        <span style="font-size: 12px;">value: </span>
        <span style="font-weight: bold; color: blue;">{{ vModel2 }}</span>
      </div>
    </div>

    <!-- Custom size -->
    <div>
      <span style="font-size: 14px; font-weight: bold;">2. Custom size</span><br><br>
    </div>
    <div style="display: inline-flex; height: 180px;">
      <!-- custom size 1 -->
      <div :style="{ display: 'inline-block', flex: 1, maxWidth: '30%' }">
        <span style="font-size: 14px;">
          size: width: {{ customStyle1.width }} / height: {{ customStyle1.height }}
        </span><br><br>
        <ev-selectbox
          :style="customStyle1"
          v-model="vModel3"
          :name="'box_3'"
          :size="'small'"
          :multiple="true"
          :init-select-idx="0"
          :items="getItemList()"
        />
        <br><br>
        <span style="font-size: 12px;">value: </span>
        <span style="font-weight: bold; color: blue;">{{ vModel3 }}</span>
      </div>

      <!-- custom size 2 -->
      <div :style="{ display: 'inline-block', flex: 1, maxWidth: '30%', marginLeft: '50px' }">
        <span style="font-size: 14px;">
          size: width: {{ customStyle2.width }} / height: {{ customStyle2.height }}
        </span><br><br>
        <ev-selectbox
          :style="customStyle2"
          v-model="vModel4"
          :name="'box_4'"
          :multiple="true"
          :init-select-idx="1"
          :items="getItemList()"
        />
        <br><br>
        <span style="font-size: 12px;">value: </span>
        <span style="font-weight: bold; color: blue;">{{ vModel4 }}</span>
      </div>

      <!-- custom size 3 -->
      <div :style="{ display: 'inline-block', flex: 1, maxWidth: '30%', marginLeft: '50px' }">
        <span style="font-size: 14px;">
          size: width: {{ customStyle3.width }} / height: {{ customStyle3.height }}
        </span><br><br>
        <ev-selectbox
          :style="customStyle3"
          v-model="vModel5"
          :name="'box_5'"
          :multiple="true"
          :init-select-idx="2"
          :items="getItemList()"
        />
        <br><br>
        <span style="font-size: 12px;">value: </span>
        <span style="font-weight: bold; color: blue;">{{ vModel5 }}</span>
      </div>
    </div>

    <br><br><br><br><br><br><br><br><br><br><br><br>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        vModel0: '',
        vModel1: '',
        vModel2: '',
        vModel3: '',
        vModel4: '',
        vModel5: '',
        customStyle1: { width: '100px', height: '18px' },
        customStyle2: { width: '200px', height: '80px' },
        customStyle3: { width: '300px', height: '200px' },
      };
    },
    methods: {
      getItemList() {
        let value;
        const itemList = [];

        for (let ix = 0, ixLen = 5; ix < ixLen; ix++) {
          value = `item_${ix}`;

          itemList.push({
            name: value,
            value,
          });
        }

        return itemList;
      },
    },
  };
</script>
<style>
  .selectbox-size {
    width: 100%;
    height: 100%;
    margin-left: 5px;
    padding-top: 10px;
    font-size: 14px;
  }
</style>
