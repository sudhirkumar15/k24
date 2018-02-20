import Highcharts from 'highcharts';
require('highcharts/modules/exporting')(Highcharts);
import qs from 'qs';
import moment from 'moment';
import Datepicker from 'datePicker';
import forEach from 'lodash/forEach';
import reduce from 'lodash/reduce';
import map from 'lodash/map';
import indexOf from 'lodash/indexOf';
import 'common';
import 'chosen-npm/public/chosen.jquery';
import tableBookDaily from '../views/partials/default/tableBookDaily';
import 'datatables.net-responsive-bs';

// initialize tooltips
$('.chart-type > [data-toggle="tooltip"]').tooltip();

let csrf            = $('input[name=_csrf]').val(),
    params          = qs.parse(window.location.search.substring(1)),
    paths           = window.location.pathname.substring(1).split('/'),
    transformed     = {
        'chart'   : [],
        'tabular' : [],
        'caption' : 'Count'
    },
    captions = {
        'bookDownloadComplete': {
            'heading': 'Book Download',
            'tooltip': 'Total number of books downloaded within the specified duration'
        },
        'bookOpen': {
            'heading': 'Book Open',
            'tooltip': 'Total number of books opened within the specified duration'
        },
        'noteAdd': {
            'heading': 'Notes',
            'tooltip': 'Total number of notes created within the specified duration'
        },
        'bookmarkAdd': {
            'heading': 'Bookmarks',
            'tooltip': 'Total number of bookmarks created within the specified duration'
        },
        'highlightAdd': {
            'heading': 'Highlights',
            'tooltip': 'Total number of highlights created within the specified duration'
        },
        'searchResult': {
            'heading': 'Searches',
            'tooltip': 'Total number of searches performed within the specified duration'
        },
        'pageView': {
            'heading': 'Page Views (PDF)',
            'tooltip': 'Count of the total number of page views, for a specified duration. Page views are for PDF books'
        },
        'contentView': {
            'heading': 'Content Views (EPUB)',
            'tooltip': 'Count of the total number of content views, for a specified duration. Content views are for EPUB books'
        },
        'timespent': {
            'heading': 'Time Spent',
            'tooltip': 'The time spent on books, in hours, for the specified duration'
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
    getBooks();
    getFilters($('.select-box-large.filter-by').chosen().val(), $(this).val());
});

Datepicker.setDatePicker('input[name="daterange"]');

//Title help
$('.book-daily-report .box-title').html(captions[$('.select-box-large.event-type').chosen().val()].heading);
$('.book-daily-report .box-title-help').attr('data-original-title', captions[$('.select-box-large.event-type').chosen().val()].tooltip);

getFilters(
    $('.select-box-large.filter-by').chosen().val(),
    $('.store-select-box').chosen().val()
);

$('.btnApply').on('click', () => {
    getReport(
        $('.store-select-box').chosen().val(),
        $('.select-box-large.event-type').chosen().val(),
        $('.select-box-large.institution').chosen().val(),
        $('.select-box-large.book').chosen().val()
    );
});

$('.chart-type button').on('click', function() {
    $(this).siblings().removeClass('active');
    $(this).addClass('active');

    renderChart(transformed.chart, $(this).attr('name'));
});

$('.select-box-large.filter-by').chosen().change(function(){
    getFilters($(this).val(), $('.store-select-box').chosen().val());
});

getInstitutions(params.storeId);
getBooks(params.storeId);
getReport(params.storeId, params.event, params.institutionIds, params.productIds);

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
        storeId : storeId,
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

function getBooks(storeId) {
    if(!storeId) {
        storeId = $('.store-select-box').chosen().val();
    }

    const key = `books:${storeId}`;

    if (typeof Storage !== 'undefined' && typeof sessionStorage[key]  !== 'undefined') {
        const books = JSON.parse(sessionStorage[key]);

        if (books.length) {
            return renderBooks(books);
        }
    }

    $.post('/books', {
        storeId : storeId,
        _csrf   : csrf
    },
    (res) => {
        if (res.success) {
            if (typeof Storage !== 'undefined') {
                sessionStorage[key] = JSON.stringify(res.data);
            }

            return renderBooks(res.data);
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function renderBooks(books) {
    let selectedIds = params.productIds,
        bookHtml    = '';

    $('.select-box-large.book option').remove();

    bookHtml = reduce(books, (html, book) => {
        return html + '<option ' + (indexOf(selectedIds, book.id) != -1 ? 'selected="selected"' : '') + ' value="' + book.id + '">' + book.name + '</option>';
    }, '');

    $('.select-box-large.book').append(bookHtml);
    $('.select-box-large.book').chosen().trigger('chosen:updated');
}

function getReport(storeId, event, institutionIds, productIds) {
    $('.flash-msgs').remove();

    if (!event) {
        event = $('.event-type').chosen().val();
    }

    const {startDate, endDate} = Datepicker.getDateRanges();

    let filterType     = $('.select-box-large.filter-by').chosen().val(),
        filterVals     = $('.select-box-large.filters').chosen().val(),
        platforms,
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
        case 'timespent':
            getTimeSpent(storeId, startDate, endDate, institutionIds, productIds, platforms, deviceMakes, deviceModels, appVersions);
            break;
        default:
            getBookActivity(storeId, startDate, endDate, event, institutionIds, productIds, platforms, deviceMakes, deviceModels, appVersions);
            break;
    }

    //change help
    $('.book-daily-report .box-title').html(captions[event].heading);
    $('.book-daily-report .box-title-help').attr('data-original-title', captions[event].tooltip);
    $(`ul.sidebar-menu .${paths[0]}-${paths[1]} li`).removeClass('active');
    $(`ul.sidebar-menu .${paths[0]}-${paths[1]}-${event}`).addClass('active');
}

function getBookActivity(storeId, startDate, endDate, event, institutionIds, productIds, platforms, deviceMakes, deviceModels, appVersions) {
    if(!storeId) {
        storeId = $('.store-select-box').chosen().val();
    }

    if (!event) {
        event = $('.event-type').chosen().val();
    }

    $.post('/events', {
        storeId        : [storeId],
        startDate      : startDate,
        endDate        : endDate,
        dimension      : 'day',
        eventTypes     : [event],
        institutionIds : institutionIds,
        productIds     : productIds,
        platforms      : platforms,
        deviceMakes    : deviceMakes,
        deviceModels   : deviceModels,
        appVersions    : appVersions,
        _csrf          : csrf
    },
    (res) => {
        if (res.success) {
            let showLink = true;

            transformed = transform(res.data, event);

            switch (event) {
                case 'bookDownloadComplete':
                case 'bookOpen':
                case 'searchResult':
                    showLink = false;
                    break;
            }

            renderTable(transformed.tabular, storeId, event, 'Activity Count', showLink);

            prepareExport('/books/activity/export');

            return renderChart(transformed.chart, $('.chart-type > .active').attr('name'));
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function getTimeSpent(storeId, startDate, endDate, institutionIds, productIds, platforms, deviceMakes, deviceModels, appVersions) {
    if(!storeId) {
        storeId = $('.store-select-box').chosen().val();
    }

    $.post('/books/timespent/summary', {
        storeId        : storeId,
        startDate      : startDate,
        endDate        : endDate,
        institutionIds : institutionIds,
        productIds     : productIds,
        platforms      : platforms,
        deviceMakes    : deviceMakes,
        deviceModels   : deviceModels,
        appVersions    : appVersions,
        _csrf          : csrf
    },
    (res) => {
        if (res.success) {
            transformed = transformTimeSpent(res.data);

            renderTable(transformed.tabular, storeId, 'timespent', 'Duration in HH:MM:SS');

            prepareExport('/books/timespent/export');

            return renderTimespentChart($('.chart-type > .active').attr('name'), transformed.chart);
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function renderChart(data, chartType) {
    Highcharts.chart(document.getElementsByClassName('top-books')[0], {
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
                text: 'Activity count'
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

function renderTimespentChart(chartType, data) {
    Highcharts.chart(document.getElementsByClassName('top-books')[0], {
        chart: {
            type           : chartType,
            backgroundColor: 'transparent',
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
                day:'%e %b \'%y'
            },
            labels: {
                style: {
                    fontSize: '13px'
                }
            }
        },
        yAxis: {
            title: {
                text: 'Hours'
            },
            labels: {
               formatter: function(){
                    let seconds = this.value,
                        minutes,
                        hours;

                    this.value = seconds * 1000;
                    minutes = (seconds / 60) | 0;
                    seconds -= minutes * 60;
                    hours = (minutes / 60) | 0;
                    minutes -= hours * 60;

                    return hours;
                }
            },
            startOnTick: false,
            showFirstLabel: false
        },
        legend: {
            enabled: false
        },
        tooltip: {
            shared: false,
            formatter: function() {
                let hours     = (parseInt( this.y / 3600 ) % 24),
                    minutes   = (parseInt( this.y / 60 ) % 60),
                    seconds   = (this.y % 60);

                hours = hours < 10 ? '0'+ hours : hours;
                minutes = minutes < 10 ? '0'+ minutes : minutes;
                seconds = seconds < 10 ? '0'+ seconds : seconds;

                return Highcharts.dateFormat('%e %b, %Y', this.x) + '<br />' + this.series.name + ': <b>' + hours + ':' + minutes + ':' + seconds +'</b>';
            }
        },
        series: data
    });
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

function transformTimeSpent(rows) {
    let payload = {
        'tabular': [],
        'chart'  : []
    };

    if (! rows.length) {
        return payload;
    }

    payload.tabular = map(rows, (row) => {
        let hours     = (parseInt( row.duration / 3600 ) % 24),
            minutes   = (parseInt( row.duration / 60 ) % 60),
            seconds   = (row.duration % 60);

        hours = hours < 10 ? '0'+ hours : hours;
        minutes = minutes < 10 ? '0'+ minutes : minutes;
        seconds = seconds < 10 ? '0'+ seconds : seconds;

        return {
            'date' : moment(row.timestamp * 1000).format('DD MMM YYYY'),
            'count' : hours + ':' + minutes + ':' + seconds
        }
    });

    payload.chart = [{
        'name' : 'Time spent',
        'data' : map(rows, (row) => {
            return [
                moment(row.timestamp * 1000).utc().valueOf(),
                row.duration
            ];
        })
    }];

    return payload;
}

function renderTable(rows, storeId, event, tableHeader, showLink = false) {
    $('.bookdata').html(tableBookDaily({
        rows,
        storeId,
        event,
        tableHeader,
        'showLink'    : showLink
    }));

    $('.report-list').DataTable({
        'responsive'  : true,
        'lengthChange': true
    });
}

function prepareExport(action) {
    const exportData = {
        'report'   : transformed.tabular
    };

    $('form[name="export"]').attr('action', action);

    $('form[name="export"] input[name="export"]').val(JSON.stringify(exportData));
}
