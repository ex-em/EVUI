import TreeNode from './TreeNode.vue';

export default {
    props : {
        treeInfo: Object,
        columns : Array,
        rows    : Array
    },
    data: function() {
        return {
            treeStyle      : null,
            titleStyle     : null,
            treeColumnIndex: null
        }
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
                    cId     : 'def_cId_' + ix,
                    cName   : '',
                    cWidth  : 50,
                    cVisible: false
                }, this.columns[ix]);
            }
            return defColumns;
        },

        treeNode() {
            let treeNode = [];

            for(let ix=0, ixLen=this.rows.length-1; ix<ixLen; ix++) {
                let currRow = this.rows[ix];
                let nextRow = this.rows[ix+1];
                let isLeaf = null;

                isLeaf = currRow[0] >= nextRow[0];

                treeNode.push({isLeaf : isLeaf , content : this.rows[ix]});
            }

            return treeNode;
        }
    },
    methods: {

    },
    created() {
        let isFindTreeColumn = false;

        // set tree default style
        this.titleStyle = {
            'text-align': this.treeOptions.titleAlign,
            'display'   : 'block'
        };

        this.treeStyle = {
            'width' : typeof this.treeOptions.width === 'number' ? this.treeOptions.width + 'px' : this.treeOptions.width,
            'height': typeof this.treeOptions.height === 'number' ? this.treeOptions.height + 'px' : this.treeOptions.height
        };

        // find tree column index
        for(let ix=0, ixLen=this.columnOptions.length; ix<ixLen; ix++) {
            if(this.columnOptions[ix].treecolumn) {
                this.treeColumnIndex = ix;
                isFindTreeColumn = true;
                break;
            }
        }

        if(!isFindTreeColumn) {
            this.treeColumnIndex = 0;    //default set
        }
    },
    components: {
        TreeNode
    }
};
