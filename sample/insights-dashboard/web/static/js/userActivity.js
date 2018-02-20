import Highcharts from 'highcharts';
require('highcharts/modules/exporting')(Highcharts);
import qs from 'qs';
import Datepicker from 'datePicker';
import forEach from 'lodash/forEach';
import reduce from 'lodash/reduce';
import map from 'lodash/map';
import slice from 'lodash/slice';
import indexOf from 'lodash/indexOf';
import 'common';
import 'chosen-npm/public/chosen.jquery';
import tableUsers from '../views/partials/default/tableUsers';
import 'datatables.net-responsive-bs';

// initialize tooltips
$('.chart-type > [data-toggle="tooltip"]').tooltip();

let csrf        = $('input[name=_csrf]').val(),
    params      = qs.parse(window.location.search.substring(1)),
    paths       = window.location.pathname.substring(1).split('/'),
    transformed = {},
    captions = {
        'bookDownloadComplete': {
            'heading': 'Top Users - Book Download',
            'tooltip': 'Top ten users who have downloaded the maximum number of books, and their download count'
        },
        'bookOpen': {
            'heading': 'Top Users - Book Open',
            'tooltip': 'Top ten users who have opened the maximum number of books, and their book open count'
        },
        'noteAdd': {
            'heading': 'Top Users - Notes',
            'tooltip': 'Top ten users who have created the maximum number of notes, and the count of notes created'
        },
        'bookmarkAdd': {
            'heading': 'Top Users - Bookmarks',
            'tooltip': 'Top ten users who have created the maximum number of bookmarks, and the count of bookmarks created'
        },
        'highlightAdd': {
            'heading': 'Top Users - Highlights',
            'tooltip': 'Top ten users who have created the maximum number of highlights, and the count of highlights created'
        },
        'searchResult': {
            'heading': 'Top Users - Book Searches',
            'tooltip': 'Top ten users who have performed maximum number of searches, and count of searches performed'
        },
        'activeUsers': {
            'heading': 'Active Users',
            'tooltip': 'Count of unique sessions for active users within the specified duration'
        },
        'newUsers': {
            'heading': 'New Users',
            'tooltip': 'Count of unique sessions for any new user withing the specified duration'
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
$('.user-activity-report .box-title').html(captions[$('.select-box-large.event-type').chosen().val()].heading);
$('.user-activity-report .box-title-help').attr('data-original-title', captions[$('.select-box-large.event-type').chosen().val()].tooltip);

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
getReport(params.storeId, params.event, params.institutionIds, params.productIds);

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
            return renderInstitutions(institutions);
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

function getReport(storeId, event, institutionIds, productIds) {
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
            renderActiveUserReports(storeId, startDate, endDate, institutionIds, productIds, platforms, deviceMakes, deviceModels, appVersions);
            break;
        case 'newUsers':
            renderNewUserReports(storeId, startDate, endDate, institutionIds, productIds, platforms, deviceMakes, deviceModels, appVersions);
            break;
        default:
            renderUserActivityReport(storeId, startDate, endDate, event, institutionIds, productIds, platforms, deviceMakes, deviceModels, appVersions);
            break;
    }

    //change help
    $('.user-activity-report .box-title').html(captions[event].heading);
    $('.user-activity-report .box-title-help').attr('data-original-title', captions[event].tooltip);
    $(`ul.sidebar-menu .${paths[0]}-${paths[1]} li`).removeClass('active');
    $(`ul.sidebar-menu .${paths[0]}-${paths[1]}-${event}`).addClass('active');
}

function renderActiveUserReports(storeId, startDate, endDate, institutionIds, productIds, platforms, deviceMakes, deviceModels, appVersions) {
    $.post('/users/active', {
        storeId,
        startDate,
        endDate,
        institutionIds,
        productIds,
        platforms,
        deviceMakes,
        deviceModels,
        appVersions,
        limit : 100,
        _csrf : csrf
    },
    (res) => {
        if (res.success) {
            transformed = transform(res.data);
            transformed.caption = 'Session count';

            renderTable(transformed);

            prepareExport();

            return renderChart(transformed.chart, $('.chart-type > .active').attr('name'));
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function renderNewUserReports(storeId, startDate, endDate, institutionIds, productIds, platforms, deviceMakes, deviceModels, appVersions) {
    $.post('/users/new', {
        storeId,
        startDate,
        endDate,
        institutionIds,
        productIds,
        limit : 100,
        platforms,
        deviceMakes,
        deviceModels,
        appVersions,
        _csrf : csrf
    },
    (res) => {
        if (res.success) {
            transformed = transform(res.data);
            transformed.caption = 'Session count';

            renderTable(transformed);

            prepareExport();

            return renderChart(transformed.chart, $('.chart-type > .active').attr('name'));
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function renderUserActivityReport(storeId, startDate, endDate, event, institutionIds, productIds, platforms, deviceMakes, deviceModels, appVersions) {
    $.post('/users/events', {
        storeId,
        startDate,
        endDate,
        events : [event],
        institutionIds,
        productIds,
        platforms,
        deviceMakes,
        deviceModels,
        appVersions,
        limit : 100,
        _csrf : csrf
    },
    (res) => {
        if (res.success) {
            transformed = transform(res.data);

            renderTable(transformed);

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
    Highcharts.chart(document.getElementsByClassName('top-users')[0], {
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
            type: 'category',
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
                text: transformed.caption
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            formatter: function() {
                return 'Name : ' + this.point.name + ' <br/> Count :  ' + this.y;
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

function transform(rows) {
    const payload = {
        'tabular': [],
        'chart'  : [],
        'caption': 'Activity count'
    };

    if (! rows.length) {
        return payload;
    }

    payload.tabular = rows;
    rows = slice(rows, 0, 10);

    payload.chart = [{
        'name' : 'Users',
        'data': map(rows, (row) => {
            return [
                row.name ? row.name : row.id,
                row.count
            ];
        })
    }];

    return payload;
}

function renderTable(data) {
    $('.userdata').html(tableUsers({
        'rows'        : data.tabular,
        'tableHeader' : data.caption
    }));

    $('.report-list').DataTable({
        'responsive'  : true,
        'lengthChange': true,
        'order'       : [[4, 'desc']]
    });
}

function prepareExport() {
    const exportData = {
        'report'   : transformed.tabular
    };

    $('form[name="export"] input[name="export"]').val(JSON.stringify(exportData));
}
