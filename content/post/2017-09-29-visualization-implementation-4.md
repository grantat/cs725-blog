---
title: "Visualization Implementation 4"
date: 2017-09-29T00:00:00-04:00
categories: []
cover:
cover_alt: ""
cover_caption:
cover_link:
cover_title: ""
cover_width: 640
thumbnail: ./images/v4/v4_logo.png
square_thumb: false
description: ""
excerpt: ""
draft: false
article_class:
content_class:
nocopy: false
---
Solution to Visualization Implementation 4 for CS725. The requirements for this
assignment can be found [here](http://www.cs.odu.edu/~mweigle/CS725-F17/VI4).
This fourth assignment explores D3 to visualize data created in Visualization Implementation 3.

<!--more-->

<link rel="stylesheet" type="text/css" href="../../../styles/home.css">
<style>
.bar{
  fill: steelblue;
}
.line {
  fill: none;
  stroke: steelblue;
  stroke-width: 2px;
}
</style>

## Getting started with D3

When comparing D3 with Vega-Lite I think D3 definitely wins in a fight for me.
D3 is a far heavier coding library which allows for much more customizable features.
It may require heavier debugging that Vega-lite, but it after a while you get used to it.
When using Vega-Lite you are more likely just supplying the library with a template which
it interprets for you. Which is nice in some ways, but eventually those templates will run
out.

For both charts I practically used the same exact code, just changing variables for what
the graph should present from my data. One of the things I didn't attempt to modify
was the y-axis range for the funds/amounts that the organizations received. I didn't
specify this in Vega-Lite so I believe I don't need to in D3, but it should be noted
that they are different.

## Chart 1

<div id="linechart"></div>

The code to generate this graph is as follows:

```Javascript
function createLineChart(){

  // set the dimensions and margins of the graph
  var margin = {top: 20, right: 20, bottom: 150, left: 100},
      width = 700 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  // parse the date / time
  var parseTime = d3.timeParse("%y");

  // set the ranges
  var x = d3.scaleBand().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  // define the line
  var valueline = d3.line()
      .x(function(d) { return x(d.year); })
      .y(function(d) { return y(d.amount); });

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3.select("#linechart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // Get the data
  d3.json("../../../data/v4/year_amount.json", function(error, data) {
    if (error) throw error;

    // format the data
    data.forEach(function(d) {
        d.date = parseTime(d.date);
        console.log(d.year, d.amount);
        d.amount = +d.amount;
    });

    // sort ascending
    data.sort(function(a, b) { return a.year - b.year; });

    // Scale the range of the data
    x.domain(data.map(function(d) { return d.year; }));
    y.domain([0, d3.max(data, function(d) { return d.amount; })]);

    // Add the valueline path.
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", valueline);

    // Add the X Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", function(d) {
           return "translate(" + this.getBBox().height*-1 + "," +
                  this.getBBox().height + ")rotate(-90)";
         })
        .style("text-anchor", "end");

    // text label for the x axis
    svg.append("text")
        .attr("transform",
              "translate(" + (width/2) + " ," +
                             (height + margin.top + 40) + ")")
        .style("text-anchor", "middle")
        .text("Years");

    // Add the Y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Total Funds (millions)");
  });

}

createLineChart();
```

Remarks on ease: This one was easier than the bar chart since I could use
almost everything in the bar chart for this graph.

Helpful links included:

- [Building a line chart](https://bl.ocks.org/mbostock/3883245)
- [Sorting a barchart](https://bl.ocks.org/mbostock/1584697)

## Chart 2

<div id="barchart"></div>

The code for this graph is as follows:

```Javascript
function createBarchart(){
  // set the dimensions and margins of the graphs
  var margin = {top: 20, right: 20, bottom: 150, left: 100},
      width = 400 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  // set the ranges
  var x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);
  var y = d3.scaleLinear()
            .range([height, 0]);

  // append the svg object to the body of the page
  // append a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3.select("#barchart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  //
  // barchart
  //

  d3.json("../../../data/v4/recip_amount.json", function(error, data) {
    if (error) throw error;

    // format the data
    data.forEach(function(d) {
      d.amount = +d.amount
    });

    // sort descending
    data.sort(function(a, b) { return b.amount - a.amount; });

    // Scale the range of the data in the domains
    x.domain(data
             .filter(function(d) { return d.amount >= 10000000})
             .map(function(d) { return d.recip; }));
    y.domain([0, d3.max(data, function(d) { return d.amount; })]);

    // append the rectangles for the bar chart
    svg.selectAll("#barchart")
        .data(data)
      .enter().append("rect")
        .filter(function(d) { return d.amount >= 10000000 })
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.recip); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.amount); })
        .attr("height", function(d) { return height - y(d.amount); });

    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", function(d) {
           return "translate(" + this.getBBox().height*-1 + "," +
                  this.getBBox().height + ")rotate(-90)";
         })
        .style("text-anchor", "end");

    // text label for the x axis
    svg.append("text")
        .attr("transform",
              "translate(" + (width/2) + " ," +
                             (height + margin.top + 20 + 85) + ")")
        .style("text-anchor", "middle")
        .text("Recipient Countries");

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Total Amount Received (millions)");

  });
}

createBarchart();
```

Remarks on ease: Since I started making this chart first, the barchart, I found this one to be
much more difficult since I had to learn how to transform text on the x and y axis.


Helpful links included:

- [Creating barchart](https://bl.ocks.org/d3noob/bdf28027e0ce70bd132edc64f1dd7ea4)
- [Creating x and y axis labels](https://bl.ocks.org/d3noob/23e42c8f67210ac6c678db2cd07a747e)
- [Rotating x-axis labels](https://bl.ocks.org/d3noob/3c040800ff6457717cca586ae9547dbf)


<!-- Scripts -->
<script src="../../../scripts/d3.v4.min.js"></script>
<script src="../../../scripts/v4/barchart.js"></script>
<script src="../../../scripts/v4/linechart.js"></script>
