export default class TreeStore {
    constructor(props) {

        for(let prop in props) {
            this[prop] = props[prop];
        }

        if(this.treeData) {
            if(!this.treeData.length) {
                throw new Error('[EVUI][TreeStore]-Store has not TreeData Object');
            }
            this.nodeKey = 0;
            this.treeMap = [];
            this.treeNode = this.createTreeModel(null);
        }
        else {
            throw new Error('[EVUI][TreeStore]-Store has not Data');
        }
    }

    createTreeModel(rootId) {
        const store  = this;
        let treeObj = [];

        let treeData = this.treeData;
        let treeMap = this.treeMap;


        while (treeData.length > 0) {
            treeData.some(function (item, index) {
                if (item.parentId === rootId) {

                    let nodeObj = treeData.splice(index, 1)[0];

                    store.vm.$set(nodeObj, 'isLeaf', true);
                    store.vm.$set(nodeObj, 'show', true);
                    store.vm.$set(nodeObj, 'expanded', true);

                    if(store.useCheckBox) {
                        store.vm.$set(nodeObj, 'checked', false);
                    }

                    nodeObj.lvl = 0;
                    nodeObj.key = store.nodeKey++;
                    nodeObj.parent = null;

                    treeMap.push(nodeObj);
                    return treeObj.push(nodeObj);
                }

                return store.traversalTreeInfo(item, index);
            });
        }

        console.log('#### Created Tree Model ####');
        return treeObj;
    }

    traversalTreeInfo(item ,index) {
        let treeMap = this.treeMap;

        for(let ix=treeMap.length-1; ix>=0; ix--) {
            if(treeMap[ix].id === item.parentId) {
                treeMap[ix].children = treeMap[ix].children || [];

                let nodeObj = this.treeData.splice(index, 1)[0];
                nodeObj.lvl = treeMap[ix].lvl+1;

                treeMap[ix].isLeaf = false;
                nodeObj.key = this.nodeKey++;

                this.vm.$set(nodeObj, 'isLeaf', true);
                this.vm.$set(nodeObj, 'show', true);
                this.vm.$set(nodeObj, 'expanded', true);

                if(this.useCheckBox) {
                    this.vm.$set(nodeObj, 'checked', false);
                }

                nodeObj.parent = treeMap[ix];

                treeMap.push(nodeObj);
                return treeMap[ix].children.push(nodeObj);
            }
        }
    }

    handleExpandNode(node, expandMode) {

        node.expanded = expandMode;

        for(let ix=0, ixLen=node.children.length; ix<ixLen; ix++) {
            this.traversalDFS(node.children[ix], expandMode, node);
        }
    }

    traversalDFS(item, expandMode, parent) {

        if(item.isLeaf) {
            item.show = parent.show ? parent.expanded : parent.show;
            return;
        }

        if(expandMode) {
            if(parent.expanded && parent.show) {
                item.show = expandMode;
            }
        }
        else {
            item.show = expandMode;
        }


        for(let ix=0, ixLen=item.children.length; ix<ixLen; ix++) {
            this.traversalDFS(item.children[ix], expandMode, item);
        }
    }

    handleCheckNode(node, checkValue) {
        node.checked = checkValue;

        if(node.isLeaf) {
            this.traversalParentChecked(node.parent, checkValue);
        }
        else {

            for(let ix=0, ixLen=node.children.length; ix<ixLen; ix++) {
                this.traversalChildrenChecked(node.children[ix], checkValue);
                if(node.parent) {
                    this.traversalParentChecked(node.parent, checkValue);
                }
            }


        }

    }

    traversalParentChecked(item, checkValue) {
        let isAllChecked = true;
        for(let ix=0, ixLen=item.children.length; ix<ixLen; ix++) {
            if(!item.children[ix].checked) {
                isAllChecked = false;
            }
        }

        item.checked = isAllChecked;

        if (item.parent === null || isAllChecked !== checkValue) {
            return;
        }
        this.traversalParentChecked(item.parent, checkValue);
    }

    traversalChildrenChecked(item, checkValue) {
        item.checked = checkValue;

        if(item.isLeaf) {
            return;
        }

        for(let ix=0, ixLen=item.children.length; ix<ixLen; ix++) {
            this.traversalChildrenChecked(item.children[ix], checkValue);
        }
    }
}