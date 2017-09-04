---
title: "Visualization Implementation 1"
date: 2017-09-01T16:34:11-04:00
thumbnail: /images/v1_logo.png
cover: /images/v1_logo.png
cover_width: 350
cover_caption_class: centering
draft: true
---

First solution to Visualization Implementation 1 for CS725. The requirements for this
assignment can be found [here](http://www.cs.odu.edu/~mweigle/CS725-F17/VI1).
This first assignment explores R, D3, Git and Tableau.

<!--more-->

## D3
<link rel="stylesheet" type="text/css" href="/styles/home.css">

<img class="img-limit" alt="D3 Screenshot" src="/images/d3_s1.png">

Shown above is a screenshot of the Javascript attribute `circleAttributes`,
the HTML output created from D3 and the HTML rendering on an actual webpage.
I also rendered this D3 object here as shown below:

<div id="d3-div"></div>

<script src="/scripts/d3.v4.min.js"></script>
<script src="/scripts/v1.js"></script>

The code for this is as follows:

```Javascript
var circleRadii = [40, 20, 10];

// From Styling SVG Elements Based on Data
var svgContainer = d3.select("#d3-div").append("svg")
                                    .attr("width", 600)
                                    .attr("height", 100);

var circles = svgContainer.selectAll("circle")
                          .data(circleRadii)
                          .enter()
                          .append("circle")

var circleAttributes = circles
                       .attr("cx", 50)
                       .attr("cy", 50)
                       .attr("r", function (d) { return d; })
                       .style("fill", function(d) {
                         var returnColor;
                         if (d === 40) { returnColor = "green";
                         } else if (d === 20) { returnColor = "purple";
                         } else if (d === 10) { returnColor = "red"; }
                         return returnColor;
                       });

```

It should be noted that instead of using "body" as the element to append this figure to,
I used `#d3-div` which selects a `div` element in HTML with that id. This makes it easier
to keep everything in the in their respective sections.

## R


## Tableau


---

Hello

---
