export default class TreeStore {
    constructor(props) {

        for(let prop in props) {
            this[prop] = props[prop];
        }

        if(this.data && this.data.length) {
            this.treeNode = [this.createNode(-1, 0, null, null)];
            this.treeMap = [];
            this.createTreeSet(this.data);
        }
    }

    createNode(key, lvl, parent, data) {
        return {
            key     : key,
            lvl     : lvl,
            parent  : parent,
            children: [],
            data    : data,
            expanded: true,
            visible : true
        };
    }

    createTreeSet() {
        let treeData = this.data;
        let currLvl = this.treeNode[0].lvl;
        let currNode = this.treeNode[0];

        for(let ix=0, ixLen=treeData.length; ix<ixLen; ix++) {
            let hasSibling = false;
            // check has children
            // check has sibling


            //check has children
            if(currLvl <= treeData[ix][0]) {

                // check has sibling
                for(let jx=ix+1; jx<ixLen; jx++) {
                    if(treeData[ix][0] === treeData[jx][0]) {
                        hasSibling = true;
                    }
                    break;
                }

                let newNode = this.createNode(ix, treeData[ix][0], currNode, treeData[ix]);
                currNode.children.push(newNode);
                this.treeMap[ix] = currNode.children[currNode.children.length -1];
                currLvl = treeData[ix][0];

                if(!hasSibling) {
                    currNode = newNode;
                }

            }
            else if(currLvl > treeData[ix][0]) {
                for(let jx=ix-1; jx>0; jx--) {
                    if(treeData[ix][0] > treeData[jx][0]) {
                        let newNode = this.createNode(ix, treeData[ix][0], this.treeMap[jx], treeData[ix]);
                        this.treeMap[jx].children.push(newNode);
                        this.treeMap[ix] = this.treeMap[jx].children[this.treeMap[jx].children.length -1];
                        currLvl = treeData[ix][0];
                        currNode = newNode;
                        break;
                    }
                }
            }
        }
    }

    setLeafInfo() {
        for(let ix=0, ixLen=this.treeMap.length; ix<ixLen; ix++) {
            let isLeaf = !this.treeMap[ix].children.length;

            this.treeMap[ix].isLeaf = isLeaf;
        }
    }

    expandChildrenNode(key, mode) {
        let currNode = this.treeMap[key];
        let childrenLen = currNode.children.length;
        // expand, collapse
        if(currNode.isLeaf) {
            return;
        }
        else {
            for(let ix=0; ix<childrenLen; ix++) {
                let childNode = currNode.children[ix];

                if(mode === 'collapse') {
                    if(childNode.expanded) {
                        if(childNode.visible) {
                            childNode.expanded = true;
                            childNode.visible = false;
                        }
                        else {
                            childNode.expanded = false;
                            childNode.visible = false;
                        }
                    }
                    else {
                        if(childNode.visible) {
                            childNode.expanded = false;
                            childNode.visible = false;
                        }
                        else {
                            childNode.expanded = false;
                            childNode.visible = false;
                        }
                    }
                }
                else {
                    if(childNode.expanded) {
                        if(childNode.visible) {
                            childNode.expanded = true;
                            childNode.visible = true;
                        }
                        else {
                            childNode.expanded = true;
                            childNode.visible = true;
                        }
                    }
                    else {
                        if(childNode.visible) {
                            childNode.expanded = false;
                            childNode.visible = false;
                        }
                        else {
                            childNode.expanded = false;
                            childNode.visible = true;
                        }
                    }
                }

                if(!childNode.parent.expanded) {
                    childNode.visible = false;
                }

                this.expandChildrenNode(currNode.children[ix].key, mode);
            }
        }
    }
}



