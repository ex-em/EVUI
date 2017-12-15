<template>
    <div class="navigate">
        <div class="naviTitle" v-on:click="toMove('')">
            <p>EVUI - Demo</p>
        </div>

        <ul v-for="item in this.storeItem">
            <tree-tag v-bind:treeProps="item"></tree-tag>
        </ul>

    </div>
</template>

<script>
    var treeTemplate =  '<li>';
    treeTemplate +=         '<div v-on:click.stop="showHideToggle(treeProps.name, treeProps.fileName)" v-bind:class="{ active: open, selected: select }">';
//    treeTemplate +=             '<div v-if="isFolder && open" class="minusFolder"></div>'
//    treeTemplate +=             '<div v-else-if="isFolder && !open" class="plusFolder"></div>'
//    treeTemplate +=             '<div v-else class="endFolder"></div>'
    treeTemplate +=             '<span>{{treeProps.name}}</span>'
    treeTemplate +=         '</div>'
    treeTemplate +=         '<ul v-show="open">';
    treeTemplate +=             '<tree-tag v-for=\"childProps in treeProps.children\" v-bind:key="childProps.name" v-bind:treeProps=\"childProps\"></tree-tag>';
    treeTemplate +=         '</ul>';
    treeTemplate +=     '</li>';

    export default {
        name: 'guideNavName',
        data: function () {
            return {
                storeItem: [
                    {
                        name: 'Grid',
                        children: [
                            {
                                name: 'Column Order',
                                fileName: 'GridColumnOrder',
                                content: '선택한 컬럼을 기준으로 오름차순/내림차순 정렬 기능을 제공합니다.'
                            },
                            {
                                name: 'Column Visible',
                                fileName: 'GridColumnVisible',
                                content: '컬럼 별 show/hide 기능을 제공합니다.'
                            },
                            {
                                name: 'Column Resize',
                                fileName: 'GridColumnResize',
                                content: '컬럼의 넓이를 변경할 수 있는 기능을 제공합니다.'
                            },
                            {
                                name: 'Column Move',
                                fileName: 'GridColumnMove',
                                content: '컬럼 간의 위치를 이동할 수 있는 기능을 제공합니다.'
                            },
                            {
                                name: 'Column Filter',
                                fileName: 'GridColumnFilter',
                                content: '컬럼 별 Filter 기능을 제공합니다.'
                            }
                        ],
                    },
                    {
                        name: 'Tree',
                        children: [
                            {
                                name: 'Column Visible',
                                fileName: 'TreeColumnVisible',
                                content: '컬럼 별 show/hide 기능을 제공합니다.'
                            },
                            {
                                name: 'Column Resize',
                                fileName: 'TreeColumnResize',
                                content: '컬럼의 넓이를 변경할 수 있는 기능을 제공합니다.'
                            }
//                            {
//                                name: 'Column Move',
//                                fileName: 'TreeColumnMove',
//                                content: 'Column Move Option'
//                            },
//                            {
//                                name: 'Column Filter',
//                                fileName: 'TreeColumnFilter',
//                                content: 'Column Filter Option'
//                            }
                        ],
                    },
                    {
                        name: 'Chart',
                        children: [
                            {
                                name: 'Line Chart',
                                fileName: 'ChartLine',
                                content: '꺽은 선형 차트는 일정한 시간의 흐름이나 간격으로 연속적 데이터를 표현합니다.'
                            },
                            {
                                name: 'Scatter Chart',
                                fileName: 'ChartScatter',
                                content: '분산형 차트는 데이터 집합 간의 유사점 및 차이를 표현합니다.'
                            },
                            {
                                name: 'Bar Chart',
                                fileName: 'ChartBar',
                                content: '세로 막대형 차트는 개별 데이터 값을 시간의 흐름이나 여러 범주의 추세를 표현합니다. '
                            },
                            {
                                name: 'Stack Bar Chart',
                                fileName: 'ChartStackBar',
                                content: '누적 세로 막대형 차트는 데이터의 합계를 표현합니다.'
                            },
                            {
                                name: 'Column Bar Chart',
                                fileName: 'ChartOrderBar',
                                content: '묶은 세로 막대형 차트는 여러 데이터 계열를 한 범주에 묶어 표현합니다.'
                            },
                            {
                                name: 'Pie Chart',
                                fileName: 'ChartPie',
                                content: '원형 차트는 각 값이 합계에서 차지하는 비율을 표현합니다.'
                            }
                        ]
                    }
                ]
            }
        },
        methods: {
            toMove: function (name) {
                this.$router.push({
                    path: '/guide/' + name,
                    params: {
                        contentName: name
                    }
                });
                this.$emit('getVueFile', name);
            },
        },
        mounted() {
            this.$root.$eventBus.$emit('guideNavData', this.storeItem);
        }
    }

    import Vue from 'vue';

    Vue.component('treeTag', {
        data: function () {
            return {
                open: true,
                select: false
            }
        },
        template: treeTemplate,
        props: ['treeProps'],
        computed: {
            isFolder: function () {
                return this.$props.treeProps.children && this.$props.treeProps.children.length;
            },
        },
        methods: {
            showHideToggle: function (name, fileName) {
                if(event && event.currentTarget.parentElement.children[1].localName == 'ul') {
                    let tag = event.currentTarget.parentElement.children[1];
                    if(tag.children.length > 0) {
                        // 선택된 div가 마지막 노드가 아닐때
                        let tagDisplay = tag.style.display;

                        if (tagDisplay == 'none') {
                            event.currentTarget.parentElement.children[1].style.display = 'block';
                        } else {
                            event.currentTarget.parentElement.children[1].style.display = 'none';
                        }
                        this.changeActive();
                    } else {
                        // 선택된 div가 마지막 노드일 때
                    }
                }

                if (this.$parent.$parent.toMove) {
                    this.$parent.$parent.toMove(fileName);
                }
            },
            changeActive: function () {
                this.open = !this.open;
            },
        },
        mounted() {
        }
    })
</script>


<style>
    .navigate {
        position: absolute;
        width: 250px;
        left: 0px;
        top: 0px;
        bottom: 0px;
        height: 100%;
        overflow: auto;
        border-right: 1px solid #eeeeee;
        background-color: #3e444d;
    }

    .navigate .naviTitle {
        height: 50px;
        border: 1px solid #0095eb;
        background-color: #0095eb;
        border-bottom: 1px solid #3e4148;
    }

    .navigate .naviTitle > p {
        color: white;
        text-align: center;
    }

    .navigate ul {
        list-style: none;
        margin: 0;
        padding: 0;

    }

    .navigate li {
        margin: 0;
        padding: 0;
    }




    .navigate > ul > li > div {
        background-image: -webkit-linear-gradient(top, #2f2f2f 0%, #333640 100%);
        border: 1px solid #303030;
    }

    .navigate > ul > li > div > span {
        font-weight: bold;
        line-height: 35px;
        color: white;
        vertical-align: middle;
    }

    .navigate ul li div span {
        line-height: 35px;
        vertical-align: middle;
    }

    .navigate > ul > li > ul > li {
        border-bottom: 1px solid #3e4148;
    }

    .navigate > ul > li > ul > li > div > span {
        color: white;
    }

    .navigate > ul > li > ul > li:hover {
        background-color: #0095eb;
        cursor: default;
    }

    .navigate > ul > li > ul > li.active {
        font-weight: bold;
    }

    .navigate div {
        display: block;
        cursor: pointer;
        height: 35px;
    }

    .navigate div.active {

    }

    .navigate li div {
        padding: 0px 0 0px 10px;
    }

    .navigate li li div {
        padding: 0px 0px 0px 30px;
    }

    .navigate li li li div {
        padding: 0px 0px 0px 50px;
    }

    .minusFolder {
        background-image: url("/src/images/xm_icon_v1.png");
        background-position: -250px -223px;
        position: relative;
        top: 5px;
        width: 15px;
        height: 19px !important;
        padding: 0 10px 0 0 !important;
        display: inline-block !important;
        -webkit-transform: rotate(270deg);
        -moz-transform: rotate(270deg);
        -ms-transform: rotate(270deg);
        -o-transform: rotate(270deg);
        transform: rotate(270deg);
    }
    .plusFolder {
        background-image: url("/src/images/xm_icon_v1.png");
        background-position: -254px -216px;
        position: relative;
        top: 5px;
        width: 15px;
        height: 20px !important;
        /*padding: 0 10px 0 0 !important;*/
        padding: 0 0px 0 0 !important;
        margin-right: 10px;
        display: inline-block !important;
    }
    .endFolder {
        background-image: url("/src/images/xm_icon_v1.png");
        background-position: -93px -687px;
        position: relative;
        top: 5px;
        width: 15px;
        height: 20px !important;
        padding: 0px !important;
        margin-right: 10px;
        display: inline-block !important;
    }
</style>
