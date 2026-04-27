const modules = {
  pieDataSet: [],
  /**
   * Draw series data
   *
   * @params hitInfo
   *
   * @returns {undefined}
   */
  drawPie(hitInfo) {
    const ctx = this.bufferCtx;
    const chartRect = this.chartRect;
    const pieDataSet = this.pieDataSet;
    const pieOption = this.options;
    const padding = this.options.padding;
    const isDoughnut = !!pieOption.doughnutHoleSize;

    let slice;
    let value;
    let sliceAngle;
    let startAngle = 1.5 * Math.PI;
    let endAngle;
    let series;
    let percentage;

    const centerX = chartRect.width / 2;
    const centerY = chartRect.height / 2;

    const chartWidth = centerX - (padding.left + padding.right);
    const chartHeight = centerY - (padding.bottom + padding.top);
    if (
      (typeof chartWidth === 'number' && chartWidth < 0) ||
      (typeof chartHeight === 'number' && chartHeight < 0)
    ) {
      return;
    }

    const innerRadius = Math.min(chartWidth, chartHeight) * pieOption.doughnutHoleSize;
    const outerRadius = Math.min(chartWidth, chartHeight);

    for (let ix = 0; ix < pieDataSet.length; ix++) {
      const pie = pieDataSet[ix];
      if (!pie) {
        return;
      }

      let radius = outerRadius - ((outerRadius - innerRadius) / pieDataSet.length) * ix;
      if (pieOption?.pieStroke?.use) {
        radius -= pieOption.pieStroke.lineWidth;
      }

      if (radius < 0) {
        return;
      }

      pie.or = radius;
      if (ix < pieDataSet.length - 1) {
        pie.ir = outerRadius - ((outerRadius - innerRadius) / pieDataSet.length) * (ix + 1);
      } else {
        pie.ir = 1;
      }

      if (pie.total) {
        for (let jx = 0; jx < pie.data.length; jx++) {
          slice = pie.data[jx];
          value = slice.value;
          percentage = (value / pie.total) * 100;
          sliceAngle = 2 * Math.PI * (value / pie.total);
          endAngle = startAngle + sliceAngle;

          slice.sa = startAngle;
          slice.ea = endAngle;
          series = this.seriesList[slice.id];

          if (value) {
            const strokeOptions = { ...pieOption.pieStroke };
            if (pie.data.length === 1 && pieOption.pieStroke.use) {
              strokeOptions.use = false;

              ctx.lineWidth = pieOption.pieStroke.lineWidth;
              ctx.strokeStyle = pieOption.pieStroke.color;
              ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
              ctx.stroke();
            }

            const { selectInfo, legendHitInfo, unSelectedOpacity } = hitInfo;
            series.isSelect = selectInfo?.sId === slice.id;
            series.isDownplay = legendHitInfo && legendHitInfo.sId !== slice.id;
            series.type = isDoughnut ? 'doughnut' : 'pie';
            series.centerX = centerX;
            series.centerY = centerY;
            series.radius = radius;
            series.doughnutHoleSize = radius * (pieOption.doughnutHoleSize ?? 0);
            series.startAngle = startAngle;
            series.endAngle = endAngle;
            series.data = { o: value, percentage };

            series.draw(ctx, strokeOptions, unSelectedOpacity);
            startAngle += sliceAngle;
          }
        }
      }
    }
  },

  /**
   * Draw series data
   *
   * @params hitInfo
   *
   * @returns {undefined}
   */
  drawSunburst(hitInfo) {
    const ctx = this.bufferCtx;
    const { width, height } = this.chartRect;
    const pieDataSet = this.pieDataSet;
    const pieOption = this.options;
    const padding = this.options.padding;

    this.calculateAngle();

    let slice;
    let series;

    const centerX = width / 2;
    const centerY = height / 2;

    const chartWidth = centerX - (padding.left + padding.right);
    const chartHeight = centerY - (padding.bottom + padding.top);
    if (
      (typeof chartWidth === 'number' && chartWidth < 0) ||
      (typeof chartHeight === 'number' && chartHeight < 0)
    ) {
      return;
    }

    const innerRadius = Math.min(chartWidth, chartHeight) * pieOption.doughnutHoleSize;
    const outerRadius = Math.min(chartWidth, chartHeight);

    for (let ix = 0; ix < pieDataSet.length; ix++) {
      const pie = pieDataSet[ix];
      if (!pie) {
        return;
      }

      let radius = outerRadius - ((outerRadius - innerRadius) / pieDataSet.length) * ix;
      if (pieOption?.pieStroke?.use) {
        radius -= pieOption.pieStroke.lineWidth;
      }

      if (radius < 0) {
        return;
      }

      pie.or = radius;
      if (ix < pieDataSet.length - 1) {
        pie.ir = outerRadius - ((outerRadius - innerRadius) / pieDataSet.length) * (ix + 1);
      } else {
        pie.ir = 1;
      }

      for (let jx = 0; jx < pie.data.length; jx++) {
        slice = pie.data[jx];

        if (slice.id === 'dummy') {
          ctx.save();
          ctx.globalCompositeOperation = 'destination-out';
          ctx.beginPath();
          ctx.fillStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#fff';
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, slice.sa, slice.ea);
          ctx.stroke();
          ctx.fill();
          ctx.closePath();
          ctx.restore();
        } else {
          series = this.seriesList[slice.id];

          if (slice.value) {
            const strokeOptions = { ...pieOption.pieStroke };
            if (pie.data.length === 1 && pieOption.pieStroke.use) {
              strokeOptions.use = false;

              ctx.lineWidth = pieOption.pieStroke.lineWidth;
              ctx.strokeStyle = pieOption.pieStroke.color;
              ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
              ctx.stroke();
            }

            const { selectInfo, legendHitInfo, unSelectedOpacity } = hitInfo;
            series.isSelect = selectInfo?.sId === slice.id;
            series.isDownplay = legendHitInfo && legendHitInfo.sId !== slice.id;
            series.type = 'sunburst';
            series.centerX = centerX;
            series.centerY = centerY;
            series.radius = radius;
            series.doughnutHoleSize = radius * (pieOption.doughnutHoleSize ?? 0);
            series.startAngle = slice.sa;
            series.endAngle = slice.ea;
            series.data = { o: slice.value };

            series.draw(ctx, strokeOptions, unSelectedOpacity);
          }
        }
      }
    }
  },

  /**
   * Draw doughnut hole
   * @param ctx
   */
  drawDoughnutHole(ctx = this.bufferCtx) {
    const pieOption = this.options;
    const { width, height } = this.chartRect;
    const padding = this.options.padding;
  
    const centerX = width / 2;
    const centerY = height / 2;
  
    const chartWidth = centerX - (padding.left + padding.right);
    const chartHeight = centerY - (padding.bottom + padding.top);
  
    if (
      (typeof chartWidth === 'number' && chartWidth < 0) ||
      (typeof chartHeight === 'number' && chartHeight < 0)
    ) {
      return;
    }
  
    const radius = Math.min(chartWidth, chartHeight) * pieOption.doughnutHoleSize;
  
    const pixelRatio = this.pixelRatio || window.devicePixelRatio || 1;
    const isFractionalPixelRatio = !Number.isInteger(pixelRatio);
  
    const alignToDevicePixel = (value) => Math.round(value * pixelRatio) / pixelRatio;
    const ceilToDevicePixel = (value) => Math.ceil(value * pixelRatio) / pixelRatio;
  
    const adjustedCenterX = isFractionalPixelRatio ? alignToDevicePixel(centerX) : centerX;
    const adjustedCenterY = isFractionalPixelRatio ? alignToDevicePixel(centerY) : centerY;
  
    // fractional scale 환경에서 원 경계 잔여 픽셀이 남는 케이스를 줄이기 위해
    // hole 영역만 1 device pixel 정도 더 크게 덮는다.
    const erasePadding = isFractionalPixelRatio ? 1 / pixelRatio : 0;
    const adjustedRadius = isFractionalPixelRatio
      ? ceilToDevicePixel(radius + erasePadding)
      : radius;
  
    const isTransparentColor = (color) => {
      if (!color) {
        return true;
      }
  
      const normalizedColor = color.trim().toLowerCase();
  
      if (normalizedColor === 'transparent') {
        return true;
      }
  
      const colorMatch = normalizedColor.match(
        /rgba?\(\s*[\d.]+%?\s*(?:,|\s)\s*[\d.]+%?\s*(?:,|\s)\s*[\d.]+%?\s*(?:,|\/)\s*([\d.]+%?)\s*\)/,
      );
  
      if (!colorMatch) {
        return false;
      }
  
      return Number.parseFloat(colorMatch[1]) === 0;
    };
  
    const getDoughnutHoleColor = () => {
      const optionColor = pieOption?.doughnutHoleColor || pieOption?.backgroundColor;
  
      if (!isTransparentColor(optionColor)) {
        return optionColor;
      }
  
      let element = this.chartDOM || this.wrapperDOM || this.target;
  
      while (element && element !== document.documentElement) {
        const backgroundColor = getComputedStyle(element)?.backgroundColor;
  
        if (!isTransparentColor(backgroundColor)) {
          return backgroundColor;
        }
  
        element = element.parentElement;
      }
  
      return '#fff';
    };
  
    const doughnutHoleColor = getDoughnutHoleColor();
  
    ctx.save();
  
    // 일부 GPU 가속 환경에서 destination-out 합성 경계가 깨지는 케이스가 있어,
    // hole을 투명하게 지우지 않고 실제 배경색으로 덮는다.
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    ctx.fillStyle = doughnutHoleColor;
    ctx.arc(adjustedCenterX, adjustedCenterY, adjustedRadius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  
    ctx.restore();
  
    // inner stroke는 시각 보정용 adjustedRadius가 아니라 원래 논리 radius 기준으로 유지한다.
    if (pieOption?.pieStroke?.use) {
      ctx.beginPath();
      ctx.strokeStyle = pieOption.pieStroke.color;
      ctx.lineWidth = pieOption.pieStroke.lineWidth;
      ctx.arc(adjustedCenterX, adjustedCenterY, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.stroke();
    }
  
    // adjustedRadius는 렌더링 보정값이므로 hit-test 등에 사용되는 내부 논리값은 기존 radius를 유지한다.
    this.pieDataSet[this.pieDataSet.length - 1].ir = radius;
  },
};

export default modules;
