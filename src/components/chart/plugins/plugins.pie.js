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

    const centerX = chartRect.width / 2;
    const centerY = chartRect.height / 2;

    const chartWidth = centerX - (padding.left + padding.right);
    const chartHeight = centerY - (padding.bottom + padding.top);
    const innerRadius = Math.min(chartWidth, chartHeight) * pieOption.doughnutHoleSize;
    const outerRadius = Math.min(chartWidth, chartHeight);

    for (let ix = 0; ix < pieDataSet.length; ix++) {
      const pie = pieDataSet[ix];
      if (!pie) {
        return;
      }

      let radius = outerRadius - (((outerRadius - innerRadius) / pieDataSet.length) * ix);
      if (pieOption?.pieStroke?.use) {
        radius -= pieOption.pieStroke.lineWidth;
      }

      pie.or = radius;
      if (ix < pieDataSet.length - 1) {
        pie.ir = outerRadius - (((outerRadius - innerRadius) / pieDataSet.length) * (ix + 1));
      } else {
        pie.ir = 1;
      }

      if (pie.total) {
        for (let jx = 0; jx < pie.data.length; jx++) {
          slice = pie.data[jx];
          value = slice.value;
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

            series.isSelect = hitInfo?.sId === slice.id;
            series.type = isDoughnut ? 'doughnut' : 'pie';
            series.centerX = centerX;
            series.centerY = centerY;
            series.radius = radius;
            series.startAngle = startAngle;
            series.endAngle = endAngle;
            series.data = { o: value };

            series.draw(ctx, strokeOptions);
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
    const innerRadius = Math.min(chartWidth, chartHeight) * pieOption.doughnutHoleSize;
    const outerRadius = Math.min(chartWidth, chartHeight);

    for (let ix = 0; ix < pieDataSet.length; ix++) {
      const pie = pieDataSet[ix];
      if (!pie) {
        return;
      }

      let radius = outerRadius - (((outerRadius - innerRadius) / pieDataSet.length) * ix);
      if (pieOption?.pieStroke?.use) {
        radius -= pieOption.pieStroke.lineWidth;
      }

      pie.or = radius;
      if (ix < pieDataSet.length - 1) {
        pie.ir = outerRadius - (((outerRadius - innerRadius) / pieDataSet.length) * (ix + 1));
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

            series.isSelect = hitInfo?.sId === slice.id;
            series.type = 'sunburst';
            series.centerX = centerX;
            series.centerY = centerY;
            series.radius = radius;
            series.startAngle = slice.sa;
            series.endAngle = slice.ea;
            series.data = { o: slice.value };

            series.draw(ctx, strokeOptions);
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
    const radius = Math.min(chartWidth, chartHeight) * pieOption.doughnutHoleSize;

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.fillOpacity = 0;
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.closePath();
    ctx.restore();

    // inner stroke
    if (pieOption?.pieStroke?.use) {
      ctx.beginPath();
      ctx.strokeStyle = pieOption.pieStroke.color;
      ctx.lineWidth = pieOption.pieStroke.lineWidth;
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
    }

    this.pieDataSet[this.pieDataSet.length - 1].ir = radius;
  },
};

export default modules;
