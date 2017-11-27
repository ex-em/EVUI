<template>
  <div class="navigate">
    <div class="naviTitle">
      <p>Guide Navigate</p>
    </div>

    <ul>
      <li v-for="item in naviList" :key="item.id" @click="toMove(item.name)" :class="{ active: isActive(item.name) }">
        <p>{{item.name}}</p>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    computed: {
      naviList: function(){
        return [
          {
            name: 'ContentA'
          },
          {
            name: 'ContentB'
          }
        ];
      }
    },
    data: function(){
      return {
        activeItem: ''
      }
    },
    methods: {
      toMove: function(name){
        this.$router.push({
          path: '/guide/' + name,
          params: {
            contentName: name
          }
        });
        this.$emit('getVueFile', name);

        this.activeItem = name;
      },
      isActive: function(menuItem) {
        return this.activeItem === menuItem;
      }
    }
  }
</script>


<style scoped>
  .navigate {
    position: absolute;
    width: 250px;
    left:0px;
    top:0px;
    bottom:0px;
    height: 100%;
    overflow: auto;
  }
  .navigate .naviTitle {
    height: 50px;
    border: 1px solid #00baff;
    background: #00baff;
  }
  .navigate .naviTitle > p {
    color: white;
    text-align: center;
  }

  .navigate > ul {
    border: 1px solid #e5e5e5;
    list-style: none;
    margin: 0;
    padding: 0;
    height: calc(100% - 54px);
  }
  .navigate > ul > li {
    cursor: pointer;
    padding: 10px 0px 10px 20px;
    margin: 0;
    height: 20px;
  }
  .navigate > ul > li.active {
    color: #000 !important;
    cursor: default;
    font-weight: bold;
  }
  .navigate > ul > li:hover {
    color: #00baff;
    background-color: #eee;
  }
  .navigate > ul > li > p {
    padding: 0;
    margin: 0;
    font-size: 13px;
  }
</style>
