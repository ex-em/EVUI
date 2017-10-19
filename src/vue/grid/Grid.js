export default {
    props : {
        gridInfo : Object,
        columns : Array,
        data: Array
    },
    data: function () {
        return {
            gridStyle : null,
            titleStyle: null,
            sortKey: '',
            sortOrders: null,
            columnType: null,
            selected: []
        };
    },
    computed: {

        selectAll: {
            get: function() {
                return this.data ? this.selected.length == this.data.length : false;
            }
            // },
            // set: function(value) {
            //     let selected = [];
            //     if (value) {
            //         this.data.forEach(function(data, idx) {
            //             selected.push(idx);
            //         });
            //     }
            //     this.selected = selected;
            // }
        },

        gridOptions() {
            return Object.assign({
                title     : null,
                titleAlign: 'center',
                width     : '100%',
                height    : '100%'
            }, this.gridInfo);
        },

        columnOptions() {
            let defColumns = [];
            for(let ix=0, ixLen=this.columns.length; ix<ixLen; ix++) {
                defColumns[ix] = Object.assign({
                    cId : 'def_cId_' + ix,
                    cName : '',
                    cWidth : 50,
                    cVisible : false,
                    cType: ''
                }, this.columns[ix]);
            }
            return defColumns;
        },

        sortedData: function () {
            let sortKey = this.sortKey;
            let sortIndex;

            for(let ix=0, ixLen=this.columnOptions.length; ix<ixLen; ix++) {
                if(this.columnOptions[ix].cId.indexOf(sortKey) > -1) {
                    sortIndex = ix;
                    break;
                }
            }

            let order = this.sortOrders[sortKey] || 1;
            let sortedData = this.data;

            if (sortKey) {
                sortedData = sortedData.slice().sort(function (a, b) {
                    a = a[sortIndex];
                    b = b[sortIndex];
                    return (a === b ? 0 : a > b ? 1 : -1) * order;
                });
            }

            return sortedData;
        }
    },
    methods: {

        cellClick: function(columnData, colIdx, rowData, rowIdx, e) {
            alert('Col Info -> '+ columnData + '\nCol Idx -> ' + colIdx + '\nRow Info -> '+ rowData + '\nRow Idx -> ' + rowIdx);
        },

        checkBoxClick: function() {

        },

        toggleSelect: function() {
            let value = this.selectAll;
            if (!value) {
                let selected = [];
                this.data.forEach(function(data, idx) {
                    selected.push(idx);
                });
                this.selected = selected;
            } else {
                this.selected = [];
            }

        },

        sortBy: function (key) {
            this.sortKey = key;
            this.sortOrders[key] = this.sortOrders[key] * -1;
        },

        cls(cType) {
            switch (cType) {
            case 'number':
            case 'integer':
            case 'numeric':
            case 'float':
                return 'text-align-right';
            case 'date':
            case 'datetime':
                return '';
            default:
                return '';
            }
        },

        setResizeGrips () {
            const vm = this;
            const headerCols = Array.from(vm.$el.getElementsByClassName('grip'));
            headerCols.forEach((grip) => {
                grip.addEventListener('mousedown', this.onMouseDown);
                vm.grips.push(grip);
            });
            document.addEventListener('mousemove', this.onMouseMove);
            document.addEventListener('mouseup', this.onMouseUp);
        },

        onMouseDown (e) {
            const vm = this;
            vm.thElm = e.target.parentNode;
            vm.startOffset = vm.thElm.offsetWidth - e.pageX;
        },

        onMouseMove (e) {
            const vm = this;
            if (vm.thElm) {
                // const colName = vm.thElm.getAttribute('data-column-name');
                const width = vm.startOffset + e.pageX;
                vm.thElm.width = width + 'px';
            }
        },

        onMouseUp () {
            const vm = this;
            vm.thElm = undefined;
        },

        beforeDestory () {
            const vm = this;
            vm.grips.forEach((grip) => grip.removeEventListener('mousedown', vm.onMouseDown));
            document.removeEventListener('mousemove', vm.onMouseMove);
            document.removeEventListener('mouseup', vm.onMouseUp);
        }

    },

    mounted() {
        const vm = this;
        vm.grips = [];
        vm.setResizeGrips();
    },
    created() {
        // set grid default style
        this.gridStyle = {
            'width' : typeof this.gridOptions.width === 'number' ? this.gridOptions.width + 'px' : this.gridOptions.width,
            'height': typeof this.gridOptions.height === 'number' ? this.gridOptions.height + 'px' : this.gridOptions.height
        };

        this.titleStyle = {
            'text-align' : this.gridOptions.titleAlign,
            'display'    : 'block'
        };

        let sortOrders = {};
        this.columnOptions.forEach(function (key) {
            sortOrders[key.cId] = 1;
        });
        this.sortOrders = sortOrders;
    }
};
