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
import tableBooks from '../views/partials/default/tableBooks';
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
            'heading': 'Top Books - Book Download',
            'tooltip': 'The ten, most frequently downloaded books, and their count'
        },
        'bookOpen': {
            'heading': 'Top Books - Book Open',
            'tooltip': 'The ten, most frequently opened books, and their count'
        },
        'noteAdd': {
            'heading': 'Top Books - Notes',
            'tooltip': 'Ten books for which maximum number of notes were created, and their count'
        },
        'bookmarkAdd': {
            'heading': 'Top Books - Bookmarks',
            'tooltip': 'Ten books for which maximum number of bookmarks were created and their count'
        },
        'highlightAdd': {
            'heading': 'Top Books - Highlights',
            'tooltip': 'Ten titles for which maximum number of highlights were created and their count'
        },
        'searchResult': {
            'heading': 'Top Books - Searches',
            'tooltip': 'The ten, most frequently searched books, and their count'
        },
        'pageView': {
            'heading': 'Top Books - Page Views (PDF)',
            'tooltip': 'Ten books for which maximum number of pages were viewed, and their count. Page views are for PDF books'
        },
        'contentView': {
            'heading': 'Top Books - Content Views (EPUB)',
            'tooltip': 'Ten books for which maximum content was viewed, and their count. Content views are for EPUB books'
        },
        'timespent': {
            'heading': 'Top Books - Time Spent',
            'tooltip': 'Ten books on which users have spent maximum time. The time is displayed in hours'
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
$('.book-activity-report .box-title').html(captions[$('.select-box-large.event-type').chosen().val()].heading);
$('.book-activity-report .box-title-help').attr('data-original-title', captions[$('.select-box-large.event-type').chosen().val()].tooltip);

$('body').on('click', '.book-id', function(e) {
    e.preventDefault();

    const storeId      = $('.store-select-box').chosen().val(),
        institutionIds = $('.select-box-large.institution').chosen().val(),
        productIds     = $('.select-box-large.book').chosen().val(),
        filterType     = $('.select-box-large.filter-by').chosen().val(),
        filterVals     = $('.select-box-large.filters').chosen().val(),
        event          = $(this).data('event'),
        format         = $(this).data('format'),
        bookId         = $(this).data('bookid');

    const urlParams = {
        storeId,
        institutionIds,
        productIds,
        bookId,
        event,
        format,
        filterType,
        filterVals
    };

    switch (event) {
        case 'pageView':
        case 'bookmarkAdd':
        case 'noteAdd':
        case 'highlightAdd':
        case 'contentView':
        case 'contentScroll':
            window.location = `/books/heatmap/${format}?${qs.stringify(urlParams)}`;
        break;
    }
});

getFilters(
    $('.select-box-large.filter-by').chosen().val(),
    $('.store-select-box').chosen().val(),
    params.filterVals
);

$('.btnApply').on('click', () => {
    getReport(
        $('.store-select-box').chosen().val(),
        $('.select-box-large.event-type').chosen().val(),
        $('.select-box-large.institution').chosen().val(),
        $('.select-box-large.book').chosen().val()
    );
});

$('.select-box-large.filter-by').chosen().change(function(){
    getFilters($(this).val(), $('.store-select-box').chosen().val());
});

$('.chart-type button').on('click', function() {
    $(this).siblings().removeClass('active');
    $(this).addClass('active');

    renderChart(transformed.chart, $(this).attr('name'));
});

getInstitutions(params.storeId);
getBooks(params.storeId);
getReport(params.storeId, params.event, params.institutionIds, params.productIds);

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

function renderFilters(filters, selectedValues) {
    $('.select-box-large.filters option').remove();

    let options = reduce(filters, function(html, filter) {
        return html + '<option ' + (indexOf(selectedValues, filter) != -1 ? 'selected="selected"' : '') + ' value="' + filter + '">' + filter + '</option>';
    }, '');

    $('.select-box-large.filters').append(options);
    $('.select-box-large.filters').chosen().trigger('chosen:updated');
    return $('.row.filter-val-row').show();
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
    $('.book-activity-chart .box-title').html(captions[event].heading);
    $('.book-activity-chart .box-title-help').attr('data-original-title', captions[event].tooltip);
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

    $.post('/books/top', {
        storeId        : storeId,
        startDate      : startDate,
        endDate        : endDate,
        events         : [event],
        institutionIds : institutionIds,
        productIds     : productIds,
        limit          : 100,
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

    $.post('/books/timespent', {
        storeId        : storeId,
        startDate      : startDate,
        endDate        : endDate,
        institutionIds : institutionIds,
        productIds     : productIds,
        limit          : 100,
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

            return renderHourChart(transformed.chart, $('.chart-type > .active').attr('name'));
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
                text: 'Activity count'
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            formatter: function() {
                return   'Name : ' + this.point.name + '<br />' + this.series.name + '<br /> count : <b>' + this.y + '</b>';
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

function renderHourChart(data, chartType) {
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
            type: 'category',
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
            type: 'linear',
            labels: {
               formatter: function() {
                    let seconds = this.value;

                    this.value = seconds * 1000;

                    let minutes = (seconds / 60) | 0;
                    seconds -= minutes * 60;

                    let hours = (minutes / 60) | 0;
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

                hours = hours < 10 ? `0${hours}` : hours;
                minutes = minutes < 10 ? `0${minutes}` : minutes;
                seconds = seconds < 10 ? `0${seconds}` : seconds;

                return `Name: ${this.point.name} <br /> ${this.series.name} : <b> ${hours}:${minutes}:${seconds}`;
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

    payload.tabular = rows;
    rows = slice(rows, 0, 10);
    payload.chart = [{
        'name' : `Activity : ${event}`,
        'data': map(rows, (row) => {
            return [
                row.name ? `${row.name} (${row.format})` : `${row.id} (${row.format})`,
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

        row['count'] = hours + ':' + minutes + ':' + seconds;
        return row;
    });

    rows = slice(rows, 0, 10);

    payload.chart = [{
        'name' : 'Time spent',
        'data' : map(rows, (row) => {
            return [
                row.name ? `${row.name} (${row.format})` : `${row.id} (${row.format})`,
                row.duration
            ];
        })
    }];

    return payload;
}

function renderTable(rows, storeId, event, tableHeader, showLink = false) {
    $('.bookdata').html(tableBooks({
        rows,
        storeId,
        event,
        tableHeader,
        'showLink'    : showLink
    }));

    $('.report-list').DataTable({
        'responsive'  : true,
        'lengthChange': true,
        'order'       : [[4, 'desc']]
    });
}

function prepareExport(action) {
    const exportData = {
        'report'   : transformed.tabular
    };

    $('form[name="export"]').attr('action', action);

    $('form[name="export"] input[name="export"]').val(JSON.stringify(exportData));
}
