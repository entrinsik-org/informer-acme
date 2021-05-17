'use strict';
/**
 * try swapping this for bubble chart in routes/index.js to render a tree map
 */
const D3Node = require('d3-node');

module.exports = function (data, labelConfig) {
    const width = 1000;
    const height = 1000;
    const margin = {top: 10, right: 10, bottom: 10, left: 10};


    const config = {
        styles : `
            .bubble-chart {
                font-family: Roboto, "Helvetica Neue", sans-serif;
                background-color: transparent;
            }
            .text {
                
            }`
    };

    const d3Node = new D3Node(config); // initializes D3 with container element
    const { d3 } = d3Node;
    //make an svg
    const svg = d3Node.createSVG();

    svg.attr('version', '1.1')
        .attr('class','bubble-chart')
        .attr('preserveAspectRatio', 'xmidYMid meet')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('width', width)
        .attr('height', height);


    //function to determine color for circle if not supplied in our results ("rotate mode")
    const color = d3.scaleOrdinal(d3.schemePastel1);


    const root = d3.hierarchy({ children: data })
        .sum(d => d.y);

    d3.treemap()
        .size([width, height])
        .padding(2)(root);

    const node = svg.selectAll('.node')
        .data(root.leaves())
        .enter().append('g')
        .attr('class', 'node')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    node.append("rect")
        .attr('x', function (d) { return d.x0; })
        .attr('y', function (d) { return d.y0; })
        .attr('width', function (d) { return d.x1 - d.x0; })
        .attr('height', function (d) { return d.y1 - d.y0; })
        .style("stroke", "black")
        .style("fill", function (d) {
            return d.data.color || color(d.data.name + String.valueOf(d.data.y));
        });

    node.append("text")
        .attr("x", function(d){ return d.x0+5})    // +10 to adjust position (more right)
        .attr("y", function(d){ return d.y0+20})    // +20 to adjust position (lower)
        .text(function(d){ return d.data.name })
        .attr("font-size", labelConfig.size)
        .attr("fill", labelConfig.color)
    return d3Node.svgString();
}