// Set the dimensions of the canvas


const dateFormatter = d3.timeFormat("%Y");
const color = d3.scaleOrdinal(d3.schemeCategory10);
const parseDate = d3.timeParse("%Y");
var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden");

function clearChart() {
    d3.select("#chart").selectAll("*").remove();
    tooltip.style("visibility", "hidden").text("");
    d3.select("body").style('cursor', 'default');
}

EVLineGraphDecade();
// Read the CSV file
function EVLineGraphDecade() {
    // Append the SVG object to the chart div
    var margin = { top: 40, right: 40, bottom: 50, left: 70 },
        width = 640 - margin.left - margin.right,
        height = 480 - margin.top - margin.bottom;

    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.select("#scene1").on("click", null);
    d3.select("#scene2").attr("disabled", true);
    d3.select("#scene3").attr("disabled", true);

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
                .domain([0, d3.max(summedData, function (d) { return d.sumData; }) + 1000])
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

            svg.selectAll("circle")
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
                        // const dateFormatter = d3.timeFormat("%Y")
                        tooltip.style("visibility", "visible")
                            .text("Year: " + dateFormatter(d.target.__data__.x) + ", Total sales: " + d.target.__data__.sumData)
                            .style("top", (d.pageY - 10) + "px")
                            .style("left", (d.pageX + 10) + "px");
                    }
                )
                .on('mouseout',
                    () => { tooltip.style("visibility", "hidden"); }
                )
                .on("click", function (d) {
                    clearChart();
                    d3.select("#scene2").attr("disabled", null);
                    EVDataPerYear(d.target.__data__.x);
                });

            svg.append("g")
                // .attr("transform", "translate("+margin.left+","+margin.top+")")
                .append("text")
                .attr("text-anchor", "end")
                .attr("font-size", 20)
                .attr("font-weight", "bold")
                .attr("x", (width / 2) + 55)
                .attr("y", height + 45)
                .text("Evaluation Year");
            // Y axis label
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("font-size", 20)
                .attr("font-weight", "bold")
                .attr("transform", "rotate(-90)")
                .attr("y", -50)
                .attr("x", (-height / 2) + 65)
                .text("Total Sales")

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
    d3.select("#narrative_text").text(`To be updated in scene 1`);
}

function EVDataPerYear(year) {
    console.log(year)
    var margin = { top: 40, right: 40, bottom: 200, left: 70 },
        width = 840 - margin.left - margin.right,
        height = 680 - margin.top - margin.bottom;

    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    d3.select("#scene1").on("click", () => {
        clearChart();
        EVLineGraphDecade();
    });

    d3.select("#scene2").on("click", null);
    d3.select("#scene3").attr("disabled", true);

    d3.csv("Electric_Vehicle_Population_Data.csv", function (d) {
        return {
            x: d.make,
            y: d.vin,
            z: +d.year
        };
    })
        .then(function (data) {

            // Filter data for the year 2023
            const parseDate = d3.timeParse("%Y");

            // Filter data for the year 2023
            const filteredData = data.filter(function (d) {
                const date = parseDate(d.z);
                return date.getFullYear() == dateFormatter(year);
            });

            filteredData.forEach(function (d) {
                delete d.z;
            });

            // Step 2: Group and sum the data for each year
            const groupedData = d3.group(filteredData, d => d.x);
            const summedData = Array.from(groupedData, ([x, values]) => ({
                x: x,
                sumData: values.length
            }));

            var xScale = d3.scaleBand()
                // .domain([d3.min(data, function(d) { return d.x; }), d3.max(data, function(d) { return d.x; })])
                .domain(d3.map(summedData,
                    function (d) {
                        return d.x;
                    }))
                .range([0, width])
                .padding(0.65);

            var yScale = d3.scaleLinear()
                .domain([0, d3.max(summedData, function (d) { return d.sumData; }) + 200])
                .range([height, 0]);

            // Create the bars
            svg.attr("transform", `translate(${margin.left}, ${margin.top})`)
                .selectAll(".bar")
                .data(summedData)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", d => xScale(d.x))
                .attr("y", d => yScale(d.sumData))
                .attr("width", 25)
                .attr("height", d => height - yScale(d.sumData))
                .attr("fill", "steelblue")
                .on('mouseover',
                    function (d) {
                        // const dateFormatter = d3.timeFormat("%Y")
                        tooltip.style("visibility", "visible")
                            .text("Year: " + dateFormatter(year) + ", Total sales: " + d.target.__data__.sumData)
                            .style("top", (d.pageY - 10) + "px")
                            .style("left", (d.pageX + 10) + "px");
                    }
                )
                .on('mouseout',
                    () => { tooltip.style("visibility", "hidden"); }
                )
                .on("click", function (d) {
                    clearChart();
                    d3.select("#scene2").attr("disabled", null);
                    d3.select("#scene3").attr("disabled", null);
                    selectedMake(dateFormatter(year), d.target.__data__.x);
                });

            svg.append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(d3.axisBottom(xScale))
                .selectAll('text')
                .attr('text-anchor', 'end') // Align text to the end of the tick
                .attr('transform', 'rotate(-45)') // Rotate the text by -45 degrees
                .attr('dx', '-10px') // Optional: Adjust horizontal position for better alignment
                .attr('dy', '5px'); // Optional: Adjust vertical position for better alignment

            // Add Y-axis
            svg.append("g")
                .call(d3.axisLeft(yScale));


            svg.append("g")
                // .attr("transform", "translate("+margin.left+","+margin.top+")")
                .append("text")
                .attr("text-anchor", "end")
                .attr("font-size", 20)
                .attr("font-weight", "bold")
                .attr("x", (width / 2) + 55)
                .attr("y", height + 100)
                .text("Car Make");
            // Y axis label
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("font-size", 20)
                .attr("font-weight", "bold")
                .attr("transform", "rotate(-90)")
                .attr("y", -50)
                .attr("x", (-height / 2) + 65)
                .text("Total Sales")
        }).catch(function (error) {
            // Handle error while reading the file
            console.error("Error loading the data: " + error);
        });

    d3.select("#narrative_text").text(`
        To be updated in scene 2
        `);
}

function selectedMake(year, make) {
    var margin = { top: 40, right: 40, bottom: 50, left: 70 },
        width = 640 - margin.left - margin.right,
        height = 480 - margin.top - margin.bottom,
        radius = Math.min(width, height) / 2;

    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    d3.select("#scene1").on("click", () => {
        clearChart();
        EVLineGraphDecade();
    });

    d3.select("#scene2").on("click", () => {
        clearChart();
        EVDataPerYear(parseDate(year));
    });
    d3.select("#scene3").on("click", null);

    d3.csv("Electric_Vehicle_Population_Data.csv", function (d) {
        return {
            x: d.model,
            y: d.vin,
            z: +d.year,
            a: d.make
        };
    })
        .then(function (data) {

            // Filter data for the year 2023
            const parseDate = d3.timeParse("%Y");

            // Filter data for the year 2023
            const filteredData = data.filter(function (d) {
                const date = parseDate(d.z);
                return (date.getFullYear() == year) && (d.a == make);
            });
            filteredData.forEach(function (d) {
                delete d.z;
                delete d.a
            });

            // Step 2: Group and sum the data for each year
            const groupedData = d3.group(filteredData, d => d.x);
            const summedData = Array.from(groupedData, ([x, values]) => ({
                x: x,
                sumData: values.length
            }));

            // Define the pie layout
            const pie = d3.pie()
                .value(d => d.sumData)
                .sort(null);

            // Generate the pie chart arcs
            const arc = d3.arc()
                .innerRadius(0)
                .outerRadius(radius);

            // Bind the data to the pie chart elements
            const arcs = svg.selectAll("arc")
                .data(pie(summedData))
                .enter()
                .append("g")
                .on('mouseover',
                    function (d) {
                        // const dateFormatter = d3.timeFormat("%Y")
                        tooltip.style("visibility", "visible")
                            .text("Year: " + year + ", Make: " + make +
                                ", Model:" + d.toElement.__data__.data.x +
                                ", Total sale:" + d.toElement.__data__.data.sumData)
                            .style("top", (d.pageY - 10) + "px")
                            .style("left", (d.pageX + 10) + "px");
                    }
                )
                .on('mouseout',
                    () => { tooltip.style("visibility", "hidden"); }
                );

            // Draw the pie chart
            arcs.append("path")
                .attr("d", arc)
                .attr("fill", (d, i) => color(i));

            // Add labels to the pie chart
            arcs.append("text")
                .attr("transform", d => `translate(${arc.centroid(d)})`)
                .attr("text-anchor", "middle")
                .text(function (d) {
                    return d.data.x;
                });
        }).catch(function (error) {
            // Handle error while reading the file
            console.error("Error loading the data: " + error);
        });

    d3.select("#narrative_text").text(`To be updated in scene 3`);
}
