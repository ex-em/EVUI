import { PATH_COMMAND } from './Constant';

export default {

    createElement: function(parent, tagName, attr, clsName) {
        let xmlns = 'http://www.w3.org/2000/svg',
            element;

        element = document.createElementNS(xmlns, tagName);

        if (attr) {
            this.addAttribute(element, attr);
        }

        if (clsName) {
            this.addClassName(element, clsName);
        }

        if (parent) {
            parent.appendChild(element);
        }

        return element;
    },

    addClassName: function(el, clsName) {
        el.setAttribute('class', this.classes(el)
            .concat(clsName.trim().split(/\s+/))
            .filter(function(elem, pos, self) {
                return self.indexOf(elem) === pos;
            }).join(' ')
        );
    },

    classes: function(el) {
        return el.getAttribute('class') ? el.getAttribute('class').trim().split(/\s+/) : [];
    },

    removeClassName: function(el, clsName){
        let removedClasses = clsName.trim().split(/\s+/);

        el.setAttribute('class', this.classes(el).filter(function(name) {
            return removedClasses.indexOf(name) === -1;
        }).join(' '));
    },

    addAttribute: function(el, attr) {
        let keys = Object.keys(attr),
            key, ix, ixLen;

        for (ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
            key = keys[ix];

            el.setAttribute(key, attr[key]);
        }
    },

    moveElement: function(x, y, isRelative) {
        let command = 'M',
            element;

        element = {
            command: isRelative ? command.toLowerCase() : command,
            x: +x,
            y: +y
        };

        return element;
    },

    lineElement: function(x, y, isRelative) {
        let command = 'L',
            element;

        element = {
            command: isRelative ? command.toLowerCase() : command,
            x: +x,
            y: +y
        };

        return element;
    },

    curveElement: function(x1, y1, x2, y2, x, y, isRelative) {
        let command = 'C',
            element;

        element = {
            command: isRelative ? command.toLowerCase() : command,
            x1: +x1,
            y1: +y1,
            x2: +x2,
            y2: +y2,
            x: +x,
            y: +y
        };

        return element;
    },

    arcElement: function(rx, ry, xAr, lAf, sf, x, y, isRelative) {
        let command = 'A',
            element;

        element = {
            command: isRelative ? command.toLowerCase() : command,
            rx: +rx,
            ry: +ry,
            xAr: +xAr,
            lAf: +lAf,
            sf: +sf,
            x: +x,
            y: +y
        };

        return element;
    },

    stringify: function(elements, accuracy) {
        let accuracyMultiplier = Math.pow(10, accuracy),
            resultString;

        resultString = elements.reduce(function(path, pathElement) {
            let params = PATH_COMMAND[pathElement.command.toLowerCase()].map(function(paramName) {
                return accuracy ?
                    (Math.round(pathElement[paramName] * accuracyMultiplier) / accuracyMultiplier) :
                    pathElement[paramName];
            });

            return path + pathElement.command + params.join(',');
        }, '');

        return resultString;
    }
};
