/**
 * Original Code
 * https://github.com/gionkunz/chartist-js.git
 * chartist-js/src/scripts/svg-path.js
 * chartist-js/src/scripts/axes/axis.js
 * modified by jykim
 */

export const PATH_COMMAND = {
    m: ['x', 'y'],
    l: ['x', 'y'],
    c: ['x1', 'y1', 'x2', 'y2', 'x', 'y'],
    a: ['rx', 'ry', 'xAr', 'lAf', 'sf', 'x', 'y']
};

export const AXIS_UNITS = {
    x: {
        pos: 'x',
        len: 'width',
        dir: 'horizontal',
        rectStart: 'x1',
        rectEnd: 'x2',
        rectOffset: 'y2'
    },
    y: {
        pos: 'y',
        len: 'height',
        dir: 'vertical',
        rectStart: 'y2',
        rectEnd: 'y1',
        rectOffset: 'x1'
    }
};
