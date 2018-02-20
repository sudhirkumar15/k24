import Highcharts from 'highcharts';
import moment from 'moment';
import Datepicker from 'datePicker';
import map from 'lodash/map';
import forEach from 'lodash/forEach';
import uniq from 'lodash/uniq';
import head from 'lodash/head';
import reduce from 'lodash/reduce';
import indexOf from 'lodash/indexOf';
import 'common';
import 'chosen-npm/public/chosen.jquery';

const csrf = $('input[name=_csrf]').val();

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

$('.store-select-box').children().first().attr('selected', 'selected');

$('.store-select-box').chosen().change(function(){
    renderCharts();
    getInstitutions($('.store-select-box').chosen().val());
});

$('.select-box-large.institution').chosen().change(function(){
    renderCharts();
});

Datepicker.setDatePicker('.dashboard-date-range input[name="daterange"]', renderCharts);

renderCharts();
getInstitutions($('.store-select-box').chosen().val());

function renderCharts() {
    const {startDate, endDate} = Datepicker.getDateRanges();

    const storeId = $('.store-select-box').chosen().val();

    const institutionIds = $('.select-box-large.institution').chosen().val();

    getBookOpen(startDate, endDate, storeId, institutionIds);
    getSessions(startDate, endDate, storeId, institutionIds);
    getSessionSummary(startDate, endDate, storeId, institutionIds);
    getSegmentedSessionSummary(startDate, endDate, storeId, institutionIds);
    getAppVersion(startDate, endDate, storeId, institutionIds);
}

function getSessions(startDate, endDate, storeId, institutionIds) {
    $.post('/sessions', {
        storeId       : [storeId],
        startDate     : startDate,
        endDate       : endDate,
        dimension     : 'day',
        institutionIds: institutionIds,
        _csrf         : csrf
    },
    (res) => {
        if (res.success) {
            return renderChart('daily-app-usage', 'line', transformForLine(res.data), true);
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function getSegmentedSessionSummary(startDate, endDate, storeId, institutionIds) {
    $.post('/sessions/segments', {
        storeId       : [storeId],
        startDate     : startDate,
        endDate       : endDate,
        segment       : 'device_platform',
        institutionIds: institutionIds,
        _csrf         : csrf
    },
    (res) => {
        if (res.success) {
            return renderChart('device_platform', 'pie', transformForPie(res.data), true);
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function getSessionSummary(startDate, endDate, storeId, institutionIds) {
    $.post('/sessions/summary', {
        storeId       : [storeId],
        startDate     : startDate,
        endDate       : endDate,
        institutionIds: institutionIds,
        _csrf         : csrf
    },
    (res) => {
        if (res.success) {
            const response = head(res.data);

            $('.info-box-number.sessions').html(response.sessions);
            $('.info-box-number.newusers').html(response.newusers);
            $('.info-box-number.uniqueusers').html(response.users);
            return $('.info-box-number.eventcount').html(response.events);
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function getBookOpen(startDate, endDate, storeId, institutionIds) {
    $.post('/events', {
        storeId       : [storeId],
        startDate     : startDate,
        endDate       : endDate,
        dimension     : 'day',
        eventTypes    : ['bookOpen'],
        institutionIds: institutionIds,
        _csrf         : csrf
    },
    (res) => {
        if (res.success) {
            return renderChart('book-open', 'column', transform(res.data));
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function getAppVersion(startDate, endDate, storeId, institutionIds) {
    $.post('/events', {
        storeId       : [storeId],
        startDate     : startDate,
        endDate       : endDate,
        dimension     : 'day',
        segment       : 'app_version',
        institutionIds: institutionIds,
        _csrf         : csrf
    },
    (res) => {
        if (res.success) {
            return renderChart('app_version', 'area', transform(res.data), true);
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function renderChart(target, chartType, data, showLegend) {
    Highcharts.chart(document.getElementsByClassName(target)[0], {
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
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor          : 'pointer',
                dataLabels      : {
                    enabled: true,
                    format : '<b>{point.name}</b>: {point.percentage:.1f} %'
                },
                showInLegend: true
            }
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
                text: 'Count'
            }
        },
        legend: {
            enabled: showLegend
        },
        tooltip: {
            shared: false,
            formatter: function() {
                if (chartType !== 'pie') {
                    return Highcharts.dateFormat('%e %b %Y', this.x) + '<br />' + this.series.name + ': <b>' + this.y + '</b>';
                }

                return this.point.name + '<b> : ' + Math.round(this.point.percentage).toFixed(1) + ' %</b>';
            }
        },
        series: data
    });
}

function transform(data) {
    const lookup         = {},
        uniqueTimestamps = uniq(map(data, 'timestamp')),
        uniqueSegments   = uniq(map(data, 'segment'));

    const chart = map(uniqueSegments, (segment) => {
        return {
            'name': segment ? segment : 'Count',
            'data': []
        };
    });

    // find events corresponding to the above timestamps
    forEach(data, (event) => {
        forEach(uniqueTimestamps, (timestamp) => {
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

    forEach(lookup, (event, timestamp) => {
        forEach(event, (e) => {
            forEach(chart, (c) => {
                if (c.name === e.segment) {
                    c.data.push([
                        moment(timestamp * 1000).utc().valueOf(),
                        + e.count
                    ]);
                }
            });
        });
    });

    return chart;
}

function transformForPie(data) {
    if (! data.length) {
        return [];
    }

    return [{
        name        : 'Platform',
        colorByPoint: true,
        data        : map(data, (row) => {
            return {
                name : row.segment,
                y    : row.sessions
            };
        })
    }];
}

function transformForLine(data) {
    if (! data.length) {
        return [];
    }

    const series = [{
        name: 'Sessions',
        data: []
    }, {
        name: 'Active Users',
        data: []
    }, {
        name: 'New Users',
        data: []
    }];

    forEach(data, (row) => {
        const timestamp = moment(row.timestamp * 1000).utc().valueOf();

        series[0].data.push([
            timestamp ,
            row.sessions
        ]);

        series[1].data.push([
            timestamp ,
            row.users
        ]);

        series[2].data.push([
            timestamp ,
            row.newusers
        ]);
    });

    return series;
}

function getInstitutions(storeId) {
    const key = `institutions:${storeId}`;

    if (typeof Storage !== 'undefined' && typeof sessionStorage[key]  !== 'undefined') {
        const institutions = JSON.parse(sessionStorage[key]);

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
