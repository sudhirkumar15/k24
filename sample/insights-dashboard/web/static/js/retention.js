import Highcharts from 'highcharts';
require('highcharts/modules/exporting')(Highcharts);
import moment from 'moment';
import Datepicker from 'datePicker';
import 'common';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import head from 'lodash/head';
import flatten from 'lodash/flatten';
import reduce from 'lodash/reduce';
import indexOf from 'lodash/indexOf';
import 'chosen-npm/public/chosen.jquery';

$('.chart-type > [data-toggle="tooltip"]').tooltip();

// select first store
$('.store-select-box').children().first().attr('selected', 'selected');

const _csrf   = $('input[name=_csrf]').val(),
    intervals = {
        day : ['Day 1', 'Day 3', 'Day 7'],
        week: ['Week 1', 'Week 2', 'Week 3']
    };

let tranformedData;

forEach([
    '.store-select-box',
    '.select-box-large.institution',
], (select) => {
    /*eslint-disable */
    $(select).chosen({
        disable_search : true
    });
    /*eslint-enable */
});

getReport();
getInstitutions();

Datepicker.setDatePicker('input[name="daterange"]');

$('.dimension-control button').on('click', function(e) {
    e.preventDefault();
    $('.dimension-control button').removeClass('active');
    $(this).addClass('active');
});

$('.btnApply').on('click', function() {
    getReport();
});

$('.chart-type button').on('click', function() {
    $(this).siblings().removeClass('active');
    $(this).addClass('active');

    return renderChart({
        target   : 'retention-data',
        chartType: $(this).attr('name'),
        data     : tranformedData
    });
});

$('.store-select-box').chosen().change(function() {
    getInstitutions();
});

function getReport() {
    let dimension            = $('.dimension-control .btn-group .active').val(),
        {startDate, endDate} = Datepicker.getDateRanges(),
        institutionIds       = $('.select-box-large.institution').chosen().val(),
        storeId              = $('.store-select-box').chosen().val();

    $.post('/retention', {
        storeId,
        startDate,
        endDate,
        dimension,
        institutionIds,
        _csrf
    },
    (res) => {
        if (res.success) {
            tranformedData = transform(res.data, dimension);

            return renderChart({
                target   : 'retention-data',
                chartType: $('.chart-type > .active').attr('name'),
                data     : tranformedData
            });
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function renderChart({target = 'retention-data', chartType = 'area', data = [], showLegend = true} = {}) {
    Highcharts.chart(document.getElementsByClassName(target)[0], {
        chart: {
            type           : chartType,
            backgroundColor:'transparent'
        },
        title: {
            text: data.length ? null: 'No data'
        },
        credits: {
            enabled: false
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                day  : '%e %b \'%y'
            },
            labels: {
                style: {
                    fontSize: '13px'
                }
            }
        },
        yAxis: {
            title: {
                text: 'Count'
            }
        },
        legend: {
            enabled: showLegend
        },
        tooltip: {
            shared: true,
            formatter: function() {
                const tooltips  = [];
                let dateString;

                tooltips.push('<b>' + Highcharts.dateFormat('%e %b %Y', this.x) + '<b/><br/>');

                $.each(this.points, function(index, point) {
                    switch (point.series.name) {
                        case 'Day 1':
                            dateString = moment(point.x).add(1, 'days').format('D MMM, YYYY');
                            break;
                        case 'Day 3':
                            dateString = moment(point.x).add(3, 'days').format('D MMM, YYYY');
                            break;
                        case 'Day 7':
                            dateString = moment(point.x).add(7, 'days').format('D MMM, YYYY');
                            break;
                        case 'Week 1':
                            dateString = moment(point.x).add(1, 'weeks').format('D MMM, YYYY');
                            break;
                        case 'Week 2':
                            dateString = moment(point.x).add(2, 'weeks').format('D MMM, YYYY');
                            break;
                        case 'Week 3':
                            dateString = moment(point.x).add(3, 'weeks').format('D MMM, YYYY');
                            break;
                        default:
                            dateString = Highcharts.dateFormat('%e %b, %Y', point.x);
                            break;
                    }

                    tooltips.push(point.series.name + ' (' + dateString + ') : '+ point.y);
                });

                return tooltips.join('<br/>');
            }
        },
        series: data,
        exporting: {
            chartOptions: {
                plotOptions: {
                    series: {
                        dataLabels: {
                            enabled: false
                        }
                    }
                }
            },
            scale: 3
        }
    });
}

function transform(data, dimension) {
    const series = [];

    if (! data.length) {
        return series;
    }

    series.push({
        'name': 'Active User',
        'data': map(data, (row) => {
            return [
                moment(row.timestamp * 1000).utc().valueOf(),
                row.first
            ];
        })
    });

    const segments = map(head(data).counts, (count, index) => {
        return {
            'name' : intervals[dimension][index],
            'data' : map(data, (row) => {
                return [
                    moment(row.timestamp * 1000).utc().valueOf(),
                    row.counts[index]
                ];
            })
        };
    });

    series.push(segments);
    return flatten(series);
}

function getInstitutions() {
    let storeId = $('.store-select-box').chosen().val();
    const key   = `institutions:${storeId}`;

    if (typeof Storage !== 'undefined' && typeof sessionStorage[key]  !== 'undefined') {
        const institutions = JSON.parse(sessionStorage[key]);

        if (institutions.length) {
            return renderInstituitions(institutions);
        }
    }

    $.post('/institutions', {
        storeId,
        _csrf
    },
    (res) => {
        if (res.success) {
            if (typeof Storage !== 'undefined') {
                sessionStorage[key] = JSON.stringify(res.data);
            }

            return renderInstituitions(res.data);
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function renderInstituitions(institutions) {
    let institutionHtml = '';

    $('.select-box-large.institution option').remove();

    institutionHtml = reduce(institutions, (html, institution) => {
        return html + '<option ' + (indexOf(institutions, institution.id) != -1 ? 'selected="selected"' : '') + ' value="' + institution.id + '">' + institution.name + '</option>';
    }, '');

    $('.select-box-large.institution').append(institutionHtml);
    $('.select-box-large.institution').chosen().trigger('chosen:updated');
}
