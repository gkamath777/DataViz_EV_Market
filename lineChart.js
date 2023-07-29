// Set the dimensions of the canvas
var margin = { top: 30, right: 30, bottom: 50, left: 60 },
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden");

// Append the SVG object to the chart div
var svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Read the CSV file
d3.csv("Electric_Vehicle_Population_Data.csv", function (d) {
    return {
        x: +d.year,
        y: +d.vin
    };
})
.then(function (data) {
    // X and Y scales
    const parseDate = d3.timeParse("%Y");
    data.forEach(function (d) {
        d.x = parseDate(d.x);
    });

    // Step 2: Group and sum the data for each year
    const groupedData = d3.group(data, d => d.x);
    const summedData = Array.from(groupedData, ([x, values]) => ({
        x: x,
        sumData: values.length
    }));


    var xScale = d3.scaleTime()
        // .domain([d3.min(data, function(d) { return d.x; }), d3.max(data, function(d) { return d.x; })])
        .domain(d3.extent(summedData,
            function (d) {
                return d.x;
            }))
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(summedData, function (d) { return d.sumData; })])
        .range([height, 0]);

    // Define the line
    var line = d3.line()
        .x(function (d) { return xScale(d.x); })
        .y(function (d) { return yScale(d.sumData); });

    // Append the line to the SVG
    svg.append("path")
        .datum(summedData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

    var circles = svg.selectAll("circle")
        .data(summedData)
        .enter().append("circle")
        .attr("cx", function (d) {
            return xScale(d.x);
        })
        .attr("cy", function (d) {
            return yScale(d.sumData);
        })
        .attr("r", 6)
        .style("fill", "orange")
        .on('mouseover',
            function (d) {
                const dateFormatter = d3.timeFormat("%Y")
                tooltip.style("visibility", "visible")
                    .text("Year: " + dateFormatter(d.target.__data__.x) + ", Total sales: " + d.target.__data__.sumData)
                    .style("top", (d.pageY - 10) + "px")
                    .style("left", (d.pageX + 10) + "px");
            }
        )
        .on('mouseout',
            () => { tooltip.style("visibility", "hidden"); }
        );

    const xAxis = d3.axisBottom(xScale);
    xAxis.tickValues(summedData.map(d => d.x));
    const formatTime = d3.timeFormat("%Y");
    xAxis.tickFormat(formatTime);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add Y-axis
    svg.append("g")
        .call(d3.axisLeft(yScale));
}).catch(function (error) {
    // Handle error while reading the file
    console.error("Error loading the data: " + error);
});

