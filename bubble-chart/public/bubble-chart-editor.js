/*
    This is the angularjs controller for the editor. It is the place to define and mutate the chart model
 */
(function(){
    'use strict';

    function BubbleChartCtrl($scope, dataTypes) {
        this.$scope = $scope;
        this.dataTypes = dataTypes;
        //what we will allow to group by
        this.groupByTypes = ['keyword_text', 'keyword', 'boolean'].concat(dataTypes.numbers());
        //our tabs in our editor defined here.
        this.tabs = [
            { label: 'Series', icon: 'settings' },
            { label: 'Color', icon: 'palette', id: 'color' },
            { label: 'Labels', icon: 'label_outline', id:'labels' }
            ];
        //if our dataset changes in the UI, initialize the chart with these settings
        this.chartDefaults = function(model) {
            _.defaultsDeep(model, {
                x: stringField.name,
                series: [{ y: 'count' }],
                n: 10,
                dataset: model.dataset,
                alias: model.alias,
                labels: {
                    color: 'black',
                    size: 28
                }
            });
        }
    }

    BubbleChartCtrl.prototype.$onInit = function() {
        var self = this;
        //watch 'alias' for changes.
        this.$scope.$watch('ctrl.model.alias', function (alias, oldAlias) {
            //Since a report can have a dataset more than once, we use dataset alias instead of id
            var dataset = _.get(self.dsCtrl, ['datasets', alias]);
            self.model.dataset = _.get(dataset,['id']);
            //don't reload anything if the aliases are the same
            if(oldAlias && (oldAlias !== alias)) {
                //pluck the first eligible field off the fields list
                self.model.x = _.get(_.find(dataset.fields,function(f) { return self.groupByTypes.indexOf(f.dataType) > -1 }),['name']);
                //default y to 'count'
                self.model.series = [{ y: 'count' }];
            }
        });
        //we don't need the dataset chooser of there is only one
        this.chooseDataset = _.size(this.dsCtrl.datasets) > 1;
        //initialize the visual with the first dataset in dsCtrl
        var dataset = _.find(_.get(this.dsCtrl,['datasets']), function(d) { return d.id === self.model.dataset });
        this.model.alias = this.model.alias || _.get( dataset , ['alias']);
    };

    function bubbleChartEditor() {
        return {
            restrict: 'E',
            controller: BubbleChartCtrl,
            controllerAs: 'ctrl',
            bindToController: true,
            require: {
                dsCtrl: '^^infDatasets'
            },
            scope: {
                model: '='
            },
            templateUrl: '/assets/bubble-chart/bubble-chart-editor-tpl.html'
        }
    }

    //name the editor with visual id + 'Editor'
    angular.module('informer').directive('bubbleChartEditor', bubbleChartEditor);

})();