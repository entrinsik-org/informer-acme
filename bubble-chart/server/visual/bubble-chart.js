'use strict';
const D3Node = require('d3-node');

module.exports = function (data, labelConfig) {
    const width = 1000;
    const height = 1000;

    const config = {
        styles : `
            .bubble-chart {
                font-family: Roboto, "Helvetica Neue", sans-serif;
                text-anchor: middle;
                background-color: transparent;
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

    const format = d3.format(',d');

    //function to determine color for circle if not supplied in our results ("rotate mode")
    const color = d3.scaleOrdinal(d3.schemePastel1);

    const pack = d3.pack()
        .size([width, height])
        .padding(2);

    const root = d3.hierarchy({ children: data })
        .sum(d => d.y);
    const node = svg.selectAll('.node')
        .data(pack(root).leaves())
        .enter().append('g')
        .attr('class', 'node')
        .attr('transform', function (d) {
            return 'translate(' + d.x + ',' + d.y + ')';
        });

    node.append('circle')
        .attr('id', function (d) {
            return d.data.name;
        })
        .attr('r', function (d) {
            return d.r;
        })
        .style('stroke', '#000000')
        .style('fill', function (d) {
            return d.data.color || color(d.data.name + String.valueOf(d.data.y));
        });

    node.append('text')
        .style('fill', labelConfig.color)
        .style('font-size', labelConfig.size+'px')
        .selectAll('tspan')
        .data(d => d.data.name.split(/(?=[A-Z][a-z])|\s+/g))
        .join("tspan")
        .attr("x", 0)
        .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
        .text(d => d);

    node.append('title')
        .text(function (d) {
            return d.data.name + '\n' + format(d.data.y);
        });
    return d3Node.svgString();
}