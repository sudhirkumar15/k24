import Highcharts from 'highcharts';
require('highcharts/modules/exporting')(Highcharts);
import qs from 'qs';
import moment from 'moment';
import Datepicker from 'datePicker';
import forEach from 'lodash/forEach';
import reduce from 'lodash/reduce';
import map from 'lodash/map';
import slice from 'lodash/slice';
import indexOf from 'lodash/indexOf';
import 'common';
import 'chosen-npm/public/chosen.jquery';
import tableUserDaily from '../views/partials/default/tableUserDaily';
import 'datatables.net-responsive-bs';

// initialize tooltips
$('.chart-type > [data-toggle="tooltip"]').tooltip();

let csrf        = $('input[name=_csrf]').val(),
    params      = qs.parse(window.location.search.substring(1)),
    paths       = window.location.pathname.substring(1).split('/'),
    transformed = {},
    captions    = {
        'bookDownloadComplete': {
            'heading': 'User Count - Book Download',
            'tooltip': 'Count of unique users who downloaded books within the speficied duration'
        },
        'bookOpen': {
            'heading': 'User Count - Book Open',
            'tooltip': 'Count of unique users who opened books within the speficied duration'
        },
        'noteAdd': {
            'heading': 'User Count - Notes',
            'tooltip': 'Count of unique users who added notes within the speficied duration'
        },
        'bookmarkAdd': {
            'heading': 'User Count - Bookmarks',
            'tooltip': 'Count of unique users who added bookmarks within the speficied duration'
        },
        'highlightAdd': {
            'heading': 'User Count - Highlights',
            'tooltip': 'Count of unique users who added highlights within the speficied duration'
        },
        'searchResult': {
            'heading': 'User Count - Searches',
            'tooltip': 'Count of unique users who performed a search within the speficied duration'
        },
        'newUsers': {
            'heading': 'New User Count',
            'tooltip': 'Count of new users who performed any activity on books on any givin day within the specified duration'
        },
        'activeUsers': {
            'heading': 'Active User Count',
            'tooltip': 'Count of active users who performed any activity on books on any givin day within the specified duration'
        }
    };

forEach([
    '.store-select-box',
    '.select-box-large.institution',
    '.select-box-large.event-type'
], (select) => {
    /*eslint-disable */
    $(select).chosen({
        disable_search: true
    });
    /*eslint-enable */
});

$('.store-select-box').chosen().change(function(){
    getInstitutions();
});

Datepicker.setDatePicker('input[name="daterange"]');

//Title help
$('.user-daily-report .box-title').html(captions[$('.select-box-large.event-type').chosen().val()].heading);
$('.user-daily-report .box-title-help').attr('data-original-title', captions[$('.select-box-large.event-type').chosen().val()].tooltip);

$('.btnApply').on('click', function() {
    getReport(
        $('.store-select-box').chosen().val(),
        $('.select-box-large.event-type').chosen().val(),
        $('.select-box-large.institution').chosen().val()
    );
});

$('.chart-type button').on('click', function() {
    $(this).siblings().removeClass('active');
    $(this).addClass('active');

    renderChart(transformed.chart, $(this).attr('name'));
});

getInstitutions(params.storeId);
getReport(params.storeId, params.event, params.institutionIds);

getFilters(
    $('.select-box-large.filter-by').chosen().val(),
    $('.store-select-box').chosen().val(),
    params.filterVals
);

$('.select-box-large.filter-by').chosen().change(function(){
    getFilters($(this).val(), $('.store-select-box').chosen().val());
});

function getFilters(filterType, storeId, selectedValues) {
    let filters = [],
        key     = `filters:${storeId}:${filterType}`;

    if(!filterType) {
        $('.select-box-large.filters option').remove();
        return $('.row.filter-val-row').hide();
    }

    if (typeof Storage !== 'undefined' &&  typeof sessionStorage[key] !== 'undefined') {
        filters = JSON.parse(sessionStorage[key]);

        if (filters.length) {
            return renderFilters(filters, selectedValues);
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

            return renderFilters(filters, selectedValues);
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function renderFilters(filters, selectedValues) {
    $('.select-box-large.filters option').remove();

    let options = reduce(filters, function(html, filter) {
        return html + '<option ' + (indexOf(selectedValues, filter) != -1 ? 'selected="selected"' : '') + ' value="' + filter + '">' + filter + '</option>';
    }, '');

    $('.select-box-large.filters').append(options);
    $('.select-box-large.filters').chosen().trigger('chosen:updated');
    $('.row.filter-val-row').show();
}

function getInstitutions(storeId) {
    if(!storeId) {
        storeId = $('.store-select-box').chosen().val();
    }

    const key = `institutions:${storeId}`;

    if (typeof Storage !== 'undefined' && typeof sessionStorage[key]  !== 'undefined') {
        const institutions = JSON.parse(sessionStorage[key]);

        if (institutions.length) {
            renderInstitutions(institutions);
        }
    }

    $.post('/institutions', {
        storeId,
        _csrf   : csrf
    },
    (res) => {
        if (res.success) {
            if (typeof Storage !== 'undefined') {
                sessionStorage[key] = JSON.stringify(res.data);
            }

            return renderInstitutions(res.data);
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function renderInstitutions(institutions) {
    let selectedIds     = params.institutionIds,
        institutionHtml = '';

    $('.select-box-large.institution option').remove();

    institutionHtml = reduce(institutions, (html, institution) => {
        return html + '<option ' + (indexOf(selectedIds, institution.id) != -1 ? 'selected="selected"' : '') + ' value="' + institution.id + '">' + institution.name + '</option>';
    }, '');

    $('.select-box-large.institution').append(institutionHtml);
    $('.select-box-large.institution').chosen().trigger('chosen:updated');
}

function getReport(storeId, event, institutionIds) {
    $('.flash-msgs').remove();

    const {startDate, endDate} = Datepicker.getDateRanges(),
        filterType             = $('.select-box-large.filter-by').chosen().val(),
        filterVals             = $('.select-box-large.filters').chosen().val();

    if(!storeId) {
        storeId = $('.store-select-box').chosen().val();
    }

    if (!event) {
        event = $('.event-type').chosen().val();
    }

    let platforms,
        deviceMakes,
        deviceModels,
        appVersions;

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
    }

    switch (event) {
        case 'activeUsers':
        case 'newUsers':
            renderUserSessionReports(storeId, startDate, endDate, institutionIds, event, platforms, deviceMakes, deviceModels, appVersions);
            break;
        default:
            renderDailyUserActivityReport(storeId, startDate, endDate, event, institutionIds, platforms, deviceMakes, deviceModels, appVersions);
            break;
    }

    //change help
    $('.user-daily-report .box-title').html(captions[event].heading);
    $('.user-daily-report .box-title-help').attr('data-original-title', captions[event].tooltip);
    $(`ul.sidebar-menu .${paths[0]}-${paths[1]} li`).removeClass('active');
    $(`ul.sidebar-menu .${paths[0]}-${paths[1]}-${event}`).addClass('active');
}

function renderUserSessionReports(storeId, startDate, endDate, institutionIds, event, platforms, deviceMakes, deviceModels, appVersions) {
    $.post('/sessions', {
        storeId   : [storeId],
        dimension : 'day',
        startDate,
        endDate,
        institutionIds,
        platforms,
        deviceMakes,
        deviceModels,
        appVersions,
        _csrf     : csrf
    },
    (res) => {
        if (res.success) {
            transformed = transformSessions(res.data, event);

            renderTable(transformed.tabular, storeId, event, transformed.caption);

            prepareExport();

            return renderChart(transformed.chart, $('.chart-type > .active').attr('name'));
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function renderDailyUserActivityReport(storeId, startDate, endDate, event, institutionIds, platforms, deviceMakes, deviceModels, appVersions) {
    $.post('/users/events/summary', {
        storeId,
        startDate,
        endDate,
        events : [event],
        institutionIds,
        platforms,
        deviceMakes,
        deviceModels,
        appVersions,
        _csrf  : csrf
    },
    (res) => {
        if (res.success) {
            transformed = transform(res.data, event);
            transformed.caption = 'User Count';

            renderTable(transformed.tabular, storeId, event, transformed.caption);

            prepareExport();

            return renderChart(transformed.chart, $('.chart-type > .active').attr('name'));
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function renderChart(data, chartType) {
    Highcharts.chart(document.getElementsByClassName('daily-users')[0], {
        chart: {
            type            : chartType,
            backgroundColor : 'transparent',
            zoomType        : 'xy'
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
                text: 'User Count'
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            formatter: function() {
                return   'Date : ' + Highcharts.dateFormat('%e %b, %Y', this.x) + '<br />' + this.series.name + '<br /> count : <b>' + this.y + '</b>';
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

function transformSessions(rows, event) {
    const payload = {
        'tabular': [],
        'chart'  : [],
        'caption': 'User Count'
    };

    if (! rows.length) {
        return payload;
    }

    let key = 'newusers';

    if(event = 'activeUsers') {
        key = 'users';
    }

    payload.tabular = map(rows, (row) => {
        return {
            'date' : moment(row.timestamp * 1000).format('DD MMM YYYY'),
            'count' : row[key]
        }
    });

    rows = slice(rows, 0, 10);

    payload.chart = [{
        'name' : `Activity : ${event}`,
        'data': map(rows, (row) => {
            return [
                moment(row.timestamp * 1000).utc().valueOf(),
                row[key]
            ];
        })
    }];

    return payload;
}

function transform(rows, event) {
    let payload = {
        'tabular': [],
        'chart'  : []
    };

    if (! rows.length) {
        return payload;
    }

    payload.tabular = map(rows, (row) => {
        return {
            'date' : moment(row.timestamp * 1000).format('DD MMM YYYY'),
            'count' : row.count
        }
    });

    payload.chart = [{
        'name' : `Activity : ${event}`,
        'data': map(rows, (row) => {
            return [
                moment(row.timestamp * 1000).utc().valueOf(),
                row.count
            ];
        })
    }];

    return payload;
}

function renderTable(rows, storeId, event, tableHeader) {
    $('.userdata').html(tableUserDaily({
        rows,
        storeId,
        event,
        tableHeader,
        'showLink' : false
    }));

    $('.report-list').DataTable({
        'responsive'  : true,
        'lengthChange': true
    });
}

function prepareExport() {
    const exportData = {
        'report'   : transformed.tabular
    };

    $('form[name="export"] input[name="export"]').val(JSON.stringify(exportData));
}
