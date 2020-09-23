<template>
  <div class="case">
    <p class="case-title">Common</p>
    <EvTextfield
      v-model="textfield1"
      placeholder="Please enter the content"
      type="textarea"
      width="350px"
      height="80px"
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
    <EvTextfield
      v-model="textfield2"
      type="textarea"
      width="350px"
      height="80px"
      readonly
    />
  </div>

  <div class="case">
    <p class="case-title">Disabled</p>
    <EvTextfield
      v-model="textfield3"
      type="textarea"
      width="350px"
      height="80px"
      disabled
    />
  </div>

  <div class="case">
    <p class="case-title">Max Length</p>
    <div style="display: flex;">
      <EvTextfield
        v-model="textfield4"
        placeholder="Please enter the content"
        type="textarea"
        width="350px"
        height="80px"
        :maxLength="10"
      />
      <EvTextfield
        v-model="textfield4"
        placeholder="Please enter the content"
        type="textarea"
        width="350px"
        height="80px"
        :maxLength="10"
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
