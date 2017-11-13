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

export const color = ['#d70206', '#f05b4f', '#f4c63d', '#d17905', '#453d3f', '#59922b', '#0544d3', '#6b0392', '#f05b4f', '#dda458', '#eacf7d', '#86797d', '#b2c326', '#6188e2', '#a748ca'];