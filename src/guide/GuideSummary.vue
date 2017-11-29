<template>
    <div class="guide-summary">
        <h1>Examples</h1>
        {{ evuiDesc }}
        <div v-for="item, i in summaryBoxItems" :key="item.name">
            <div class="summary-title" >
                <div class="summary-title-name" @click.stop="toggledItem(i)" :class="{ active: item.openToggle }"><div>{{item.name}}</div></div>
            </div>

            <ul class="summary-box-ul" v-show="item.children">
                <li class="summary-box-li" v-for="subItem in item.children" @click.stop="toMove(subItem.name)">
                    <div class="summary-box-image">
                        <img v-bind:src="subItem.imgSrc" onerror="this.src='/src/images/summary/noImage.png';" alt="logo">
                    </div>
                    <h3>{{subItem.name}}</h3>
                    <h4>{{subItem.content}}</h4>
                </li>
            </ul>
        </div>

        <div class="summary-list">
            <div class="summary-title">
                <div class="summary-title-name"><div>Example List</div></div>
            </div>

            <ul class="summary-box-ul">
                <li class="summary-box-li">
                    <div class="summary-box-image">
                        <img src="/src/images/logo.png" alt="logo">
                    </div>
                    <h3>LOGO</h3>
                </li>
                <li class="summary-box-li">
                    <div class="summary-box-image">
                        <img src="/src/images/logo.png" alt="logo">
                    </div>
                    <h3>LOGO</h3>
                </li>
                <li class="summary-box-li">
                    <div class="summary-box-image">
                        <img src="/src/images/logo.png" alt="logo">
                    </div>
                    <h3>LOGO</h3>
                </li>
                <li class="summary-box-li">
                    <div class="summary-box-image">
                        <img src="/src/images/logo.png" alt="logo">
                    </div>
                    <h3>LOGO</h3>
                </li>
                <li class="summary-box-li">
                    <div class="summary-box-image">
                        <img src="/src/images/logo.png" alt="logo">
                    </div>
                    <h3>LOGO</h3>
                </li>
                <li class="summary-box-li">
                    <div class="summary-box-image">
                        <img src="/src/images/logo.png" alt="logo">
                    </div>
                    <h3>LOGO</h3>
                </li>
                <li class="summary-box-li">
                    <div class="summary-box-image">
                        <img src="/src/images/logo.png" alt="logo">
                    </div>
                    <h3>LOGO</h3>
                </li>
                <li class="summary-box-li">
                    <div class="summary-box-image">
                        <img src="/src/images/logo.png" alt="logo">
                    </div>
                    <h3>LOGO</h3>
                </li>
                <li class="summary-box-li">
                    <div class="summary-box-image">
                        <img src="/src/images/logo.png" alt="logo">
                    </div>
                    <h3>LOGO</h3>
                </li>
            </ul>
        </div>

    </div>
</template>

<script>
    export default {
        data: function() {
            return {
                evuiDesc: `EVUI는 웹페이지의 핵심 구성요소인 Grid/Chart 컴포넌트를 제공하는 UI 프레임워크입니다.
                       EVUI Grid와 Chart는 HTML/CSS/JS 및 SVG로 구현되어 있어 다양한 환경에 적용이 가능하며,
                       Vue.JS를 기반으로 구현되어 대량의 데이터를 고속으로 처리합니다.`,
                noImageURL: '/src/images/summary/noImage.png',
                summaryBoxItems: '' // eventBus를 사용하여 GuiddNav.vue의 storeItem값을 저장하는 data
            }
        },
        watch: {
        },
        methods: {
            toggledItem(index) {
                let targetDisplay = event.currentTarget.parentElement.parentElement.children[1].style.display;
                if(targetDisplay == 'none') {
                    event.currentTarget.parentElement.parentElement.children[1].style.display = '';
                } else {
                    event.currentTarget.parentElement.parentElement.children[1].style.display = 'none';
                }
                this.changeActive(index);
            },
            changeActive: function(index) {
                this.summaryBoxItems[index].openToggle = !this.summaryBoxItems[index].openToggle;
            },
            toMove: function(name) {
                this.$router.push({
                    path: '/guide/' + name,
                    params: {
                        contentName: name
                    }
                });
            }
        },
        created() {
            this.$root.$eventBus.$on('guideNavData', function(storeItem) {
                this.summaryBoxItems = storeItem;
            }.bind(this));
        }
    }
</script>

<style scoped>
    .guide-summary{
        padding: 20px;
    }
    .summary-list{
        margin-top: 10px;
        margin-bottom: 10px;
    }
    .summary-title{
        margin: 10px 10px 10px 10px;
        padding: 0 0 3px 0;
        border-bottom: 2px solid #00baff;
    }

    .summary-title-name{
        background-image: url("/src/images/xm_icon_v1.png");
        background-position: -114px -569px;
        width: 20px;
        height: 20px;
        cursor: pointer;
    }
    .summary-title-name.active{
        background-image: url("/src/images/xm_icon_v1.png");
        background-position: -114px -553px;
        width: 20px;
        height: 20px;
        cursor: pointer;
    }
    .summary-title-name div{
        padding-top: 3px;
        padding-left: 20px;
        width: 200px;
    }

    .summary-box-ul{
        display: flex;
        flex-wrap: wrap;
        margin: 0;
        padding: 0 0px 0 10px;
    }
    .summary-box-ul:after{
        flex: auto;
    }
    .summary-box-li{
        list-style: none;
        float: left;
        width: calc(16.6% - 23px);
        margin: 10px;
        box-shadow: 0 0 4px 4px rgba(0,0,0,0.1);
    }
    .summary-box-li:hover{
        -webkit-transform: scale(1.05);
        transform: scale(1.05);
        cursor: pointer;
    }
    .summary-box-li h3{
        padding-left: 10px;
    }
    .summary-box-li h4{
        padding-left: 10px;
    }
    .summary-box-image{

    }
    .summary-box-image img{
        border: 1px solid #eeeeee;
        object-fit: cover;
        width: 100%;
        height: 100%;
        height: 150px;
        margin-left: -1px;
        margin-top: -1px;
    }

    @media all and (max-width: 1400px) {
        .summary-box-li{
            list-style: none;
            width: calc(25% - 23px);
            margin: 10px;
        }
    }

    @media all and (max-width: 900px) {
        .summary-box-li{
            list-style: none;
            width: calc(50% - 23px);
            margin: 10px;
        }
    }

    @media all and (max-width: 600px) {
        .summary-box-li{
            list-style: none;
            width: calc(100% - 23px);
        }
    }
</style>
