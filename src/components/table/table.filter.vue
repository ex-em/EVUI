<template>
  <div
    ref="myModal"
    class="modal"
  >
    <!-- Modal content -->
    <div class="modal-content">
      <span
        class="close"
        @click="doClose"
      >
        &times;
      </span>
      <div>
        <span>Columns</span>
        <select>
          <option>test</option>
        </select>
        <input
          type="radio"
        > OR
        <input
          type="radio"
        > AND
        <button>
          Add Conditions
        </button>
      </div>
      <div>
        <span>Condition</span>
        <select>
          <option>test</option>
        </select>
        <span>Value</span>
        <select>
          <option>test</option>
        </select>
        <button>
          Clear All
        </button>
      </div>
    </div>
  </div>
</template>
<script>
  import test from '@/components/table/table';

  export default {
    components: {
      test,
    },
    data() {
      return {
        columns: [
          { field: 'column', caption: 'Column', sortable: true },
          { field: 'condition1', caption: 'OR/AND', sortable: true },
          { field: 'condition2', caption: 'Condition', sortable: true },
          { field: 'value', caption: 'Value', sortable: true },
        ],
        rowData: [],
      };
    },
    methods: {
      doOpen() {
        this.$refs.myModal.style.display = 'block';
      },
      doClose() {
        this.$refs.myModal.style.display = 'none';
      },
    },
  };
</script>
<style>
  /* The Modal (background) */
  .modal {
    display: none; /* Hidden by default */
    position: fixed; /* Stay in place */
    z-index: 850; /* Sit on top */
    padding-top: 100px; /* Location of the box */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: rgb(0,0,0); /* Fallback color */
    background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
  }

  /* Modal Content */
  .modal-content {
    background-color: #fefefe;
    margin: auto;
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
  }

  /* The Close Button */
  .close {
    color: #aaaaaa;
    float: right;
    font-size: 14px;
    font-weight: bold;
  }

  .close:hover,
  .close:focus {
    color: #000;
    text-decoration: none;
    cursor: pointer;
  }
</style>
