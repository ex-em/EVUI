import TreeNode from './TreeNode.vue';
import TreeStore from './TreeStore.js';
import headerCell from './TreeHeaderCell.vue';


export default {
    name  : 'evui-tree',
    props : {
        treeInfo   : Object,
        columns    : Array,
        rows       : Array
    },
    data: function() {
        return {
            isInit     : false,
            treeStyle  : null,
            titleStyle : null,
            store      : null,
            treeColumn : this.treeInfo.treeColumnId,
            scroll: {
                bufferSize      : 100,
                rowHeight       : null,
                prevScrollTop   : 0,
                page            : 0,
                offset          : 0,
                top             : 0,
                bottom          : 0,
                timeOut         : null
            }
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
            if(this.$refs.evuiTreeBody) {
                this.$refs.evuiTreeBody.scrollTop = 0;
                this.store = null;
            }

            this.store = new TreeStore({
                vm          : this,
                treeData    : this.rawData,
                columns     : this.columns,
                treeColumnId: this.treeOptions.treeColumnId,
                useCheckBox : this.treeOptions.useCheckBox
            });
            return this.store.treeMap;
        },

        rawData() {
            return this.rows;
        },

        bufferedData: function () {
            return this.treeMap.slice(this.scroll.top, Math.max(this.scroll.bottom, this.scroll.bufferSize));
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
        },

        bufferHeightCalc: function () {

            if (this.$refs.evuiTreeItem.firstElementChild) {
                if (!this.scroll.rowHeight) {
                    this.scroll.rowHeight = this.$refs.evuiTreeItem.firstElementChild.offsetHeight;
                }
            } else {
                return;
            }

            let rowTopEl = this.$refs.evuiTreeItemContainer;
            let rowBottomEl = this.$refs.evuiTreeItem;
            let dataLength = this.treeMap.length;
            let rowHeight = this.scroll.rowHeight;
            let vh = dataLength * rowHeight;
            let top = 0;

            if (vh > this.scroll.top * rowHeight) {
                top = this.scroll.top * rowHeight - this.scroll.offset;
                rowTopEl.style.height = vh + 'px';
                rowBottomEl.style.top = top + 'px';
            }
        },

        treeBodyScroll: function (e) {
            this.$refs.evuiTreeThead.style.left = (-e.target.scrollLeft) + 'px';

            clearTimeout(this.scroll.timeOut);
            this.scroll.timeOut = setTimeout(function() {
                let bufferSize = this.scroll.bufferSize;
                let dataLength = this.treeMap.length;
                let rowHeight = this.scroll.rowHeight;
                let th = rowHeight * dataLength; // virtual height
                let ph = bufferSize * rowHeight; // page height
                let h = ph * 100;
                let n = Math.ceil(th / ph);
                let vp = this.treeOptions.height;
                let cj = (th - h) / (n - 1);
                let viewport = e.target;
                let scrollTop = viewport.scrollTop;

                if (Math.abs(scrollTop - this.scroll.prevScrollTop) > vp) {
                    // onJump
                    this.scroll.page = Math.floor(scrollTop * ((th - vp) / (h - vp)) * (1 / ph));
                } else {
                    // onNearScroll
                    // next page
                    if (scrollTop + this.scroll.offset > (this.scroll.page + 1) * ph) {
                        this.scroll.page++;
                    }
                    // prev page
                    else if (scrollTop + this.scroll.offset < this.scroll.page * ph) {
                        this.scroll.page--;
                    }
                }
                this.scroll.prevScrollTop = scrollTop;

                // calculate the viewport + buffer
                var y = viewport.scrollTop + this.scroll.offset,
                    buffer = ph > vp ? ph - vp : vp,
                    top = Math.floor((y - buffer/2) / rowHeight),
                    bottom = Math.ceil((y + vp + buffer/2) / rowHeight);

                top = Math.max(0, top);
                bottom = Math.min(th / rowHeight, bottom);

                console.log('TOP --> ', top, 'Bottom --> ', bottom);

                this.scroll.top = top;
                this.scroll.bottom = bottom;
                this.bufferHeightCalc();
            }.bind(this), 40);
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

    },
    mounted() {
        if(this.treeOptions.useColumnResize) {
            this.setResizeColumnEvent();
        }

        this.$refs.dragLine.style.height = this.$refs.treeTable.clientHeight + 'px';
        this.bufferHeightCalc();

    },
    components: {
        TreeNode,
        headerCell
    }
};
