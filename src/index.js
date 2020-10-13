import "./styles.css";
import * as d3 from "d3";
import axios from "axios";

const app = document.getElementById("app");
const tooltip = document.getElementById("tooltip");

const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

axios
  .get(url)
  .then((res) => {
    app.innerHTML = "";
    buildHeatmap(res.data);
  })
  .catch((err) => console.log(err));

const buildHeatmap = ({ baseTemperature, monthlyVariance }) => {
  const h = 500;
  const w = 900;
  const years = [...new Set(monthlyVariance.map((d) => d.year))];

  //build title
  d3.select("#app")
    .append("h1")
    .attr("id", "title")
    .text("Monthly Global Land-Surface Temperature");

  //build description
  d3.select("#app")
    .append("h3")
    .attr("id", "description")
    .html(
      `${monthlyVariance[0].year} - ${
        monthlyVariance[monthlyVariance.length - 1].year
      }: base temperature ${baseTemperature}&#8451;`
    );

  //build svg
  const svg = d3
    .select("#app")
    .append("svg")
    .attr("height", h)
    .attr("width", w);

  //build x-axis
  const xScale = d3
    .scaleLinear()
    .domain([
      monthlyVariance[0].year,
      monthlyVariance[monthlyVariance.length - 1].year
    ])
    .range([0, w]);

  const xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.format("d"));

  svg.append("g").call(xAxis).attr("id", "x-axis");

  //build y-axis
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const yScale = d3.scaleBand().domain(months).range([0, h]);

  const yAxis = d3.axisLeft().scale(yScale);

  svg.append("g").call(yAxis).attr("id", "y-axis");

  //color scale
  const myColors = d3
    .scaleLinear()
    .range(["#00FFBE", "#FF0041"])
    .domain([
      d3.min(monthlyVariance, (d) => d.variance + baseTemperature),
      d3.max(monthlyVariance, (d) => d.variance + baseTemperature)
    ]);

  //build rects
  svg
    .selectAll("rect")
    .data(monthlyVariance)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("x", 0)
    .attr("y", h)
    .attr("width", 0)
    .attr("height", 0)
    .attr("data-month", (d) => d.month - 1)
    .attr("data-year", (d) => d.year)
    .attr("data-temp", (d) => d.variance + baseTemperature)
    .style("fill", (d) => myColors(d.variance + baseTemperature))
    .on("mouseover", (d, i) => {
      tooltip.innerHTML = `${i.year} - ${months[i.month - 1]}<br>${(
        i.variance + baseTemperature
      ).toFixed(1)}&#8451`;
      tooltip.style.display = "block";
      tooltip.style.top = d.clientY + 10 + "px";
      tooltip.style.left = d.clientX + 10 + "px";
      tooltip.setAttribute("data-year", i.year);
    })
    .on("mouseout", (d, i) => {
      tooltip.style.display = "none";
    })
    .transition()
    .duration(500)
    .attr("width", w / years.length)
    .attr("height", h / 12)
    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(months[d.month - 1]));

  //build legend
  const legend = d3.select("#app").append("div").attr("id", "legend");

  const svgLegend = legend.append("svg").attr("width", 50).attr("height", 20);

  const minTemp = d3.min(monthlyVariance, (d) => d.variance + baseTemperature);
  const maxTemp = d3.max(monthlyVariance, (d) => d.variance + baseTemperature);
  const legendTemps = [
    minTemp,
    (maxTemp - minTemp) / 4,
    (maxTemp - minTemp) / 2,
    (maxTemp - minTemp) / 2 + (maxTemp - minTemp) / 4,
    maxTemp
  ];

  svgLegend
    .selectAll("rect")
    .data(legendTemps)
    .enter()
    .append("rect")
    .attr("height", 20)
    .attr("width", 20)
    .attr("x", (d, i) => i * 20)
    .attr("y", 0)
    .style("fill", (d) => myColors(d));

  const xLegendScale = d3.scaleBand().domain(legendTemps).range([0, 100]);

  const xLegendAxis = d3
    .axisBottom()
    .scale(xLegendScale)
    .tickFormat(d3.format("d"));

  svgLegend.append("g").call(xLegendAxis);
};
