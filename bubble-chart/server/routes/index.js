'use strict';

const _ = require('lodash');
const joi = require('joi');
const P = require('bluebird');
const uuid = require('node-uuid');
const exporter = require('@entrinsik/highcharts-export-server');
const fs = require('fs');
const path = require('path');
const os = require('os');
const tmpdir = os.tmpdir();
const bubbleChart = require('../visual/bubble-chart')

//where we start with a new chart
const getTemplates = function (dataset, alias) {
    if (!dataset) return [];
    const stringField = _.find(dataset.fields, f => f.isString());
    if (!stringField) return [];
    return [{
        group: 'Charts',
        label: 'Bubble Chart',
        component: {
            bubbleChart: {
                x: stringField.name,
                series: [{ y: 'count' }],
                n: 10,
                dataset: dataset.id,
                alias: alias,
                labels: {
                    color: 'black',
                    size: 28
                }
            }
        }
    }];
};


const evaluateSeries = async (req, done)  => {
    const model = req.query;
    model.sortBy = 'value';
    _.assign(model.series[0],{
        yType: 'grouped',
        type: 'pie',
        layer: 1
    });
    model.series[0].yType = 'grouped';
    const values = await req.pre.dataset.aggregate('category')(_.assign({}, model, {
            colors: req.pre.colors,
            hColors: req.server.app.colors.highchart
        }));
    done(values);
}

function createSvg(req, done) {
    const labelConfig = _.get(req,['query','labels'], { size: 30, color: 'black'})
    const data = req.pre.values.series[0].data;
    done(bubbleChart(data,labelConfig));
}

const exportImage = async function(svg, type) {
    const filename = `${uuid.v4()}.${type}`;
    const result = await new Promise((resolve, reject) => {
        try {
            exporter.export({
                svg: `<div style="background-color: white">${svg}</div>`,
                type: type,
                async: false,
                reqId: filename,
                outfile: path.join(tmpdir, filename)
            }, (err,result) => err ? reject(err):resolve(result));
        } catch (e) {
            reject(e);
        }
    });
    if (result.data) return Buffer.from(result.data, 'base64');

    if (result.filename) return P.fromNode(cb => fs.readFile(result.filename, cb))
        .finally(() => fs.unlink(result.filename, (err) => {
            if (err) throw err;
        }));
    throw new Error('Failed to convert');

}



module.exports = {
    path: '/bubble-chart.{ext}',
    method: 'get',
    config: {
        pre: [
            { assign: 'colors', method: 'color.map' },
            { assign: 'dataset', method: 'dataset.forVisual' },
            { assign: 'values', method: evaluateSeries },
            { assign: 'svg', method: createSvg }
        ],
        handler: (req, reply) => {
            switch (req.params.ext) {
                case 'svg':
                    return reply(req.pre.svg).type('image/svg+xml');
                case 'jpg':
                    return reply(exportImage(req.pre.svg, 'jpg')).type('image/jpeg')
                case 'pdf':
                    return reply(exportImage(req.pre.svg, 'pdf')).type('application/pdf')
                case 'png':
                    return reply(exportImage(req.pre.svg, 'png')).type('image/png')
                case 'html':
                    return reply.component({ svgViewer: req.pre.svg });
                default:
                    return reply({ svgViewer: req.pre.svg }).type('application/json');
            }
        },
        validate: {
            params: {
                ext: joi.string().required().default('json')
            },
            query: {
                dataset: joi.alternatives([joi.number().integer(), joi.string()]).required(),
                report: joi.alternatives([joi.number().integer(), joi.string()]),
                x: joi.string().required(),
                scope: joi.object().empty(''),
                filter: joi.object().empty(''),
                n: joi.number().integer(),
                q: joi.string(),
                series: joi.array(),
                alias: joi.string(),
                labels: joi.object()
            }
        },
        plugins: {
            visual: {
                id: 'bubbleChart',
                views: ['svg','html', 'jpg', 'png', 'pdf'],
                detectives: {
                    dataset: function (req) {
                        return getTemplates(req.pre.dataset);
                    },
                    report: function (req) {
                        return _.reduce(req.pre.report.datasetRefs, (acc, dataset) => acc || (dataset && getTemplates(dataset)), null);
                    }
                }
            },
            warp: {
                etag: r => r.server.methods.db.etag(r.auth.credentials.etag, 'job')
            }
        }
    }
};

