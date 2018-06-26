<template>
  <div class="evui-codebox">
    <div class="evui-codebox-demo">
      123
    </div>
    <div class="evui-codebox-split"/>
    <div class="evui-codebox-code">
      <div class="evui-codebox-code-rest">
        123
      </div>
      <div class="evui-codebox-showcode">
        <button
          type="button"
          class="evui-code-showcode-button"
        >
          <span>show code</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    model: {
    },
    props: {
      store: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        selectedMenu: {
          parentName: '',
          name: '',
          index: '',
        },
      };
    },
    computed: {
    },
    methods: {
      initSelectedMenu() {
        this.selectedMenu.parentName = '';
        this.selectedMenu.name = '';
        this.selectedMenu.index = '';
      },
      setSelectedMenu(parentMenu, childMenu, childIndex) {
        this.selectedMenu.parentName = parentMenu;
        this.selectedMenu.name = childMenu;
        this.selectedMenu.index = childIndex;
      },
    },
  };
</script>

<style scoped>
  .evui-codebox {
    border: 1px solid #eeeeee;
    border-radius: 6px;
    display: block;
    height: auto;
  }
  .evui-codebox-demo {
    display: block;
    width: 100%;
    padding: 20px 0 20px 0;
  }
  .evui-codebox-split {
    width: 100%;
    display: block;
    border: 1px dashed #eeeeee;
  }
  .evui-codebox-code {
    height: 30px;
    display: block;
    width: 100%;
  }
  .evui-codebox-code-rest {
    opacity: 0;
  }
  .evui-codebox-showcode {
    position: absolute;
    text-align: center;
    cursor: pointer;
    line-height: 18px;
  }
  .evui-codebox-showcode-button {
    position: relative;
    top: 4px;
    z-index: 2;
    background-color: transparent;
    outline: 0;
    display: inline-block;
    text-align: center;
    vertical-align: middle;
    cursor: pointer;
    border: 1px solid transparent;
    white-space: nowrap;
  }
</style>
