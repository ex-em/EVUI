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
    treeTemplate +=         '<div v-on:click.stop="showHideToggle(treeProps.name, treeProps.fileName)" v-bind:class="{ active: open }">';
    treeTemplate +=             '<div v-if="isFolder && open" class="minusFolder"></div>'
    treeTemplate +=             '<div v-else-if="isFolder && !open" class="plusFolder"></div>'
    treeTemplate +=             '<div v-else class="endFolder"></div>'
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
                selectedMenu: '',
                storeItem: [
                    {
                        name: 'Content',
                        children: [
                            {
                                name: 'ContentA',
                                fileName: 'ContentA',
                                content: 'ContentA is Simple Content Component'
                            },
                            {
                                name: 'ContentB',
                                fileName: 'ContentB',
                                content: 'ContentB is Complicated Content Component'
                            },
                            {
                                name: 'ContentC',
                                fileName: 'ContentC',
                                content: 'ContentC is Temporary Content Component'
                            },
                        ],
                    },
                    {
                        name: 'Document',
                        children: [
                            {
                                name: 'DocumentA',
                                fileName: 'DocumentA',
                                content: 'DocumentA is Simple Document Component'
                            },
                            {
                                name: 'DocumentB',
                                fileName: 'DocumentB',
                                content: 'DocumentB is Complicated Document Component'
                            },
                        ],
                    },
                    {
                        name: 'Test'
                    }
                ],
            }
        },
        computed: {
            classActive: {
                get: function() {
                    return
                }
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
                open: false,
            }
        },
        template: treeTemplate,
        props: ['treeProps'],
        computed: {
            isFolder: function () {
                return this.$props.treeProps.children && this.$props.treeProps.children.length;
            }
        },
        methods: {
            showHideToggle: function (name, fileName) {
                if(event && event.currentTarget.parentElement.children[1].localName == 'ul') {
                    let tag = event.currentTarget.parentElement.children[1];
                    let tagDisplay = tag.style.display;

                    if (tagDisplay == 'none') {
                        event.currentTarget.parentElement.children[1].style.display = 'block';
                    } else {
                        event.currentTarget.parentElement.children[1].style.display = 'none';
                    }

                    if(tag.children.length > 0) { // 선택된 div가 마지막 노드가 아닐때
                        this.changeActive();
                    } else { // 선택된 div가 마지막 노드일 때
                        this.$parent.selectedMenu = name;
                    }
                }


                if (this.$parent.$parent.toMove) {
                    this.$parent.$parent.toMove(fileName);
                }

//                this.$parent.selectedMenu = name;
            },
            changeActive: function () {
                this.open = !this.open;
            },
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
        background-color: #eeeeee;
        background-image: -webkit-linear-gradient(top, #ffffff 0%, #eeeeee 100%);
        border: 1px solid #eeeeee;
    }

    .navigate > ul > li > div > span {
        font-weight: bold;
    }

    .navigate > ul > li > ul > li:hover {
        background-color: #eeeeee;
        cursor: default;
    }

    .navigate > ul > li > ul > li.active {
        font-weight: bold;
    }

    .navigate div {
        display: block;
        cursor: pointer;
        height: 30px;
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
