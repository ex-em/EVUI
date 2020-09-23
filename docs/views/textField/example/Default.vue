<template>
  <div class="case">
    <p class="case-title">Common</p>
    <EvTextfield
      v-model="textfield1"
      placeholder="Please enter the content"
      type="text"
      width="230px"
      height="35px"
    />
    <div class="description">
      <span class="badge yellow">
        type="text"
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
      type="text"
      width="230px"
      height="35px"
      readonly
    />
  </div>

  <div class="case">
    <p class="case-title">Disabled</p>
    <EvTextfield
      v-model="textfield3"
      type="text"
      width="230px"
      height="35px"
      disabled
    />
  </div>

  <div class="case">
    <p class="case-title">Clearable</p>
    <EvTextfield
      v-model="textfield4"
      placeholder="Please enter the content"
      type="text"
      width="230px"
      height="35px"
      clearable
    />
  </div>

  <div class="case">
    <p class="case-title">Max Length</p>
    <div style="display: flex;">
      <EvTextfield
        v-model="textfield5"
        placeholder="Please enter the content"
        type="text"
        width="230px"
        height="35px"
        :maxLength="3"
      />
      <EvTextfield
        v-model="textfield5"
        placeholder="Please enter the content"
        type="text"
        width="230px"
        height="35px"
        :maxLength="3"
        show-max-length
      />
    </div>
  </div>

  <div class="case">
    <p class="case-title">Error Message</p>
    <div style="display: flex;">
      <EvTextfield
        placeholder="Please enter the content"
        type="text"
        width="230px"
        height="35px"
        error-msg="Error Message"
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
    const textfield5 = ref();
    return {
      textfield1,
      textfield2,
      textfield3,
      textfield4,
      textfield5,
    };
  },
};
</script>

<style lant="scss">
.case .ev-textfield {
  margin-right: 15px;
}
</style>
