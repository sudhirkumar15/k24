import Highcharts from 'highcharts';
import moment from 'moment';
import Datepicker from 'datePicker';
import qs from 'qs';
import map from 'lodash/map';
import forEach from 'lodash/forEach';
import reduce from 'lodash/reduce';
import indexOf from 'lodash/indexOf';
import 'common';
import 'chosen-npm/public/chosen.jquery';

const csrf = $('input[name=_csrf]').val(),
    params = qs.parse(window.location.search.substring(1));

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

$('.btnApply').on('click', () => {
    getReports(params);
});

$('.store-select-box').chosen().change(() => {
    getInstitutions();
});

$('.select-box-large.institution').chosen();
$('.select-box-large.book').chosen();

$('.box-header > [data-toggle="tooltip"]').tooltip();

Datepicker.setDatePicker('input[name="daterange"]');

getReports(params);
getInstitutions(params.storeId);

$('.user-details').on('click', function(e) {
    e.preventDefault();

    const storeId      = $('.store-select-box').chosen().val(),
        institutionIds = $('.select-box-large.institution').chosen().val(),
        event          = $(this).data('event');

    window.location = '/users/daily?' + qs.stringify({
        storeId,
        institutionIds,
        event
    });
});

$('.top-user-details').on('click', function(e) {
    e.preventDefault();

    const storeId      = $('.store-select-box').chosen().val(),
        institutionIds = $('.select-box-large.institution').chosen().val(),
        event          = $(this).data('event');

    window.location = '/users/activity?' + qs.stringify({
        storeId,
        institutionIds,
        event
    });
});

function getReports(params) {
    let storeId              = $('.store-select-box').chosen().val(),
        institutionIds       = $('.select-box-large.institution').chosen().val();

    const {startDate, endDate} = Datepicker.getDateRanges();

    if(!storeId && params.storeId) {
        storeId = params.storeId;
    }

    if(!institutionIds && params.institutionIds) {
        institutionIds = params.institutionIds;
    }

    getSessions(startDate, endDate, storeId, institutionIds);
    getBookDownloads(startDate, endDate, storeId, institutionIds);
    getBookOpens(startDate, endDate, storeId, institutionIds);
    getBookSearches(startDate, endDate, storeId, institutionIds);
    getUserNotes(startDate, endDate, storeId, institutionIds);
    getTopUserDownloadBook(startDate, endDate, storeId, institutionIds);
    getTopUsesOpenBook(startDate, endDate, storeId, institutionIds);
}

function getSessions(startDate, endDate, storeId, institutionIds) {
    $.post('/sessions', {
        storeId       : [storeId],
        dimension     : 'day',
        startDate,
        endDate,
        institutionIds,
        _csrf         : csrf
    },
    (res) => {
        if (res.success) {
            const chartData = transformSessions(res.data);
            renderChart('sessions', 'column', chartData.activeUsers);
            return renderChart('sessions-new', 'column', chartData.newUsers);
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function getBookDownloads(startDate, endDate, storeId, institutionIds) {
    $.post('/users/events/summary', {
        storeId,
        startDate,
        endDate,
        events  : ['bookDownloadComplete'],
        institutionIds,
        userIds : [],
        _csrf   : csrf
    },
    (res) => {
        if (res.success) {
            return renderChart('book-downloads', 'column', transformEvents(res.data));
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function getBookOpens(startDate, endDate, storeId, institutionIds) {
    $.post('/users/events/summary', {
        storeId,
        startDate,
        endDate,
        events  : ['bookOpen'],
        institutionIds,
        userIds : [],
        _csrf   : csrf
    },
    (res) => {
        if (res.success) {
            return renderChart('book-open', 'column', transformEvents(res.data));
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function getBookSearches(startDate, endDate, storeId, institutionIds) {
    $.post('/users/events/summary', {
        storeId,
        startDate,
        endDate,
        events  : ['searchResult'],
        institutionIds,
        userIds : [],
        _csrf   : csrf
    },
    (res) => {
        if (res.success) {
            return renderChart('book-search', 'column', transformEvents(res.data));
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function getUserNotes(startDate, endDate, storeId, institutionIds) {
    $.post('/users/events/summary', {
        storeId,
        startDate,
        endDate,
        events  : ['noteAdd'],
        institutionIds,
        userIds : [],
        _csrf   : csrf
    },
    (res) => {
        if (res.success) {
            return renderChart('book-notes', 'column', transformEvents(res.data));
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function getTopUserDownloadBook(startDate, endDate, storeId, institutionIds) {
    $.post('/users/events', {
        storeId        : storeId,
        startDate      : startDate,
        endDate        : endDate,
        events         : ['bookDownloadComplete'],
        institutionIds : institutionIds,
        limit          : 5,
        _csrf          : csrf

    },
    (res) => {
        if (res.success) {
            return renderTopUserChart('top-user-download', 'column', transformTopUsers(res.data));
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function getTopUsesOpenBook(startDate, endDate, storeId, institutionIds) {
    $.post('/users/events', {
        storeId        : storeId,
        startDate      : startDate,
        endDate        : endDate,
        events         : ['bookOpen'],
        institutionIds : institutionIds,
        limit          : 5,
        _csrf          : csrf
    },
    (res) => {
        if (res.success) {
            return renderTopUserChart('top-user-open', 'column', transformTopUsers(res.data));
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function transformSessions(data) {
    if (! data.length) {
        return {
            "activeUsers" : [],
            "newUsers"    : []
        }
    }

    const series = {
        'activeUsers' : [
             {
                name: 'Active Users',
                data: []
             }
        ],
        'newUsers' : [
             {
                name: 'New Users',
                data: []
             }
        ]
    };

    forEach(data, (row) => {
        const timestamp = moment(row.timestamp * 1000).utc().valueOf();

        series['activeUsers'][0].data.push([
            timestamp ,
            row.users
        ]);

        series['newUsers'][0].data.push([
            timestamp ,
            row.newusers
        ]);
    });

    return series;
}

function transformEvents(data) {
    if(! data.length) {
        return [];
    }

    return [{
        'name' : 'No. of users',
        'data' : map(data, (row) => {
            return [
                moment(row.timestamp * 1000).utc().valueOf(),
                row.count
            ];
        })
    }];
}

function renderChart(target, chartType, data) {
    Highcharts.chart(document.getElementsByClassName(target)[0], {
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
                text: 'Count'
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            shared: false,
            formatter: function() {
                return Highcharts.dateFormat('%e %b, %Y', this.x) + '<br />' + this.series.name + ': <b>' + this.y + '</b>';
            }
        },
        series: data
    });
}

function renderTopUserChart(target, chartType, data) {
    Highcharts.chart(document.getElementsByClassName(target)[0], {
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
                return   'Name : ' + this.point.name + ' <br/> Count :  ' + this.y ;
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

function getInstitutions(storeId) {
    if(!storeId) {
        storeId = $('.store-select-box').chosen().val();
    }

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
    let selectedIds     = params.institutionIds,
        institutionHtml = '';

    $('.select-box-large.institution option').remove();

    institutionHtml = reduce(institutions, (html, institution) => {
        return html + '<option ' + (indexOf(selectedIds,institution.id) != -1 ? 'selected="selected"' : '') + ' value="' + institution.id + '">' + institution.name + '</option>';
    }, '');

    $('.select-box-large.institution').append(institutionHtml);
    $('.select-box-large.institution').chosen().trigger('chosen:updated');
}

function transformTopUsers(rows) {
    if (! rows.length) {
        return [];
    }

    return  [{
        'name' : 'Top Users',
        'data': map(rows, (row) => {
            return [
                row.name ? row.name : row.id,
                row.count
            ];
        })
    }];
}
