
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
