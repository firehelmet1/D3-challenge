
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "smokes";


// function used for updating x-scale var upon click on axis label
function xScale(hairData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(hairData, d => d[chosenXAxis]) * 0.8,
      d3.max(hairData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

//  updating xAxis var upon click on axis label
function renderXaxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

////////// UPDATING THE Y-AXIS upon click
function yScale(hairData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([
      d3.max(hairData, d => d[chosenYAxis]) * 1.2,
      d3.min(hairData, d => d[chosenYAxis]) * 0.8
    ])
    .range([0, height]);

  return yLinearScale;

}

// function used for updating yAxis var upon click on axis label
function renderYaxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, 
                      newXScale, chosenXAxis, 
                      newYScale, chosenYAxis) {
    circlesGroup.transition()
    .duration(800)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var label = "Poverty Rate:";
  }
  else if (chosenXAxis === "age") {
    var label = "Age (median):";
  }
  else if (chosenXAxis === "income") {
    var label = "Household Income (median)";
  }

  if (chosenYAxis === "smokes") {
    var yLabel = "Smokes(%):";
  }
  else if (chosenYAxis === "obesity") {
    var yLabel = "Obese(%):";
  }
  else if (chosenYAxis === "healthcare") {
    var yLabel = "Lacks Healthcare (%)";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .style("background-color", "white")
    .html(function(d) {
      return (`${d.abbr}<br>${label} ${d[chosenXAxis]} <br> ${yLabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv", function(err, hairData) {
 // if (err) throw err;

  // parse data
  hairData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;
    data.healthcare = +data.healthcare;
    data.income = +data.income;
  });

  // LinearScale functions above csv import
  var xLinearScale = xScale(hairData, chosenXAxis);
  var yLinearScale = yScale(hairData, chosenYAxis);


  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .attr("transform", `translate(0, 0)`)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(hairData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "purple")
    .attr("opacity", ".5")

  // Create group for  twho x- axis and y-axis labels
  var labelXGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);
  var yLabelGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)")
  
    var povertyLabel = labelXGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelXGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (median)");

  var incomeLabel = labelXGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (median)");

  // append y axis
  var smokesLabel = yLabelGroup.append("text")
    .attr("y", 0 - margin.left +40)
    .attr("x", 0 - (height / 2))
    .attr("value", "smokes") // value to grab for event listener
    .classed("active", true)
    .text("Smokes (%)");

  var obesityLabel = yLabelGroup.append("text")
    .attr("y", 0 - margin.left +20)
    .attr("x", 0 - (height / 2))
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obese (%)");

  var healthcareLabel = yLabelGroup.append("text")
    .attr("y", 0 - margin.left +60)
    .attr("x", 0 - (height / 2))
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelXGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");

      if (value !== chosenXAxis) {
       
        // replaces chosenXAxis with value
        chosenXAxis = value;

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(hairData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXaxis(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true)
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false)
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "income") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true)
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
            }
        }
  });

    // Else check for y-axis change// x axis labels event listener
  yLabelGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var yvalue = d3.select(this).attr("value");
      
    if (yvalue !== chosenYAxis) {

      // replaces chosenYAxis with value
          chosenYAxis = yvalue;
        
          // functions here found above csv import
          // updates y scale for new data
          yLinearScale = yScale(hairData, chosenYAxis);
  
          // updates y axis with transition
          yAxis = renderYaxis(yLinearScale, yAxis);
  
          // updates circles with new y values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
  
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
          // changes classes to change bold text
          if (chosenYAxis === "obesity") {
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true)
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "smokes") {
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", true)
              .classed("inactive", false)
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "healthcare") {
            obesityLabel
                .classed("active", false)
                .classed("inactive", true);
            smokesLabel
                .classed("active", false)
                .classed("inactive", true)
            healthcareLabel
                .classed("active", true)
                .classed("inactive", false);
              }
  }
  });
});
