<template>
    <div class="navigate">
        <div class="naviTitle" v-on:click="toMove('')">
            <p>Guide Navigate</p>
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
                                content: 'Column Order Option'
                            },
                            {
                                name: 'Column Visible',
                                fileName: 'GridColumnVisible',
                                content: 'Column Visible Option'
                            },
                            {
                                name: 'Column Resize',
                                fileName: 'GridColumnResize',
                                content: 'Column Resize Option'
                            },
                            {
                                name: 'Column Move',
                                fileName: 'GridColumnMove',
                                content: 'Column Move Option'
                            },
                            {
                                name: 'Column Filter',
                                fileName: 'GridColumnFilter',
                                content: 'Column Filter Option'
                            }
                        ],
                    },
                    {
                        name: 'Tree',
                        children: [
//                            {
//                                name: 'Column Visible',
//                                fileName: 'TreeColumnVisible',
//                                content: 'Column Visible Option'
//                            },
                            {
                                name: 'Column Resize',
                                fileName: 'TreeColumnResize',
                                content: 'Column Resize Option'
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
                                content: 'DocumentA is Simple Document Component'
                            },
                            {
                                name: 'Scatter Chart',
                                fileName: 'ChartScatter',
                                content: 'DocumentB is Complicated Document Component'
                            },
                            {
                                name: 'Bar Chart',
                                fileName: 'ChartBar',
                                content: 'DocumentB is Complicated Document Component'
                            },
                            {
                                name: 'Stack Bar Chart',
                                fileName: 'ChartStackBar',
                                content: 'DocumentB is Complicated Document Component'
                            },
                            {
                                name: 'Order Bar Chart',
                                fileName: 'ChartOrderBar',
                                content: 'DocumentB is Complicated Document Component'
                            },
                            {
                                name: 'Pie Chart',
                                fileName: 'ChartPie',
                                content: 'DocumentB is Complicated Document Component'
                            }
                        ]
                    }
                ],
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
