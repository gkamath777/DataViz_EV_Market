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
        width = 840 - margin.left - margin.right,
        height = 580 - margin.top - margin.bottom;

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

            // Features of the annotation
            const annotations = [
                {
                    note: {
                        label: "Tesla population is ~12K \n Vs Other Make altogether",
                        title: "SPIKE in all EV Sales including Tesla",
                        wrap: 500,
                    },
                    connector: {
                        end: "arrow",
                    },
                    x: 644,
                    y: 45,
                    dx: -30,
                    dy: -40,
                },
                {
                    note: {
                        label: "Fall in Sale during Covid timeline",
                        title: "small SPIKE in 2019 in all EV Sales",
                        wrap: 500,
                    },
                    connector: {
                        end: "arrow",
                    },
                    x: 410,
                    y: 299,
                    dx: 30,
                    dy: -50
                },
                {
                    connector: {
                        end: "arrow",
                    },
                    x: 440,
                    y: 309,
                    dx: 0,
                    dy: -60
                },
                {
                    note: {
                        title: "Click any Circle",
                        align: "left",
                        wrap: 100,
                    },
                    connector: {
                        end: "dot",

                    },
                    x: 172,
                    y: 410,
                    dx: 10,
                    dy: 10,
                    color: ["orange"]
                },
                {
                    note: {
                        label: "To drill-down the Total Sales of EV per Year for each Make",
                        wrap: 500,
                        padding: 7,
                    },
                    x: 340,
                    y: 430,
                    dx: 0,
                    dy: 0,
                    color: ["blue"]
                }
            ]
            // Add annotation to the chart
            const makeAnnotations = d3.annotation()
                .type(d3.annotationLabel)
                .annotations(annotations)

            // Append the line to the SVG
            svg.append("path")
                .datum(summedData)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 2)
                .attr("d", line);

            // Annotation
            svg.append("g")
                .attr("class", "annotation-group")
                .call(makeAnnotations);

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
    d3.select("#sub-title")
        .text('Total Sales of Non-Tesla EV Vehicles in the last One Decade')
        .style('font-weight', 'bold');
    d3.select("#narrative_text")
        .text(`This page explains the evolution of the Non-Tesla Electric Vehicle Population in the USA over the last 10 Years (Decade). 
        The change in sales from 1997 from one electric vehicle to 23000+ vehicles sold in the year 2022 from a single car manufacturer to 35+ car manufacturers. 
        But Tesla's population in the EV market is comparatively higher (>50% Market share) than other Car Manufacturers altogether. 
        This page gives pictorial data of other Car manufacturers that evolved over a decade.
        Each data point(Orange Circle) in the above Line Graph provides a Total Sales of EV vehicles for each year.
        The above graph represents a small spike in 2019, but again there was a fall in sales due to Covid. But there was a sharp spike in increase of Sales in 2022.`);
}

function EVDataPerYear(year) {
    var margin = { top: 10, right: 40, bottom: 110, left: 70 },
        width = 840 - margin.left - margin.right,
        height = 660 - margin.top - margin.bottom;

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

            // Features of the annotation
            const annotations = [
                {
                    note: {
                        label: "Only few EV Manufacuring Company is selling above average sale of Non-Tesla EV Vehicles",
                        title: "Average # of Sold Vehicles in " + dateFormatter(year),
                        wrap: 200,
                    },
                    connector: {
                        end: "arrow",
                    },
                    x: 644,
                    y: 440,
                    dx: -30,
                    dy: -40,
                },
                {
                    note: {
                        title: "Click any Bar Grpah",
                        label: "To drill-down the Total Sales of EV in " + dateFormatter(year) + " for the specific car Make",
                        align: "left",
                        wrap: 200,
                    },
                    x: 472,
                    y: 90,
                    dx: 0,
                    dy: 0,
                    color: ["green"]
                },
                {
                    connector: {
                        end: "arrow",
                    },
                    x: 440,
                    y: 190,
                    dx: 30,
                    dy: -50
                },
            ]
            // Add annotation to the chart
            const makeAnnotations = d3.annotation()
                .type(d3.annotationLabel)
                .annotations(annotations)

            var xScale = d3.scaleBand()
                // .domain([d3.min(data, function(d) { return d.x; }), d3.max(data, function(d) { return d.x; })])
                .domain(d3.map(summedData,
                    function (d) {
                        return d.x;
                    }))
                .range([0, width])
                .padding(0.28);

            var yScale = d3.scaleLinear()
                .domain([0, d3.max(summedData, function (d) { return d.sumData; }) + 200])
                .range([height, 0]);

            var yScale1 = d3.scaleLinear()
                .domain([0, d3.max(summedData, function (d) { return d.sumData; })])
                .range([height, 0]);

            var xScale1 = d3.scaleBand()
                // .domain([d3.min(data, function(d) { return d.x; }), d3.max(data, function(d) { return d.x; })])
                .domain(d3.map(summedData,
                    function (d) {
                        return d.x;
                    }))
                .range([0, width]);

            const averageY = d3.mean(summedData, d => d.sumData);

            var line = d3.line()
                .x(function (d) { return xScale1(d.x); })
                .y(yScale1(averageY));

            svg.append("path")
                .datum(summedData)
                .attr("d", line)
                .attr("stroke", "orange")
                .attr("stroke-width", 2)
                .attr("fill", "none");

            // Annotation
            svg.append("g")
                .attr("class", "annotation-group")
                .call(makeAnnotations);


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
                    EVDataPerMakePerYear(dateFormatter(year), d.target.__data__.x);
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

    d3.select("#sub-title")
        .text('Total Sales of Non-Tesla EV Vehicles in ' + dateFormatter(year))
        .style('font-weight', 'bold');
    d3.select("#narrative_text").text(`
    This page drill-down the data to the selected year. For the respective selected year, 
    A bar graph is shown, where each bar represents an EV Car Manufacturer, and each value in the Bar, 
    is the total number of EV vehicles sold per Make.
    If we review the bar graph, the number of manufacturers sold more than the average EV vehicle sold per year is very less (< 25%). 
    There is more evolution still needed from most EV manufacturers.`);
}

function EVDataPerMakePerYear(year, make) {
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

            const annotations = [
                {
                    note: {
                        title: "Pie Chart representing total sale of EV in " + make + " across multiple Models in " + year,
                        label: "",
                        align: "left",
                        wrap: 200,
                    },
                    connector: {
                        end: "arrow",
                    },
                    x: 0,
                    y: 200,
                    dx: 10,
                    dy: 20,
                    color: ["green"]
                },
            ]
            // Add annotation to the chart
            const makeAnnotations = d3.annotation()
                .type(d3.annotationLabel)
                .annotations(annotations);

            // Annotation
            svg.append("g")
                .attr("class", "annotation-group")
                .call(makeAnnotations);

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

    d3.select("#sub-title")
        .text('Total Sales of different EV models of ' + make + ' in ' + year)
        .style('font-weight', 'bold');
    d3.select("#narrative_text")
    .text(`
    The Pie chart displays the total sales of EV vehicles sold across multiple models of specific Make.
    The Trend with most of the Make is, a set of one or two models has more population than the other models. 
    `);
}
