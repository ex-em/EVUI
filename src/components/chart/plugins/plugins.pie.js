const alignToDevicePixel = (value, pixelRatio) => Math.round(value * pixelRatio) / pixelRatio;
const ceilToDevicePixel = (value, pixelRatio) => Math.ceil(value * pixelRatio) / pixelRatio;

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

const resolveDoughnutHoleColor = (pieOption, rootElement) => {
  const optionColor = pieOption?.doughnutHoleColor;

  if (!isTransparentColor(optionColor)) {
    return optionColor;
  }

  let element = rootElement;

  while (element) {
    const backgroundColor = getComputedStyle(element)?.backgroundColor;

    if (!isTransparentColor(backgroundColor)) {
      return backgroundColor;
    }

    element = element.parentElement;
  }

  return '#fff';
};

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

    const adjustedCenterX = isFractionalPixelRatio
      ? alignToDevicePixel(centerX, pixelRatio)
      : centerX;
    const adjustedCenterY = isFractionalPixelRatio
      ? alignToDevicePixel(centerY, pixelRatio)
      : centerY;

    // fractional scale 환경에서 원 경계 잔여 픽셀이 남는 케이스를 줄이기 위해
    // hole 영역만 1 device pixel 정도 더 크게 덮는다.
    const erasePadding = isFractionalPixelRatio ? 1 / pixelRatio : 0;
    const adjustedRadius = isFractionalPixelRatio
      ? ceilToDevicePixel(radius + erasePadding, pixelRatio)
      : radius;

    const rootElement = this.chartDOM || this.wrapperDOM || this.target;
    const doughnutHoleColor = resolveDoughnutHoleColor(pieOption, rootElement);
    this._lastDoughnutHoleColor = doughnutHoleColor;

    ctx.save();

    // 일부 GPU 가속 환경에서 destination-out의 가장자리가 깨져 source-over로 칠한다.
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

  /**
   * 다크↔라이트 테마 토글 등 상위 DOM의 background-color가 바뀌었을 때
   * hole 색이 자동으로 갱신되도록 documentElement / body 의 attribute 변화를 감시한다.
   *
   * - doughnutHoleColor 옵션이 명시되어 있으면 사용자가 직접 색을 통제하는 것으로 보고
   *   옵저버를 등록하지 않는다 (옵션을 reactive로 바인딩한 경우 Vue가 update를 트리거하므로 불필요).
   * - doughnutHoleSize가 0이면 hole 자체를 그리지 않으므로 등록하지 않는다.
   */
  setupDoughnutHoleThemeObserver() {
    if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') {
      return;
    }
    if (!(this.options?.doughnutHoleSize > 0)) {
      return;
    }
    if (this.options?.doughnutHoleColor) {
      return;
    }
    if (this._doughnutHoleThemeObserver) {
      return;
    }

    // 테마 클래스가 html/body가 아니라 그 하위 wrapper div에 붙는 앱도 흔하므로
    // documentElement subtree 전체의 attribute 변화를 감시한다.
    // 다양한 무관 mutation에 대해 매번 DOM walk를 돌지 않도록 rAF로 coalesce 한다.
    this._doughnutHoleThemeObserver = new MutationObserver(() => {
      if (this._doughnutHoleThemeRafId != null) {
        return;
      }

      this._doughnutHoleThemeRafId = requestAnimationFrame(() => {
        this._doughnutHoleThemeRafId = null;

        if (!this.isInit) {
          return;
        }

        const rootElement = this.chartDOM || this.wrapperDOM || this.target;
        if (!rootElement) {
          return;
        }

        const nextColor = resolveDoughnutHoleColor(this.options, rootElement);
        if (nextColor !== this._lastDoughnutHoleColor) {
          this.render();
        }
      });
    });

    if (document.documentElement) {
      this._doughnutHoleThemeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'style', 'data-theme'],
        subtree: true,
      });
    }
  },

  teardownDoughnutHoleThemeObserver() {
    if (this._doughnutHoleThemeObserver) {
      this._doughnutHoleThemeObserver.disconnect();
      this._doughnutHoleThemeObserver = null;
    }
    if (this._doughnutHoleThemeRafId != null) {
      cancelAnimationFrame(this._doughnutHoleThemeRafId);
      this._doughnutHoleThemeRafId = null;
    }
  },
};

export default modules;
