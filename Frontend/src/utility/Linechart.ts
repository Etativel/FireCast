import * as d3 from "d3";
import type { NumberValue } from "d3";

type ChartDataPoint = { x: string; y: number };

export default function lineChart(data: ChartDataPoint[]) {
  const container = document.getElementById("chart-container");
  if (!container) {
    console.warn("Chart container not found");
    return;
  }
  const containerRect = container.getBoundingClientRect();
  const margin = { top: 20, right: 10, bottom: 40, left: 50 };
  const containerWidth = Math.max(containerRect.width - 20, 300); // 20px for padding
  const containerHeight = Math.max(containerRect.height - 20, 200);
  const width = containerWidth - margin.left - margin.right;
  const height = containerHeight - margin.top - margin.bottom;
  d3.select("#chart-container").select("svg").remove();

  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  const svg = d3
    .select("#chart-container")
    .append("svg")
    .attr("class", "svg-chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("background-color", "transparent")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const dataset = data.map((d) => ({ ...d, x: new Date(`1970-01-01T${d.x}`) }));

  const xExtent = d3.extent(dataset, (d) => d.x);
  if (xExtent[0] && xExtent[1]) {
    x.domain(xExtent as [Date, Date]);
  } else {
    x.domain([new Date(), new Date()]);
  }

  const yMin = d3.min(dataset, (d) => d.y);
  const yMax = d3.max(dataset, (d) => d.y);

  if (yMin !== undefined && yMax !== undefined) {
    y.domain([Math.floor(yMin) - 2, Math.ceil(yMax) + 2]);
  } else {
    y.domain([0, 10]);
  }

  const customTickFormat = (domainValue: Date | NumberValue): string => {
    const date =
      domainValue instanceof Date
        ? domainValue
        : new Date(domainValue.valueOf());
    const hours = date.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;
    return `${displayHour} ${ampm}`;
  };

  const xAxis = svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(customTickFormat));

  const yAxis = svg.append("g").call(d3.axisLeft(y).tickFormat(d3.format("d")));

  xAxis.select(".domain").remove();
  yAxis.select(".domain").remove();

  xAxis.selectAll(".tick line").style("opacity", 0);
  yAxis.selectAll(".tick line").style("opacity", 0);
  xAxis.selectAll("text").style("opacity", 0.7);
  yAxis.selectAll("text").style("opacity", 0.7);

  xAxis.selectAll("text").style("opacity", 0.7).style("fill", "#ffffff");

  yAxis.selectAll("text").style("opacity", 0.7).style("fill", "#ffffff");

  yAxis.selectAll(".tick").each(function () {
    const tickValue = d3.select(this).select("text").text();
    const yPosition = y(parseFloat(tickValue));
    svg
      .append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", yPosition)
      .attr("y2", yPosition)
      .attr("stroke", "rgba(255, 255, 255, 0.5)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5");
  });

  const line = d3
    .line<{ x: Date; y: number }>()
    .x((d) => x(d.x))
    .curve(d3.curveBasis)
    .y((d) => y(d.y));

  const path = svg
    .append("path")
    .datum(dataset)
    .attr("fill", "none")
    .attr("stroke", "rgba(198, 228, 230, 1)")
    .attr("stroke-width", 2)
    .attr("d", line);

  const pathNode = path.node();

  if (pathNode) {
    const totalLength = pathNode.getTotalLength();
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(500)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);
  }
}
