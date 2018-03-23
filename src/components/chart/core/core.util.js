export default {
  defaultColor: ['#3ca0ff', '#90db3b', '#00c4c5', '#ffde00', '#0052ff', '#ff7781', '#3191c8', '#5048c1', '#5bc89e',
    '#28776f', '#17becf', '#beaa3c', '#cedc96', '#c86ebd', '#5e5e5e', '#969696', '#709d34', '#24456b', '#dace90', '#888bd7'],

  extraColor: [],

  quantity(input) {
    let output;

    if (typeof input === 'string' || typeof input === 'number') {
      const match = (/^(normal|(\d+(?:\.\d+)?)(px|%)?)$/).exec(input);
      output = match ? { value: +match[2], unit: match[3] || undefined } : undefined;
    } else {
      output = undefined;
    }
    return output;
  },
};
