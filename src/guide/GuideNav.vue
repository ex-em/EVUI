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
    treeTemplate +=         '<div v-on:click.stop="showHideToggle(treeProps.fileName)" v-bind:class="{ active: open }">';
    treeTemplate +=             '<span v-if="isFolder && open">[-]</span>'
    treeTemplate +=             '<span v-else-if="isFolder && !open">[+]</span>'
    treeTemplate +=             '<span v-else>[ ]</span> '
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
                        name: 'Content',
                        children: [
                            {
                                name: 'Column Order',
                                fileName: 'ColumnOrder',
                                content: 'Column Order Option'
                            },
                            {
                                name: 'Column Visible',
                                fileName: 'ColumnVisible',
                                content: 'Column Visible Option'
                            },
                            {
                                name: 'Column Resize',
                                fileName: 'ColumnResize',
                                content: 'Column Resize Option'
                            },
                            {
                                name: 'Column Move',
                                fileName: 'ColumnMove',
                                content: 'Column Move Option'
                            },
                            {
                                name: 'Column Filter',
                                fileName: 'ColumnFilter',
                                content: 'Column Filter Option'
                            }
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
            showHideToggle: function (fileName) {
                if(event && event.currentTarget.parentElement.children[1].localName == 'ul') {
                    let tag = event.currentTarget.parentElement.children[1];
                    let tagDisplay = tag.style.display;

                    if (tagDisplay == 'none') {
                        event.currentTarget.parentElement.children[1].style.display = 'block';
                    } else {
                        event.currentTarget.parentElement.children[1].style.display = 'none';
                    }
                }

                this.changeActive();
                if (this.$parent.$parent.toMove) {
                    this.$parent.$parent.toMove(fileName);
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

    .navigate > ul > li > div {
        background-color: #eeeeee;
        background-image: -webkit-linear-gradient(top, #ffffff 0%, #eeeeee 100%);
        border: 1px solid #eeeeee;
    }

    .navigate > ul > li > div > span {
        font-weight: bold;
    }

    .navigate div {
        display: block;
        cursor: pointer;
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
