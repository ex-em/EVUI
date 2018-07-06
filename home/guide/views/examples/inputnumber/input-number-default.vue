<template>
  <div>
    <div class="input-demo">
      <h5> # Normal </h5>
      <div>
        <input-number
          :value="2"
        />
      </div>
      <h5> # Disable </h5>
      <div>
        <input-number
          :value="3"
          :disabled="true"
        />
      </div>
      <h5> # Read Only </h5>
      <div>
        <input-number
          :value="2"
          :readonly="true"
        />
      </div>

      <h5> # Variation </h5>

      <div class="input-demo-multi">
        <input-number
          :readonly="true"
          :value="0.5"
          width="30%"
        />
        <input-number
          :readonly="true"
          :value="-0.5"
          width="30%"
        />
      </div>
      <div>
        <input-number
          :value="Infinity"
          width="70%"
        />
      </div>
      <div>
        <input-number
          :value="-Infinity"
          width="120%"
        />
      </div>
      <h5> # Step </h5>

      <div class="input-demo-multi">
        <div>
          <input-number
            :step="12"
            :value="50"
          />
          <p> step: 12</p>
        </div>
        <div>
          <input-number
            :value="2.021"
            :precision="4"
            :step="0.01"
          />
          <p> step: 0.01</p>
        </div>
        <div>
          <input-number
            :value="-0.021"
            :precision="4"
            :step="0.0011"
          />
          <p> step: 0.0011</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import checkbox from '@/components/checkbox/checkbox';
  import inputNumber from '@/components/input/input.number';

  export default {
    components: {
      checkbox,
      inputNumber,
    },
    data() {
      return {
      };
    },
  };
</script>
<style scoped>
  div{
    padding: 3px;
  }
  p{
    margin: 2px;
  }
  .input-demo {
    width: 30%
  }
  .input-demo-multi {
    display: inline-block;
  }
</style>
