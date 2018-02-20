import Highcharts from 'highcharts';
require('highcharts/modules/exporting')(Highcharts);
require('highcharts/modules/funnel')(Highcharts);
import Datepicker from 'datePicker';
import 'common';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import head from 'lodash/head';
import indexOf from 'lodash/indexOf';
import startCase from 'lodash/startCase';
import 'chosen-npm/public/chosen.jquery';

const stepList = {
        'notesFunnel'      : ['bookDownloadComplete', 'bookOpen', 'noteAdd'],
        'highlightsFunnel' : ['bookDownloadComplete', 'bookOpen', 'highlightAdd'],
        'bookmarksFunnel'  : ['bookDownloadComplete', 'bookOpen', 'bookmarkAdd'],
        'searchFunnel'     : ['bookDownloadComplete', 'bookOpen', 'searchResult']
    },
    paths       = window.location.pathname.substring(1).split('/'),
    captions    = {
        'bookDownloadComplete' : 'Book Downloaded',
        'bookOpen'             : 'Books Opened',
        'noteAdd'              : 'Notes Added',
        'bookmarkAdd'          : 'Bookmarks Added',
        'highlightAdd'         : 'Highlights Added',
        'searchResult'         : 'Book Searched',
        'notesFunnel': {
            'heading': 'Notes Funnel',
            'tooltip': 'The chart display, in progressively decreasing proportions, the number of users who downloaded a book followed by the number of users who opened a book and finally the number of users who added a note'
        },
        'bookmarksFunnel': {
            'heading': 'Bookmarks Funnel',
            'tooltip': 'The chart display, in progressively decreasing proportions, the number of users who downloaded a book followed by the number of users who opened a book and finally the number of users who added a bookmark'
        },
        'highlightsFunnel': {
            'heading': 'Highlights Funnel',
            'tooltip': 'The chart display, in progressively decreasing proportions, the number of users who downloaded a book followed by the number of users who opened a book and finally the number of users who added a highlight'
        },
        'searchFunnel': {
            'heading': 'Search Funnel',
            'tooltip': 'The chart display, in progressively decreasing proportions, the number of users who downloaded a book followed by the number of users who opened a book and finally the number of users who performed a search'
        }
    },
    csrf = $('input[name=_csrf]').val();

forEach([
    '.store-select-box',
    '.funnel-select-box',
    '.select-box-large.filter-by',
    '.select-box-large.filters',
    '.select-box-large.institution',
], (select) => {
    /*eslint-disable */
    $(select).chosen({
        disable_search : true
    });
    /*eslint-enable */
});

$('.select-box-large.filter-by').chosen().change(function(){
    getFilters($(this).val(), $('.store-select-box').chosen().val());
});

$('.store-select-box').chosen().change(function(){
    getFilters($('.select-box-large.filter-by').chosen().val(), $(this).val());
    getInstitutions($('.store-select-box').chosen().val());
});

getFilters(
    $('.select-box-large.filter-by').chosen().val(),
    $('.store-select-box').chosen().val()
);

$('.btnApply').on('click', function() {
    getReport();
});

Datepicker.setDatePicker('input[name="daterange"]');

//Title help
$('.funnel-activity-report .box-title').html(captions[$('.funnel-select-box').chosen().val()].heading);
$('.funnel-activity-report .box-title-help').attr('data-original-title', captions[$('.funnel-select-box').chosen().val()].tooltip);

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
    let funnelName           = $('.funnel-select-box').chosen().val(),
        steps                = stepList[funnelName],
        {startDate, endDate} = Datepicker.getDateRanges(),
        filterType           = $('.select-box-large.filter-by').chosen().val(),
        filterVals           = $('.select-box-large.filters').chosen().val(),
        institutionIds       = $('.select-box-large.institution').chosen().val(),
        tranformedData,
        platform,
        appVersion;

    switch (filterType) {
        case 'device_platform':
            platform = filterVals;
            break;
        case 'app_version':
            appVersion = filterVals;
            break;
    }

    //change help
    $('.funnel-activity-report .box-title').html(captions[funnelName].heading);
    $('.funnel-activity-report .box-title-help').attr('data-original-title', captions[funnelName].tooltip);
    $(`ul.sidebar-menu .${paths[0]} li`).removeClass('active');
    $(`ul.sidebar-menu .${paths[0]}-${funnelName}`).addClass('active');

    $.post('/funnel', {
        storeId       : $('.store-select-box').chosen().val(),
        startDate     : startDate,
        endDate       : endDate,
        steps         : steps,
        platform      : platform,
        appVersion    : appVersion,
        institutionIds: institutionIds,
        _csrf         : csrf
    },
    (res) => {
        if (res.success) {
            tranformedData = transformForFunnel(res.data, funnelName, steps);
            return renderChart('book-funnel', tranformedData, startCase(funnelName));
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function renderChart(target, data, funnelName) {
    Highcharts.chart(document.getElementsByClassName(target)[0], {
         chart: {
            type            :'funnel',
            backgroundColor :'transparent',
            marginRight: 130
        },
        credits: {
            enabled: false
        },
        title: {
            text : data.length ? 'Unique Users' : 'No data',
            x    : -50
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled       : true,
                    distance      : 0,
                    format        : '<b>{point.name}</b> ({point.y:,.0f})',
                    softConnector : true
                },
                neckWidth  : '30%',
                neckHeight : '25%'
            }
        },
        legend: {
            enabled: false
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
        },
        navigation: {
            buttonOptions: {
                x: -10
            }
        }
    });
}

function transformForFunnel(data, funnelName, steps) {
    if (! head(data.counts)) {
        return [];
    }

    return [{
        'name' : startCase(funnelName),
        'data' : map(steps, function(step, index) {
            return [
                captions[step],
                data.counts[index]
            ];
        })
    }];
}

function getInstitutions(storeId) {
    const key = `institutions:${storeId}`;

    if (typeof Storage !== 'undefined' && typeof sessionStorage[key]  !== 'undefined') {
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
