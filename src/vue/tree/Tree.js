import TreeNode from './TreeNode.vue';
import TreeStore from './TreeStore.js';
import headerCell from './TreeHeaderCell.vue';


export default {
    props : {
        treeInfo   : Object,
        columns    : Array,
        rows       : Array
    },
    data: function() {
        return {
            treeStyle  : null,
            titleStyle : null,
            store      : null,
            treeColumn : this.treeInfo.treeColumnId
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

        columnOptions: {
            get() {
                let defColumns = [];
                for(let ix=0, ixLen=this.columns.length; ix<ixLen; ix++) {
                    defColumns[ix] = Object.assign({
                        dataIndex: 'def_dataIndex_' + ix,
                        name     : '',
                        width    : 50,
                        height   : 20,
                        visible  : false,
                        draggable: false,
                        type     : ''
                    }, this.columns[ix]);
                }
                return defColumns;
            },
            set(data) {
                if(data.type === 'drag') {
                    this.columns.splice(data.dragIdx, 1);
                    this.columns.splice(data.dropIdx, 0, data.targetCol);
                }

                if(data.type ==='resize'){
                    this.columns[data.cellIndex].width = data.width;
                }
            }
        },
        treeMap() {
            return this.store.treeMap;
        }
    },
    methods: {
        setExpandNode(node, expandMode) {
            this.store.handleExpandNode(node, expandMode);
        },

        setCheckNode(node, checkValue) {
            this.store.handleCheckNode(node, checkValue);
        },

        setResizeColumnEvent() {
            const vm = this;
            const headerCols = Array.from(vm.$el.getElementsByClassName('grip'));
            let thElm = null;
            let startOffset = 0;
            headerCols.forEach(function(grip) {
                grip.addEventListener('mousedown', onMouseDown);
            });

            function onMouseDown(e) {
                if (e.preventDefault) {
                    e.preventDefault();
                }
                thElm = e.target.parentNode;
                startOffset = thElm.offsetWidth - e.pageX;
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
                return false;
            }

            function onMouseMove(e) {
                const data = {
                    type : 'resize',
                    width: startOffset + e.pageX,
                    cellIndex : thElm.cellIndex
                };
                vm.columnOptions = data;
            }

            function onMouseUp(e) {

                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
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
            treeColumnId: this.treeOptions.treeColumnId,
            useCheckBox : this.treeOptions.useCheckBox
        });

    },
    mounted() {
        if(this.treeOptions.useColumnResize) {
            this.setResizeColumnEvent();
        }

        this.$refs.dragLine.style.height = this.$refs.treeTable.clientHeight + 'px';

    },
    components: {
        TreeNode,
        headerCell
    }
};
