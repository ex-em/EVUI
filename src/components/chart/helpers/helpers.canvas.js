export default {
  calculateX(value, min, max, area, startPoint) {
    if (value === null) {
      return null;
    }

    if (value > max || value < min) {
      return null;
    }

    const scalingFactor = area / (max - min);
    return Math.ceil(startPoint + (scalingFactor * (value - min)));
  },

  calculateY(value, min, max, area, startPoint) {
    let calcY;

    if (value === null) {
      return null;
    }

    if (value > max || value < min) {
      return null;
    }
    // Bar차트의 fillRect처리를 위해 invert값 추가 하여 Y값을 처리
    const scalingFactor = area / (max - min);
    if (startPoint) {
      calcY = startPoint - (scalingFactor * (value - (min || 0)));
    } else {
      calcY = -(scalingFactor * (value - (min || 0)));
    }
    return Math.floor(calcY);
  },
};
