import Highcharts from 'highcharts';
require('highcharts/modules/exporting')(Highcharts);
import moment from 'moment';
import Datepicker from 'datePicker';
import map from 'lodash/map';
import forEach from 'lodash/forEach';
import uniq from 'lodash/uniq';
import reduce from 'lodash/reduce';
import indexOf from 'lodash/indexOf';
import 'common';
import 'chosen-npm/public/chosen.jquery';
import table from '../views/partials/default/table';
import 'datatables.net-responsive-bs';

$('.chart-type > [data-toggle="tooltip"]').tooltip();

// select first store
$('.store-select-box').children().first().attr('selected', 'selected');

let csrf          = $('input[name=_csrf]').val(),
    transformed   = {
        'chart'   : [],
        'tabular' : []
    };

forEach([
    '.store-select-box',
    '.segment-select-box',
    '.event-select-box',
    '.select-box-large.institution',
    '.select-box-large.filters',
], (select) => {
    /*eslint-disable */
    $(select).chosen({
        disable_search : true
    });
    /*eslint-enable */
});

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

    renderCharts(transformed.chart, $(this).attr('name'));
});

$('.select-box-large.filter-by').chosen().change(function(){
    getFilters($(this).val(), $('.store-select-box').chosen().val());
});

$('.store-select-box').chosen().change(function() {
    getFilters($('.select-box-large.filter-by').chosen().val(), $(this).val());
    getInstitutions($('.store-select-box').chosen().val());
});

getFilters(
    $('.select-box-large.filter-by').chosen().val(),
    $('.store-select-box').chosen().val()
);

getReport();
getInstitutions($('.store-select-box').chosen().val());

function getFilters(filterType, storeId) {
    let filters = [],
        key     = `filters:${storeId}:${filterType}`;

    if(!filterType) {
        $('.select-box-large.filters option').remove();
        return $('.row.filter-val-row').hide();
    }

    if (typeof Storage !== 'undefined' &&  typeof sessionStorage[key] !== 'undefined') {
        filters = JSON.parse(sessionStorage[key]);

        if (filters.length) {
            return renderFilters(filters);
        }
    }

    $.post('/events/filters', {
        storeId : [storeId],
        type    : filterType,
        _csrf   : csrf
    },
    (res) => {
        if (res.success) {
            filters = res.data.filters;

            if (typeof Storage !== 'undefined') {
                sessionStorage[key] = JSON.stringify(filters);
            }

            return renderFilters(filters);
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function renderFilters(filters) {
    $('.select-box-large.filters option').remove();

    let options = reduce(filters, function(html, filter) {
        return html + '<option value="' + filter + '">' + filter + '</option>';
    }, '');

    $('.select-box-large.filters').append(options);
    $('.select-box-large.filters').chosen().trigger('chosen:updated');
    return $('.row.filter-val-row').show();
}

function getReport() {
    let filterType     = $('.select-box-large.filter-by').chosen().val(),
        filterVals     = $('.select-box-large.filters').chosen().val(),
        institutionIds = $('.select-box-large.institution').chosen().val(),
        platforms,
        deviceMakes,
        deviceModels,
        appVersions,
        eventTypes;

    $('.flash-msgs').remove();

    const {startDate, endDate} = Datepicker.getDateRanges();

    if (! $('.store-select-box').chosen().val()) {
        return $('.content-header').append(flash({'errors': ['Please select a site']}));
    }

    switch (filterType) {
        case 'device_platform':
            platforms = filterVals;
            break;
        case 'device_make':
            deviceMakes = filterVals;
            break;
        case 'device_model':
            deviceModels = filterVals;
            break;
        case 'app_version':
            appVersions = filterVals;
            break;
        case 'event_type':
            eventTypes = filterVals;
            break;
    }

    $.post('/events', {
        storeId       : [$('.store-select-box').chosen().val()],
        startDate     : startDate,
        endDate       : endDate,
        dimension     : $('.dimension-control button.active').val(),
        segment       : $('.segment-select-box').chosen().val(),
        source        : 'app',
        eventTypes    : eventTypes,
        platforms     : platforms,
        deviceMakes   : deviceMakes,
        deviceModels  : deviceModels,
        appVersions   : appVersions,
        institutionIds: institutionIds,
        _csrf         : csrf
    },
    (res) => {
        if (res.success) {
            transformed = transform(res.data);

            renderTable(transformed.tabular);

            const exportData = {
                'headings' : [],
                'report'   : transformed.tabular
            };

            $('.report-list thead tr').children().each(function() {
                exportData.headings.push($(this).text());
            });

            $('form[name="export"] input[name="export"]').val(JSON.stringify(exportData));

            return renderCharts(transformed.chart, $('.chart-type > .active').attr('name'));
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function renderCharts(data, chartType) {
    const showLegend = $('.segment-select-box option:selected').text() === 'Select Segment' ? false : true;

    Highcharts.chart(document.getElementsByClassName('book-usage')[0], {
        chart: {
            type           : chartType,
            backgroundColor:'transparent',
            zoomType       : 'xy'
        },
        credits: {
            enabled: false
        },
        title: {
            text: data.length ? null: 'No data'
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
        plotOptions: {
            series: {
                stacking: 'normal'
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
            formatter: function () {
                return Highcharts.dateFormat('%e %b %Y', this.x) + '<br />' + this.series.name + ': <b>' + this.y + '</b>';
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

function renderTable(rows) {
    let segment = $('.segment-select-box option:selected').text();

    if (segment === 'Select Segment') {
        segment = '';
    }

    $('.bookdata').html(table({
        'rows'   : rows,
        'segment': segment
    }));

    $('.report-list').DataTable({
        'responsive': true,
        'lengthChange': true
    });
}

function transform(data) {
    const lookup         = {},
        uniqueTimestamps = uniq(map(data, 'timestamp')),
        uniqueSegments   = uniq(map(data, 'segment'));

    const chart = map(uniqueSegments, function (segment) {
        return {
            'name': segment ? segment : 'Count',
            'data': []
        };
    });

    // find events corresponding to the above timestamps
    forEach(data, function (event) {
        forEach(uniqueTimestamps, function (timestamp) {
            if (event.timestamp === timestamp) {
                if(! lookup[timestamp]) {
                    lookup[timestamp] = [];
                }

                lookup[timestamp].push({
                    'count'  : event.count,
                    'segment': event.segment ? event.segment: 'Count'
                });
            }
        });
    });

    forEach(lookup, function (event, timestamp) {
        forEach(event, function (e) {
            forEach(chart, function (c) {
                if (c.name === e.segment) {
                    c.data.push([
                        moment(timestamp * 1000).utc().valueOf(),
                        + e.count
                    ]);
                }
            });
        });
    });

    const tabular = map(data, function (e) {
        return {
            'timestamp': moment(e.timestamp * 1000).format('DD MMM YYYY'),
            'count'    : + e.count,
            'segment'  : e.segment ? e.segment: ''
        };
    });

    return {
        tabular,
        chart
    };
}

function getInstitutions(storeId) {
    const key = `institutions:${storeId}`;

    if (typeof Storage !== 'undefined' && typeof sessionStorage[key] !== 'undefined') {
        let institutions = JSON.parse(sessionStorage[key]);

        if (institutions.length) {
            return renderInstituitions(institutions);
        }
    }

    $.post('/institutions', {
        storeId : storeId,
        _csrf   : csrf
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
