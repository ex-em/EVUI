import TreeNode from './TreeNode.vue';
import TreeStore from './TreeStore.js';

export default {
    props : {
        treeInfo: Object,
        columns : Array,
        rows    : Array
    },
    data: function() {
        return {
            treeStyle : null,
            titleStyle: null,
            store     : null,
            treeColumn: this.treeInfo.treeColumnId
        };
    },
    computed: {
        // set default options
        treeOptions() {
            return Object.assign({
                title     : null,
                titleAlign: 'center',
                width     : '100%',
                height    : '100%'
            }, this.treeInfo);
        },

        columnOptions() {
            let defColumns = [];
            for(let ix=0, ixLen=this.columns.length; ix<ixLen; ix++) {
                defColumns[ix] = Object.assign({
                    lvl     : 1,
                    id     : 'def_cId_' + ix,
                    name   : '',
                    width  : 50,
                    visible: false
                }, this.columns[ix]);
            }
            return defColumns;
        },
        treeMap() {
            return this.store.treeMap;
        }
    },
    methods: {
        setExpandNode(node, expandMode) {
            this.store.handleExpandNode(node, expandMode);
        }
    },
    created() {
        // set tree default style
        this.titleStyle = {
            'text-align': this.treeOptions.titleAlign,
            'display'   : 'block'
        };

        this.treeStyle = {
            'width' : typeof this.treeOptions.width === 'number' ? this.treeOptions.width + 'px' : this.treeOptions.width,
            'height': typeof this.treeOptions.height === 'number' ? this.treeOptions.height + 'px' : this.treeOptions.height
        };

        this.store = new TreeStore({
            vm          : this,
            treeData    : this.rows,
            columns     : this.columns,
            treeColumnId: this.treeOptions.treeColumnId
        });

    },
    components: {
        TreeNode
    }
};
