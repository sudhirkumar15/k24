import Highcharts from 'highcharts';
require('highcharts/modules/exporting')(Highcharts);
require('highcharts/modules/heatmap')(Highcharts);
import qs from 'qs';
import moment from 'moment';
import Datepicker from 'datePicker';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import indexOf from 'lodash/indexOf';
import uniq from 'lodash/uniq';
import 'common';
import 'chosen-npm/public/chosen.jquery';

const csrf     = $('input[name=_csrf]').val(),
      params   = qs.parse(window.location.search.substring(1)),
      paths    = window.location.pathname.substring(1).split('/'),
      captions = {
        'noteAdd': {
            'heading': 'EPUB Heatmap - Notes',
            'tooltip': 'The darker shades represent more users creating notes on those contents of the selected book'
        },
        'bookmarkAdd': {
            'heading': 'EPUB Heatmap - Bookmarks',
            'tooltip': 'The darker shades represent more users bookmarking the content of the selected book'
        },
        'highlightAdd': {
            'heading': 'EPUB Heatmap - Highlights',
            'tooltip': 'The darker shades represent more users creating highlights on those contents of the selected book'
        },
        'contentView': {
            'heading': 'EPUB Heatmap - Content Views',
            'tooltip': 'The darker shades represent more user views for those contents of the selected book'
        },
        'contentScroll': {
            'heading': 'EPUB Heatmap - Content Views',
            'tooltip': 'The darker shades represent more user activity in terms of content scrolling within the selected book'
        }
    };;

forEach([
    '.store-select-box',
    '.select-box-large.institution',
    '.select-box-large.event-type'
], (select) => {
    $(select).chosen({
        /*eslint-disable */
        disable_search : true
        /*eslint-enable */
    });
});

Datepicker.setDatePicker('input[name="daterange"]');

$('.btnApply').on('click', function() {
    getReport(
        $('.store-select-box').chosen().val(),
        $('.select-box-large.book').chosen().val(),
        $('.select-box-large.event-type').chosen().val(),
        $('.select-box-large.institution').chosen().val()
    );
});

$('.store-select-box').chosen().change(function(){
    getInstitutions($(this).val());
    getBooks($(this).val());
});

getInstitutions(params.storeId);
getBooks(params.storeId);

if (params.bookId) {
    getReport(params.storeId, params.bookId, params.event, params.institutionIds);
} else {
    $('.heatmap-report .loading').hide();
}

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

    const key = `institutions-${storeId}`;

    if (typeof Storage !== 'undefined' && typeof sessionStorage[key] !== 'undefined') {
        return renderInstituitions(JSON.parse(sessionStorage[key]));
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
    let bookId     = params.bookId,
        bookHtml   = '<option>Please select a book </option>',
        bookExists = false;

        $('.select-box-large.book option').remove();

        bookHtml = reduce(books, (html, book) => {
            if(book.id === bookId){
                bookExists = true;
            }

            return html + '<option ' + (book.id === bookId ? 'selected="selected"' : '') + ' value="' + book.id + '">' + book.name + '</option>';
        }, bookHtml);

        if(bookId && !bookExists) {
            bookHtml = `<option selected="selected" value="${bookId}">${bookId}</option>${bookHtml}`;
        }

        $('.select-box-large.book').append(bookHtml);
        $('.select-box-large.book').chosen().trigger('chosen:updated');
}

function getReport(storeId, bookId, event, institutionIds) {
    let {startDate, endDate} = Datepicker.getDateRanges(),
        filterType           = $('.select-box-large.filter-by').chosen().val(),
        filterVals           = $('.select-box-large.filters').chosen().val(),
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

    if(!storeId) {
        storeId = $('.store-select-box').chosen().val();
    }

    if(!event) {
        event = $('.select-box-large.event-type').chosen().val();
    }

    if(!bookId) {
        bookId = $('.select-box-large.book').chosen().val();
    }

    $.post('/books/epub/contents', {
        storeId,
        startDate,
        endDate,
        bookId,
        events: [event],
        institutionIds,
        platforms,
        deviceMakes,
        deviceModels,
        appVersions,
        _csrf : csrf
    },
    (res) => {
        if (res.success) {
            var formatedData = transform(res.data);
            return renderChart('chart-data', formatedData, $('.select-box-large.event-type option:selected').html());
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });

    $('.heatmap-report .box-title').html(captions[event].heading);
    $('.heatmap-report .box-title-help').attr('data-original-title', captions[event].tooltip);
    $(`ul.sidebar-menu .${paths[0]}-${paths[1]}-${paths[2]} li`).removeClass('active');
    $(`ul.sidebar-menu .${paths[0]}-${paths[1]}-${paths[2]}-${event}`).addClass('active');
}

function renderChart(target, heatmapData, caption) {
    if(! heatmapData.data.length) {
        return $(`.${target}`).html('<div class="no-data"><span>No data</span></div>');
    }

    const colors = Highcharts.getOptions().colors;

    Highcharts.chart(document.getElementsByClassName(target)[0], {
        chart: {
            type: 'heatmap',
            backgroundColor:'transparent',
            zoomType: 'xy',
            inverted: true
        },
        credits: {
            enabled: false
        },
        title: {
            text: heatmapData.data.length ? caption : 'No data'
        },
        xAxis: {
            title: null,
            categories: heatmapData.catxAxis,
        },
        yAxis: {
            title: null,
            gridLineColor: 'transparent',
            categories: heatmapData.displayPages,
        },
        colorAxis: {
            min: 1,
            type: 'logarithmic',
            minColor: colors[11],
            maxColor: colors[12],
            /*eslint-disable */
            stops: [
                [0, colors[11]],
                [0.67, colors[13]],
                [1, colors[12]]
            ]
            /*eslint-enable */
        },
        legend: {
            align: 'right',
            layout: 'vertical',
            margin: 0,
            verticalAlign: 'top',
            y: 25,
            symbolHeight: 320
        },
        tooltip: {
            formatter: function() {
                return '<b> Name :  </b>' + (heatmapData.displayPages[this.point.y] ? heatmapData.displayPages[this.point.y] : heatmapData.catyAxis[this.point.y]) + '<br>' +
                    '<b>' + caption + '</b> : ' + this.point.value + '<br> ' +
                    '<b>' + (heatmapData.catxAxis[this.point.x] !== 'Overall' ? 'Date : ' : 'Type : ') + '</b>' + heatmapData.catxAxis[this.point.x];
            }
        },
        series: [{
            name: 'Content view by date',
            borderWidth: 0,
            data: heatmapData.data,
            dataLabels: {
                enabled: false,
                style: {
                    textShadow: false
                }
            }
        }]
    });
}

function transform(data) {
    let cdata            = [],
        totalViews       = [],
        displayPages     = [],
        uniquePages      = uniq(map(data, 'url')),
        uniqueTimestamps = uniq(map(data, 'timestamp')),
        dates;

    forEach(uniquePages, (page, pageKey) => {
        forEach(uniqueTimestamps, (timestamp, timestampKey) => {
            forEach(data, (event) => {
                if (event.timestamp === timestamp && event.url === page) {
                    cdata.push([
                        timestampKey,
                        pageKey,
                        event.count
                    ]);

                    if (!displayPages[pageKey]) {
                        displayPages[pageKey] = event.name ? event.name : event.url;
                    }

                    if (totalViews[pageKey]) {
                        totalViews[pageKey] = totalViews[pageKey] + event.count;
                    } else {
                        totalViews[pageKey] = event.count;
                    }
                }
            });
        });
    });

    forEach(uniquePages, (page, pageKey) => {
        if(totalViews[pageKey]) {
            cdata.push([
                uniqueTimestamps.length,
                pageKey,
                totalViews[pageKey]
            ]);
        }
    });

    dates = map(uniqueTimestamps, (timestamp) => {
        return moment(timestamp * 1000).format('DD MMM YYYY');
    });

    dates.push('Overall');

    return {
        'catxAxis'     : dates,
        'catyAxis'     : uniquePages,
        'displayPages' : displayPages,
        'data'         : cdata
    };
}
