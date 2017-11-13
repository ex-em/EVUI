export default {
    quantity: function(input) {
        if (typeof input === 'string') {
            let match = (/^(\d+)\s*(.*)$/g).exec(input);
            return {
                value : +match[1],
                unit: match[2] || undefined
            };
        }
        return { value: input };
    },

    extend: function (srcTarget) {
        let target = srcTarget || {},
            ix, ixLen, jx, jxLen,
            source, sourceProp, keys, key;

        for (ix = 1, ixLen = arguments.length; ix < ixLen; ix++) {
            source = arguments[ix];
            keys = Object.keys(source);
            for(jx = 0, jxLen = keys.length; jx < jxLen; jx++) {
                key = keys[jx];
                sourceProp = source[key];
                if (typeof sourceProp === 'object' && sourceProp !== null && !(sourceProp instanceof Array)) {
                    target[key] = this.extend(target[key], sourceProp);
                } else {
                    target[key] = sourceProp;
                }
            }
        }

        return target;
    },

    getNumberValue: function(value) {
        let isNumber = value === null ? false : isFinite(value);

        return isNumber ? +value : undefined;
    },

    // return format: yyyy-mm-dd
    getDateFormat: function(dateOrg) {
        let date = new Date(dateOrg);

        return String(date.getFullYear()) + "-" +
            (date.getMonth()+1 < 10 ? '0' : '') +
            String(date.getMonth()+1) + "-" +
            (date.getDate() < 10 ? '0' : '') + String(date.getDate());
    },

    // return format: h24:mi:ss
    getTime: function(time) {
        let date;

        if (!time) {
            date = new Date();
        }
        else {
            date = new Date(time);
        }

        return (date.getHours()   < 10 ? '0' : '') + date.getHours()   + ":" +
            (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ":" +
            (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
    },

    clone: function(obj) {
        if (obj === null || typeof(obj) !== 'object') {
            return obj;
        }

        let copy = obj.constructor();

        for (let attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                copy[attr] = this.clone(obj[attr]);
            }
        }

        return copy;
    },

    hasClass: function(element, className) {
        return (' ' + element.getAttribute('class') + ' ').indexOf(' ' + className + ' ') > -1;
    }
}