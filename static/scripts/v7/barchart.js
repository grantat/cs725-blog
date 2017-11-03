
function createBarchart(){
    var margin = {top: 80, right: 180, bottom: 150, left: 180},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var svg = d3.select("#barchart").append("svg")
    	.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    	.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // set the ranges
    var xrange = d3.scaleBand()
              .range([0, width])
              .padding(0.1);
    var yrange = d3.scaleLinear()
              .range([height, 0]);
  // append the svg object to the body of the page
  // append a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  // var svg = d3.select("#barchart").append("svg")
  //     .attr("width", width + margin.left + margin.right)
  //     .attr("height", height + margin.top + margin.bottom)
  //   .append("g")
  //     .attr("transform",
  //           "translate(" + margin.left + "," + margin.top + ")");

  //
  // barchart
  //

  d3.csv("../../../data/v7/country_year_amount.csv", function(error, data) {
    if (error) throw error;

    // filter year
    // var data = data.filter(function(d){return d.Year == '2012';});
    // Get every column value
    var elements = Object.keys(data[0])
        .filter(function(d){
            return ((d != "Year") & (d != "donor"));
        });
    var selection = elements[0];

    var y = d3.scaleLinear()
            .domain([0, d3.max(data, function(d){
                return +d[selection];
            })])
            .range([height, 0]);

    var x = d3.scaleBand()
            .domain(data.map(function(d){ return d.donor;}))
            .range([0, width]);

    var xAxis = d3.axisBottom(x);

    var yAxis = d3.axisLeft(y);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("font-size", "8px")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.55em")
        .attr("transform", "rotate(-90)" );


    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.selectAll("rectangle")
        .data(data)
        .enter()
        .append("rect")
        .attr("class","rectangle")
        .attr("width", width/data.length)
        .attr("height", function(d){
            return height - y(+d[selection]);
        })
        .attr("x", function(d, i){
            return (width / data.length) * i ;
        })
        .attr("y", function(d){
            return y(+d[selection]);
        })
        .append("title")
        .text(function(d){
            return d.donor + " : " + d[selection];
        });

    var selector = d3.select("#drop")
        .append("select")
        .attr("id","dropdown")
        .on("change", function(d){
            selection = document.getElementById("dropdown");

            y.domain([0, d3.max(data, function(d){
                return +d[selection.value];})]);

            yAxis.scale(y);

            d3.selectAll(".rectangle")
                .transition()
                .attr("height", function(d){
                    return height - y(+d[selection.value]);
                })
                .attr("x", function(d, i){
                    return (width / data.length) * i ;
                })
                .attr("y", function(d){
                    return y(+d[selection.value]);
                })
                .ease(d3.easeLinear)
                .select("title")
                .text(function(d){
                    return d.donor + " : " + d[selection.value];
                });

            d3.selectAll("g.y.axis")
                .transition()
                .call(yAxis);

         });

    selector.selectAll("option")
      .data(elements)
      .enter().append("option")
      .attr("value", function(d){
        return d;
      })
      .text(function(d){
        return d;
    });

    // // text label for the x axis
    svg.append("text")
        .attr("transform",
              "translate(" + (width/2) + " ," +
                             (height + 20 + 85) + ")")
        .style("text-anchor", "middle")
        .text("Donating Country");


    // // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 100 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Amount Donated");

  });
}

createBarchart();
