import { defaultsDeep } from 'lodash-es';

const DEFAULT_OPTIONS = {
  show: true,
  useDebounce: true,
  chartIdx: 0,
  height: 100,
  showLabel: false,
  selection: {
    fillColor: '#38ACEC',
    opacity: 0.65,
  },
  useWheelMove: true,
};

// eslint-disable-next-line import/prefer-default-export
export const useBrushModel = () => {
  const getNormalizedBrushOptions = options => defaultsDeep({}, options, DEFAULT_OPTIONS);

  return {
    getNormalizedBrushOptions,
  };
};
