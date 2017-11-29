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
    treeTemplate +=         '<div v-on:click.stop="showHideToggle(treeProps.name)" v-bind:class="{ active: open }">';
    treeTemplate +=             '<span v-if="isFolder && open">[-]</span>'
    treeTemplate +=             '<span v-else-if="isFolder && !open">[+]</span>'
    treeTemplate +=             '<span v-else>[ ]</span> '
    treeTemplate +=             '{{treeProps.name}}'
    treeTemplate +=         '</div>'
    treeTemplate +=         '<ul v-show="open">';
    treeTemplate +=             '<tree-tag v-for=\"childProps in treeProps.children\" v-bind:key="childProps.name" v-bind:treeProps=\"childProps\"></tree-tag>';
    treeTemplate +=         '</ul>';
    treeTemplate +=     '</li>';

    export default {
        name: 'guideNavName',
        data: function () {
            return {
                imgRootURL: '/src/images/summary/',
                imgExtention: '.png',
                storeItem: [
                    {
                        name: 'Content',
                        children: [
                            {
                                name: 'ContentA',
                                content: 'ContentA is Simple Content Component'
                            },
                            {
                                name: 'ContentB',
                                content: 'ContentB is Complicated Content Component'
                            },
                            {
                                name: 'ContentC',
                                content: 'ContentC is Temporary Content Component'
                            },
                        ],
//                        openToggle: false
                    },
                    {
                        name: 'Document',
                        children: [
                            {
                                name: 'DocumentA',
                                content: 'DocumentA is Simple Document Component'
                            },
                            {
                                name: 'DocumentB',
                                content: 'DocumentB is Temporary Document Component'
                            },
                        ],
//                        openToggle: false
                    },
                    {
                        name: 'Test'
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
            /**
             * @vue this.data.storeItem의 컨텐츠 중에서 children이 있을 경우 children의 imgSrc속성, openToggle속성을 set
             */
            setStoreItemImgSrc: function() {
                if(this.storeItem) {
                    let storeItem;
                    let name;
                    let imgRootUrl = this.imgRootURL;
                    let imgExtention = this.imgExtention;
                    for(let i = 0; i < this.storeItem.length; i++) {
                        storeItem = this.storeItem[i];
                        if(storeItem.children) {
                            this.$set(this.storeItem[i], 'openToggle', false);
                            for(let j = 0; j < storeItem.children.length; j++) {
                                name = storeItem.children[j].name;
                                storeItem.children[j].imgSrc = imgRootUrl + name + imgExtention;
                            }
                        }
                    }
                }
            },
        },
        mounted() {
            this.$root.$eventBus.$emit('guideNavData', this.storeItem);
            this.setStoreItemImgSrc();
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
            showHideToggle: function (name) {
                if (event.path[1] && event.path[1].localName == 'li' && event.path[1].children[1].localName == 'ul') {
                    var tagDisplay = event.path[1].children[1].style.display;
                    if (tagDisplay == 'none') {
                        event.path[1].children[1].style.display = 'block'
                    } else {
                        event.path[1].children[1].style.display = 'none'
                    }
                }

                this.changeActive();
                if (this.$parent.$parent.toMove) {
//                    this.$root.$children[0].$children[0].$children[0].toMove(name);
                    this.$parent.$parent.toMove(name);
                }
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

    .navigate div {
        display: block;
        cursor: pointer;
        background-color: #22aa99;
    }

    .navigate div.active {
        cursor: default;
    }

    .navigate li div {
        padding: 10px 0 10px 10px;
    }

    .navigate li li div {
        padding: 10px 0px 10px 30px;
    }

    .navigate li li li div {
        padding: 10px 0px 10px 50px;
    }
</style>
