<template>
  <div class="evui-summary-content">
    <div
      v-for="(menu, index) in computedStore"
      v-show="menu.routerLink !== '/'"
      :key="menu+index"
      class="evui-summary-thumbnail-content"
    >
      <div
        :class="{active: menu.openFlag}"
        class="evui-summary-thumbnail-title"
        @click.stop="openSummaryThumbnail(index)"
      >
        <i class="fas fa-angle-down"/> &nbsp; {{ menu.name }}
      </div>
      <ul
        :class="{active: menu.openFlag}"
        class="evui-summary-thumbnail-ul"
      >
        <li
          v-for="(submenu, index) in menu.children"
          :key="submenu+index"
          class="evui-summary-thumbnail-li"
          @click.stop="$emit('clickSummary', menu.name, submenu.name, index)"
        >
          <router-link :to="submenu.routerLink">
            <div class="evui-summary-thumbnail-box-image">
              <img
                :alt="submenu.name"
                :src="submenu.imgUrl || './guide/images/noImage.png'"
                class="evui-summary-thumbnail-img"
                @error="imgError"
              >
            </div>
            <div>
              <h5> {{ submenu.name }} </h5>
            </div>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    components: {
    },
    props: {
      totalStore: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        menuStore: this.totalStore,
      };
    },
    computed: {
      computedStore: {
        get() {
          return this.menuStore;
        },
        set(store) {
          this.menuStore = store;
        },
      },
    },
    watch: {
    },
    created() {
    },
    methods: {
      openSummaryThumbnail(idx) {
        this.computedStore = this.computedStore.filter((item, index) => {
          if (index === idx) {
            const i = item;
            i.openFlag = !item.openFlag;
          }
          return item;
        });
      },
      imgError(e) {
        e.target.src = './images/noImage.png';
      },
    },
  };
</script>

<style>
  a, span {
    text-decoration: none !important;
  }
  a:visited, a:any-link {
    color: #000;
  }
  .evui-summary-content {
    margin-top: 50px;
  }
  .evui-summary-thumbnail-content {
    margin-bottom: 25px;
  }
  .evui-summary-thumbnail-title {
    height: 25px;
    width: calc(100% - 100px);
    margin-bottom: 10px;
    border-bottom: 2px solid #EBF4FE;
    font-size: 16px;
    font-weight: 800;
    user-select: none;
    cursor: pointer;
  }
  .evui-summary-thumbnail-title > i {
    transition: transform .1s ease-in-out;
  }
  .evui-summary-thumbnail-title.active > i {
    transform: rotate(180deg);
    transition: transform .1s ease-in-out;
  }
  .evui-summary-thumbnail-ul {
    display: flex;
    flex-wrap: wrap;
    margin: 0;
    padding: 0 150px 0 10px;
  }
  .evui-summary-thumbnail-ul.active {
    display: none;
    height: 0px;
    transition: all 0.5s ease-in-out;
  }
  .evui-summary-thumbnail-li {
    list-style: none;
    float: left;
    width: calc(16.6% - 23px);
    margin: 10px;
    /*box-shadow: 0 0 4px 4px rgba(0,0,0,0.1);*/
    word-wrap: break-word;
    transition: opacity 0.5s ease-in-out;
  }
  .evui-summary-thumbnail-li:hover {
    -webkit-transform: scale(1.05);
    transform: scale(1.05);
    cursor: pointer;
  }
  .evui-summary-thumbnail-li h4 {
    padding: 5px 10px 5px 10px;
  }
  .evui-summary-thumbnail-li h5 {
    padding: 5px 10px 5px 10px;
  }
  .evui-summary-thumbnail-box-image img {
    width: 100%;
    height: 150px;
    border: 1px solid #eeeeee;
  }

  @media all and (max-width: 1400px) {
    .evui-summary-thumbnail-li{
      list-style: none;
      width: calc(25% - 23px);
      margin: 10px;
    }
  }
  @media all and (max-width: 900px) {
    .evui-summary-thumbnail-li{
      list-style: none;
      width: calc(50% - 23px);
      margin: 10px;
    }
  }
  @media all and (max-width: 600px) {
    .evui-summary-thumbnail-li{
      list-style: none;
      width: calc(100% - 23px);
    }
  }
</style>

