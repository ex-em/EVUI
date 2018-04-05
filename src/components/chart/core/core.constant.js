export const PATH_COMMAND = {
  m: ['x', 'y'],
  l: ['x', 'y'],
  c: ['x1', 'y1', 'x2', 'y2', 'x', 'y'],
  a: ['rx', 'ry', 'xAr', 'lAf', 'sf', 'x', 'y'],
};

export const AXIS_UNITS = {
  x: {
    pos: 'x',
    len: 'width',
    dir: 'horizontal',
    rectStart: 'x1',
    rectEnd: 'x2',
    rectOffsetCounter(position) {
      return position === 'top' ? 'y2' : 'y1';
    },
    rectOffset(position) {
      return position === 'top' ? 'y1' : 'y2';
    },
  },
  y: {
    pos: 'y',
    len: 'height',
    dir: 'vertical',
    rectStart: 'y2',
    rectEnd: 'y1',
    rectOffsetCounter(position) {
      return position === 'left' ? 'x2' : 'x1';
    },
    rectOffset(position) {
      return position === 'left' ? 'x1' : 'x2';
    },
  },
};
