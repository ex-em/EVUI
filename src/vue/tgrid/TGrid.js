export default {
    props: {
        gridInfo: Object,
        columns: Array,
        data: Array
    },
    data: function () {
        return {
            gridStyle: null,
            titleStyle: null,
            sortKey: '',
            sortOrders: null,
            columnType: null,
            gridWidth: 0,
            selected: [],
            dragTargetPos: null,
            dragTarget: null,
            nodeList: [],
            scroll: {
                bufferSize: 100,
                bufferDataIdx: 0,
                top: 0,
                rowHeight: 20,
                prevScrollTop: 0,
                page: 0,
                offset: 0,
                prevUpdateScrollTop: 0
            }
        };
    },
    computed: {

        selectAll: {
            get() {
                return this.data.every(function (d) {
                    return d.checked;
                });
            },
            set() {

            }
        },

        gridOptions() {
            return Object.assign({
                title: null,
                titleAlign: 'center',
                width: '100%',
                height: '100%'
            }, this.gridInfo);
        },

        columnOptions: {
            get() {
                let defColumns = [];
                for (let ix = 0, ixLen = this.columns.length; ix < ixLen; ix++) {
                    defColumns[ix] = Object.assign({
                        dataIndex: 'def_dataIndex_' + ix,
                        name: '',
                        width: 50,
                        height: 20,
                        visible: false,
                        draggable: false,
                        type: ''
                    }, this.columns[ix]);
                }
                return defColumns;
            },
            set(data) {

                //드래그 드랍 이벤트 값변경시 탑니다
                if (data.type === 'drag') {
                    this.columns.splice(data.dragIdx, 1);
                    this.columns.splice(data.dropIdx, 0, data.targetCol);
                }
            }
        },

        gridTotalWidth() {
            let totalWidth = this.gridWidth;
            this.columns.forEach(function (column) {
                totalWidth += column.width;
            });

            return totalWidth;
        },

        sortedData: function () {
            let sortKey = this.sortKey;

            let order = this.sortOrders[sortKey] || 1;
            let sortedData = this.data;

            if (sortKey) {
                sortedData = sortedData.slice().sort(function (a, b) {
                    a = a[sortKey];
                    b = b[sortKey];
                    return (a === b ? 0 : a > b ? 1 : -1) * order;
                });
            }

            return sortedData;
        },

        bufferedData: function () {
            // return this.sortedData.slice(0, 100);
            return this.sortedData.slice(this.scroll.bufferDataIdx, this.scroll.bufferSize + this.scroll.bufferDataIdx);
            // return this.sortedData;
        }
    },
    methods: {
        cellClick: function (columnData, colIdx, rowData, rowIdx, e) {
            // alert('Col Info -> '+ columnData + '\nCol Idx -> ' + colIdx + '\nRow Info -> '+ rowData + '\nRow Idx -> ' + rowIdx);
        },

        checkBoxClick: function () {
            const selected = this.selected;

            console.log('checkboxClick ==> ', arguments);
        },

        bufferHeightCalc: function () {
            let rowTopEl = document.getElementById('evui_grid_row_top');
            let rowBottomEl = document.getElementById('evui_grid_row_bottom');
            let dataLength = this.sortedData.length;
            let rowHeight = this.scroll.rowHeight;
            let vh = dataLength * rowHeight;
            let top = 0;
            if (vh > this.scroll.bufferSize * rowHeight) {
                top = this.scroll.bufferDataIdx * rowHeight - this.scroll.offset;
                if (top > vh - this.scroll.bufferSize * rowHeight) {
                    top = vh - this.scroll.bufferSize * rowHeight;
                }

                rowTopEl.style.height = top + 'px';
                rowBottomEl.style.height = (vh - (this.scroll.bufferSize * rowHeight) - top) + 'px';

                // console.log('topHeight --> ', top, 'bottomHeight --> ', vh - (this.scroll.bufferSize * rowHeight) - top);
            }
        },

        gridBodyScroll: function (e) {
            this.$el.getElementsByTagName('thead')[0].style.left = (-e.target.scrollLeft) + 'px';
            // $('thead th:nth-child(1)').css("left", $("tbody").scrollLeft()); //fix the first cell of the header
            // $('tbody td:nth-child(1)').css("left", $("tbody").scrollLeft()); //fix the first column of tdbody
            let bufferSize = 100;
            let dataLength = this.sortedData.length;
            // let rowHeight = this.columnOptions[0].height;
            let rowHeight = this.scroll.rowHeight;

            let th = rowHeight * dataLength; // virtual height
            let ph = bufferSize * rowHeight; // page height
            let h = ph * 100;
            let n = Math.ceil(th / ph);
            let vp = this.gridOptions.height;

            let cj = (th - h) / (n - 1);
            this.scroll.page;
            this.scroll.offset;
            let viewport = e.target;
            let scrollTop = viewport.scrollTop;


            console.log('SCROLL TOP ##### ', scrollTop);
                if (Math.abs(scrollTop - this.scroll.prevScrollTop) > vp) {
                    // onJump
                    this.scroll.page = Math.floor(scrollTop * ((th - vp) / (h - vp)) * (1 / ph));
                    // this.scroll.offset = Math.round(this.scroll.page * cj);
                    // this.scroll.prevScrollTop = scrollTop;

                    console.log('onJump');
                } else {
                    // onNearScroll
                    console.log('onNearScroll');
                    // next page
                    if (scrollTop + this.scroll.offset > (this.scroll.page + 1) * ph) {
                        this.scroll.page++;
                        // this.scroll.offset = Math.round(this.scroll.page * cj);
                        // viewport.scrollTop = (this.scroll.prevScrollTop = scrollTop - cj);
                    }
                    // prev page
                    else if (scrollTop + this.scroll.offset < this.scroll.page * ph) {
                        this.scroll.page--;
                        // this.scroll.offset = Math.round(this.scroll.page * cj);
                        // viewport.scrollTop = (this.scroll.prevScrollTop = scrollTop + cj);
                    }
                    else {
                        this.scroll.prevScrollTop = scrollTop;
                    }
            }
            this.scroll.prevScrollTop = scrollTop;


                // calculate the viewport + buffer
            var y = viewport.scrollTop + this.scroll.offset,
                buffer = vp,
                top = Math.floor((y - buffer) / rowHeight),
                bottom = Math.ceil((y + vp + buffer) / rowHeight);

            top = Math.max(0, top);
            bottom = Math.min(th / rowHeight, bottom);

            // console.log("top --> ", top, "bottom --> ", bottom, "prev scroll top --> ", this.scroll.prevScrollTop);
            // if ((this.scroll.prevScrollTop + this.scroll.offset) / rowHeight == 75) {
            // if (this.scroll.testFlag) {

            // if (scrollTop - this.scroll.prevUpdateScrollTop > ph * 0.7) {
            //     this.scroll.prevUpdateScrollTop = scrollTop;
                this.scroll.bufferDataIdx = parseInt((this.scroll.prevScrollTop + this.scroll.offset) / rowHeight);
                this.bufferHeightCalc();
            // }

            // this.scroll.testFlag = !this.scroll.testFlag;

            // }

            // if (this.scroll.top < top || this.scroll.top > bottom) {
            //     this.scroll.top = top;
            // }

            let debugEl = document.getElementById('debugInfo');

            if (this.nodeList.length == 0) {
                for (let ix = 0; ix < 8; ix++) {
                    this.nodeList[ix] = document.createElement("div");
                }

                for (let ix = 0; ix < this.nodeList.length; ix++) {
                    debugEl.appendChild(this.nodeList[ix]);
                }
            }

            this.nodeList[0].innerHTML = "n = " + n + "<br>";
            this.nodeList[1].innerHTML = "ph = " + ph + "<br>";
            this.nodeList[2].innerHTML = "cj = " + cj + "<br>";
            this.nodeList[3].innerHTML = "page = " + this.scroll.page + "<br>";
            this.nodeList[4].innerHTML = "offset = " + this.scroll.offset + "<br>";
            this.nodeList[5].innerHTML = "virtual y = " + (this.scroll.prevScrollTop + this.scroll.offset) + "<br>";
            this.nodeList[6].innerHTML = "real y = " + this.scroll.prevScrollTop + "<br>";
            this.nodeList[7].innerHTML = "bufferDataIdx = " + this.scroll.bufferDataIdx + "<br>";

        },

        onJump: function () {

        },

        onNearScroll: function () {

        },


        toggleSelect: function () {
            let select = this.selectAll;
            this.data.forEach(function (d) {
                d.checked = !select;
            });
            this.selectAll = !select;
        },

        sortBy: function (key) {
            this.sortKey = key;
            this.sortOrders[key] = this.sortOrders[key] * -1;
        },

        cls(type) {
            switch (type) {
                case 'number':
                case 'integer':
                case 'numeric':
                case 'float':
                    return 'text-align-right';
                case 'date':
                case 'datetime':
                    return '';
                case 'checkbox' :
                    return '';
                default:
                    return '';
            }
        },

        setResizeGrips() {
            const vm = this;
            const headerCols = Array.from(vm.$el.getElementsByClassName('grip'));
            headerCols.forEach((grip) => {
                grip.addEventListener('mousedown', this.onMouseDown);
                vm.grips.push(grip);
            });
            document.addEventListener('mousemove', this.onMouseMove);
            document.addEventListener('mouseup', this.onMouseUp);
        },

        syncColumnWidths() {
            const vm = this;
            const headerCols = Array.from(vm.$el.getElementsByTagName('th'));
            const widths = headerCols.map((h) => h.width ? h.width : h.clientWidth);
            // this.columnOptions[1].width = +widths[1];
            const bodyCols = Array.from(vm.$el.querySelectorAll('tr:first-child>td'))
            bodyCols.forEach((c, i) => {
                c.width = widths[i] + 'px';
            });
            console.log(this.columnOptions)
        },

        onMouseDown(e) {
            const vm = this;
            vm.thElm = e.target.parentNode;
            vm.startOffset = vm.thElm.offsetWidth - e.pageX;
            return false;
        },

        onMouseMove(e) {
            const vm = this;
            if (vm.thElm) {
                // const colName = vm.thElm.getAttribute('data-column-name');
                const width = vm.startOffset + e.pageX;
                vm.thElm.width = width;
            }
        },

        onMouseUp() {
            const vm = this;
            vm.thElm = undefined;
            vm.syncColumnWidths();
        },


        /**
         * 드래그 이벤트 세팅
         */
        setDragColumnEvent() {
            var columns = document.querySelectorAll('.grid-column-sort');
            const vm = this;

            for (let ix = 0, ixLen = columns.length; ix < ixLen; ix++) {

                columns[ix].addEventListener('dragstart', handleDragStart, false);

                columns[ix].addEventListener('dragenter', handleDragEnter, false);
                columns[ix].addEventListener('dragover', handleDragOver, false);
                columns[ix].addEventListener('drop', handleDragDrop, false);
                columns[ix].addEventListener('dragend', handleDragEnd, false);
                // columns[ix].addEventListener('dragleave', handleDragLeave, false);

            }


            //드래그 시작시
            function handleDragStart(e) {
                this.style.opacity = '0.4';
                this.classList.add('dragItem')

                vm.dragTargetPos = this.parentElement.getBoundingClientRect();
                vm.dragTarget = this;
            }

            //드래그가 타겟 엔터시
            function handleDragEnter(e) {

                const targetEl = e.target;

                if (this.classList.contains('grid-column-sort') && !this.classList.contains('dragItem')) {
                    let targetPos = this.parentElement.getBoundingClientRect();
                    let dragX = (targetPos.left) + 'px';
                    let dragY = (targetPos.top) + 'px';

                    //드래그 타겟보다 오른쪽컬럼들
                    if (vm.dragTargetPos.left < targetPos.left) {
                        dragX = (targetPos.right) + 'px';
                    }

                    vm.$refs.dragLine.style.top = dragY;
                    vm.$refs.dragLine.style.left = dragX;

                    vm.$refs.dragLine.style.display = 'block';


                }
            }

            //드래그후 오버시
            function handleDragOver(e) {
                if (e.preventDefault) {
                    e.preventDefault(); // Necessary. Allows us to drop.
                }
                e.dataTransfer.dropEffect = "move"

                return false;
            }

            //드랍시
            function handleDragDrop(e) {
                if (e.stopPropagation) {
                    e.stopPropagation(); // stops the browser from redirecting.
                }
                let dragIdx = vm.dragTarget.parentElement.cellIndex;
                let dropIdx = this.parentElement.cellIndex;

                if (vm.gridOptions.useCheckbox) {
                    dragIdx -= 1;
                    dropIdx -= 1;
                }

                let targetCol = vm.columnOptions[dragIdx]
                let data = {
                    type: 'drag',
                    dropIdx: dropIdx,
                    dragIdx: dragIdx,
                    targetCol: targetCol
                };


                vm.columnOptions = data


                return false;

            }

            //드래그 드랍 이벤트 끝날때
            function handleDragEnd(e) {
                vm.dragTarget.classList.remove('dragItem');
                vm.dragTarget.style.opacity = null;
                vm.$refs.dragLine.style.display = 'none';
                vm.dragTarget = null;
                vm.dragTargetPos = null;
            }

            //드래그 타겟 떠날시
            //차후 삭제 예정
            function handleDragLeave(e) {
            }


        }

    },

    mounted() {
        // const vm = this;
        // vm.grips = [];
        // vm.setResizeGrips();
        // vm.syncColumnWidths();

        //컬럼 드래그 선 높이 설정
        // debugger;

        this.$refs.dragLine.style.height = this.$refs.gridTable.clientHeight + 'px';

        //Drag Column Event setting
        this.setDragColumnEvent();

        this.bufferHeightCalc();
    },

    created() {
        // set grid default style
        this.gridStyle = {
            'width': typeof this.gridOptions.width === 'number' ? this.gridOptions.width + 'px' : this.gridOptions.width,
            'height': typeof this.gridOptions.height === 'number' ? this.gridOptions.height + 'px' : this.gridOptions.height
        };

        this.titleStyle = {
            'text-align': this.gridOptions.titleAlign,
            'display': 'block'
        };

        let sortOrders = {};
        this.columnOptions.forEach(function (key) {
            sortOrders[key.dataIndex] = 1;
        });
        this.sortOrders = sortOrders;
    },

    beforeDestory() {
        const vm = this;
        vm.grips.forEach((grip) => grip.removeEventListener('mousedown', vm.onMouseDown));
        document.removeEventListener('mousemove', vm.onMouseMove);
        document.removeEventListener('mouseup', vm.onMouseUp);
    }
};
