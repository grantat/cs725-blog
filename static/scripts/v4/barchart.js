
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
