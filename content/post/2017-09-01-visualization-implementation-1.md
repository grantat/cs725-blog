---
title: "Visualization Implementation 1"
date: 2017-09-01T16:34:11-04:00
thumbnail: ./images/v1_logo.png
cover_width: 350
cover_caption_class: centering
draft: false
---

First solution to Visualization Implementation 1 for CS725. The requirements for this
assignment can be found [here](http://www.cs.odu.edu/~mweigle/CS725-F17/VI1).
This first assignment explores R, D3, Git and Tableau.

<!--more-->

This assignment required a git repository to be setup to host the assignment materials.
Therefore, the directory setup with the assignment material is as follows:

```
.
|-- data
|   `-- autos.dat
|-- docs
|   `-- autos.pdf
|-- images
|   `-- autos.png
|-- R
|   |-- autos_pdf.R
|   `-- autos_png.R
|-- scripts
|   |-- d3.v4.min.js
|   `-- v1.js
`-- index.html
```

Any other directories or files are used simply for styling the website.

## D3
<link rel="stylesheet" type="text/css" href="../../../styles/home.css">

<img class="img-limit" alt="D3 Screenshot" src="../../../images/d3_s1.png">

Shown above is a screenshot of the Javascript attribute `circleAttributes`,
the HTML output created from D3 and the HTML rendering on an actual webpage.
I also rendered this D3 object here as shown below:

<div id="d3-div"></div>

<script src="../../../scripts/d3.v4.min.js"></script>
<script src="../../../scripts/v1.js"></script>

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

<img class="img-limit center-block" alt="R png" src="../../../images/autos.png">

The png example given in Frank McCown's "Producing Simple Graphs with R"[^rintro] calls upon
various functions to help create the `autos` line graph shown above.
The functions and their parameters can be explained as follows:

- `autos_data <- read.table(...)`: creates a data table from the autos.dat
that has a header to describe the columns of data and the information is seperated by tabs (\t). It should be noted since I worked on mac my
data location was "../data/autos.dat"
- `max_y <- max(autos_data)`: finds the max value in the autos_data data
table
- `plot_colors <- c("blue","red","forestgreen")`: sets a vector of colors
to a variable
- `png()`: starts a buffer to a png image file
- `plot(autos_data$cars,...)`: plots the autos_data cars column with the color blue setting the y limit to the max value found in the data set. Type "o" sets the plot to have both dots and lines.
- `axis(1, at=1:5, lab=...)`: sets custom X axis from position 1 to 5 with weekday labels
- `axis(2, las=1, at=4*0:max_y)`: sets custom Y axis with the same tick marks as the x axis with a range of 0 to max value of the data set of intervals of 4.
- `box()`: adds parameter box to a plot
- `lines(autos_data$trucks,...)`: adds lines to autos_data trucks column data. The variables pch and lty specifiy the dot shape and line type.
- `lines(autos_data$subs,...)`: adds line to autos_data suvs column data.
- `title(main="Autos", col.main="red",...)`: adds a title to the plot with a red font of font type 4.
- `title(xlab="Days", col.lab=rgb(0,0.5,0))`: sets X axis label to days, specifying a color on the rgb color scale
- `title(xlab="Days", col.lab=rgb(0,0.5,0))`: sets Y axis label to Total, specifying a color on the rgb color scale
- `legend(1, max_y, names(autos_data), cex=0.8,...)`: adds a legend at an (x, y) position, in this case (1, max_y). The legend will contain the names of the autos_data columns with a text scale of 0.8, smaller than regular. Each of the columns has a different dot shape assigned to it, therefore it is assigned this way in the legend along with the different line types.

My submission for the pdf version of McCown's tutorial can be found [here](/docs/autos.pdf).

## Tableau

<img class="img-limit" alt="Tableau screenshot" src="../../../images/tableau_last_slide.png">

When I first opened Tableau desktop I felt a little overwhelmed.
Tableau offers a lot of features for visualizing and analyzing data.
I really enjoyed the options for filtering and applying it to multiple worksheets it really
reminds a user of using an Excel type of application. However, I'm not partial to applications
that I'm not always certain of how they are manipulating the data. I believe Tableau has
a maturity and reason to be liked, but I think a user must use it for a long period of
time to grow on it.

As far as speed for creating visualizations versus something like R, I think Tableau would win.
Tableau provides predefined visualization templates such as: maps, bar charts, box-and-whisker-plots
and etc. It also allows data to be easily colored without a bit of code. In terms of speed it would win,
in terms of actually exploring data I think it would be a tough sale on who wins.

The figure shown above, is the final image result of the tutorial for Tableau Desktop[^ttutorial].


[^rintro]: Producing Simple Graphs with R. Frank McCown, http://www.harding.edu/fmccown/r/
[^ttutorial]: Get Started with Tableau Desktop. Tableau, http://onlinehelp.tableau.com/current/guides/get-started-tutorial/en-us/get-started-tutorial-home.html
