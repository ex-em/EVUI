export default {
    defaultColor: ['#3ca0ff','#90db3b','#00c4c5','#ffde00','#0052ff','#ff7781','#3191c8','#5048c1', '#5bc89e',
        '#28776f','#17becf','#beaa3c','#cedc96','#c86ebd','#5e5e5e','#969696','#709d34','#24456b','#dace90','#888bd7'],

    extraColor: [],

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
    },

    /**
     * 임의의 색상 Hex 코드값을 반환.
     *
     * 입력된 색상 코드값을 기준으로 임의의 색상 코드값을 반환하고,
     * 입력된 값이 없는 경우 임의의 값을 반환한다.
     *
     * 예) decimalToHex('#3ca0ff')
     *
     * @param {String} h
     * @return {String}
     */
    decimalToHex: function(h) {
        if (!h) {
            return '#' + Math.floor(Math.random() * 16777215).toString(16);
        }

        h = h.split('#')[1];
        if (!h || '' === h) {
            return h;
        }
        let d = parseInt(h, 16) + 100,
            hex = Number(d).toString(16);

        hex = "000000".substr(0, 6 - hex.length) + hex;

        return '#'+hex;
    },

    getColor: function(index) {
        let color = this.defaultColor;

        if (index >= color.length) {
            color.push(this.decimalToHex(color[index % 20]));

            return color[index];
        } else {
            return color[index];
        }
    }

}