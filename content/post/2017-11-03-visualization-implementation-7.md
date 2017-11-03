---
title: "Visualization Implementation 7"
date: 2017-11-03T00:00:00-04:00
categories: []
cover:
cover_alt: ""
cover_caption:
cover_link:
cover_title: ""
cover_width: 640
thumbnail: ./images/v7/v7_logo.png
square_thumb: false
description: ""
excerpt: ""
draft: false
article_class:
content_class:
nocopy: false
---
Solution to Visualization Implementation 7 for CS725. The requirements for this
assignment can be found [here](http://www.cs.odu.edu/~mweigle/CS725-F17/VI7).
This seventh assignment explores D3 to visualize data created in Visualization Implementation 3 in an interactive way.

<!--more-->

<link rel="stylesheet" type="text/css" href="../../../styles/home.css">
<style>
.rectangle {
	fill: steelblue;
}
.rectangle:hover {
	fill: orange;
}
.axis {
  font: 10px sans-serif;
}

.axis path,
.axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}
.bar{
  fill: steelblue;
}
.line {
  fill: none;
  stroke: steelblue;
  stroke-width: 2px;
}
</style>

## Interactive Barchart

To use my interactive barchart simply select the dropdown and select a year to view the donated amounts for each country for that year.
It will automatically transition upon selection.

<div id="drop" align=center></div>
<div id="barchart"></div>

Helpful links included:

- [Interactive barchart](http://bl.ocks.org/jonahwilliams/2f16643b999ada7b1909)


<!-- Scripts -->
<script src="../../../scripts/d3.v4.min.js"></script>
<script src="../../../scripts/v7/barchart.js"></script>
