<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-textfield
      v-model="textfield1"
      placeholder="Please enter the content"
      type="textarea"
    />
    <div class="description">
      <span class="badge yellow">
        type="textarea"
      </span>
      <span class="badge">
        Textfield Value
      </span>
      {{ textfield1 }}
    </div>
  </div>

  <div class="case">
    <p class="case-title">Readonly</p>
    <ev-textfield
      v-model="textfield2"
      type="textarea"
      readonly
    />
  </div>

  <div class="case">
    <p class="case-title">Disabled</p>
    <ev-textfield
      v-model="textfield3"
      type="textarea"
      disabled
    />
  </div>

  <div class="case">
    <p class="case-title">Max Length</p>
    <div style="display: flex;">
      <ev-textfield
        v-model="textfield4"
        placeholder="Please enter the content"
        type="textarea"
        :max-length="10"
      />
      <ev-textfield
        v-model="textfield4"
        placeholder="Please enter the content"
        type="textarea"
        :max-length="10"
        show-max-length
      />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const textfield1 = ref();
    const textfield2 = ref('Read Only Content');
    const textfield3 = ref('Disabled Content');
    const textfield4 = ref();

    return {
      textfield1,
      textfield2,
      textfield3,
      textfield4,
    };
  },
};
</script>
