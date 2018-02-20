import Highcharts from 'highcharts';
import moment from 'moment';
import Datepicker from 'datePicker';
import qs from 'qs';
import map from 'lodash/map';
import forEach from 'lodash/forEach';
import reduce from 'lodash/reduce';
import uniq from 'lodash/uniq';
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
    getBooks();
});

$('.select-box-large.institution').chosen();
$('.select-box-large.book').chosen();

Datepicker.setDatePicker('input[name="daterange"]');

$('.box-header > [data-toggle="tooltip"]').tooltip();

getReports(params);
getInstitutions(params.storeId);
getBooks(params.storeId);

function getReports(params) {
    let storeId              = $('.store-select-box').chosen().val(),
        institutionIds       = $('.select-box-large.institution').chosen().val(),
        productIds           = $('.select-box-large.book').chosen().val();

    const {startDate, endDate} = Datepicker.getDateRanges();

    if(params.storeId) {
        storeId = params.storeId;
    }

    if(params.institutionIds) {
        institutionIds = params.institutionIds;
    }

    if(params.productIds) {
        productIds = params.productIds;
    }

    getBookOpen(startDate, endDate, storeId, institutionIds, productIds);
    getBookNotes(startDate, endDate, storeId, institutionIds, productIds);
    getBookReadings(startDate, endDate, storeId, institutionIds, productIds);
    getBookDownload(startDate, endDate, storeId, institutionIds, productIds);
    getBookSearches(startDate, endDate, storeId, institutionIds, productIds);
    getBookHighlights(startDate, endDate, storeId, institutionIds, productIds);
    getTopBookDownload(startDate, endDate, storeId, institutionIds, productIds);
    getTopBookOpen(startDate, endDate, storeId, institutionIds, productIds);
}

function getBookNotes(startDate, endDate, storeId, institutionIds, productIds) {
    $.post('/events', {
        storeId        : [storeId],
        startDate      : startDate,
        endDate        : endDate,
        dimension      : 'day',
        eventTypes     : ['noteAdd'],
        institutionIds : institutionIds,
        productIds     : productIds,
        _csrf          : csrf
    },
    (res) => {
        if (res.success) {
            return renderChart('book-notes', 'column', transform(res.data));
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function getBookOpen(startDate, endDate, storeId, institutionIds, productIds) {
    $.post('/events', {
        storeId        : [storeId],
        startDate      : startDate,
        endDate        : endDate,
        dimension      : 'day',
        eventTypes     : ['bookOpen'],
        institutionIds : institutionIds,
        productIds     : productIds,
        _csrf          : csrf
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

function getBookSearches(startDate, endDate, storeId, institutionIds, productIds) {
    $.post('/events', {
        storeId        : [storeId],
        startDate      : startDate,
        endDate        : endDate,
        dimension      : 'day',
        eventTypes     : ['searchResult'],
        institutionIds : institutionIds,
        productIds     : productIds,
        _csrf          : csrf
    },
    (res) => {
        if (res.success) {
            return renderChart('book-search', 'column', transform(res.data));
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function getBookHighlights(startDate, endDate, storeId, institutionIds, productIds) {
    $.post('/events', {
        storeId        : [storeId],
        startDate      : startDate,
        endDate        : endDate,
        dimension      : 'day',
        eventTypes     : ['highlightAdd'],
        institutionIds : institutionIds,
        productIds     : productIds,
        _csrf          : csrf
    },
    (res) => {
        if (res.success) {
            return renderChart('book-highlight', 'column', transform(res.data));
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function getBookDownload(startDate, endDate, storeId, institutionIds, productIds) {
    $.post('/events', {
        storeId        : [storeId],
        startDate      : startDate,
        endDate        : endDate,
        dimension      : 'day',
        eventTypes     : ['bookDownloadComplete'],
        institutionIds : institutionIds,
        productIds     : productIds,
        _csrf          : csrf
    },
    (res) => {
        if (res.success) {
            return renderChart('book-download', 'column', transform(res.data));
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function getTopBookDownload(startDate, endDate, storeId, institutionIds, productIds) {
    $.post('/books/top', {
        storeId        : storeId,
        startDate      : startDate,
        endDate        : endDate,
        events         : ['bookDownloadComplete'],
        institutionIds : institutionIds,
        productIds     : productIds,
        limit          : 5,
        _csrf          : csrf

    },
    (res) => {
        if (res.success) {
            return renderTopBooksChart('top-book-download', 'column', transformTopBooks(res.data));
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function getTopBookOpen(startDate, endDate, storeId, institutionIds, productIds) {
    $.post('/books/top', {
        storeId        : storeId,
        startDate      : startDate,
        endDate        : endDate,
        events         : ['bookOpen'],
        institutionIds : institutionIds,
        productIds     : productIds,
        limit          : 5,
        _csrf          : csrf

    },
    (res) => {
        if (res.success) {
            return renderTopBooksChart('top-book-open', 'column', transformTopBooks(res.data));
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
}

function getBookReadings(startDate, endDate, storeId, institutionIds, productIds) {
    $.post('/books/timespent/summary', {
        storeId        : storeId,
        startDate      : startDate,
        endDate        : endDate,
        institutionIds : institutionIds,
        productIds     : productIds,
        _csrf          : csrf
    },
    (res) => {
        if (res.success) {
            return renderTimespentChart('book-timespent', 'area', transformTimespentData(res.data));
        }

        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
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

function renderTimespentChart(target, chartType, data) {
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

function renderTopBooksChart(target, chartType, data) {
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

function transformTopBooks(rows) {
    if (! rows.length) {
        return [];
    }

    return  [{
        'name' : 'Books',
        'data': map(rows, (row) => {
            return [
                row.name ? `${row.name} (${row.format})` : `${row.id} (${row.format})`,
                row.count
            ];
        })
    }];
}

function transformTimespentData(data) {
    if(! data.length) {
        return [];
    }

    return [{
        'name' : 'Time spent',
        'data' : map(data, (row) => {
            return [
                moment(row.timestamp * 1000).utc().valueOf(),
                row.duration
            ];
        })
    }];
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
    let selectedIds        = params.institutionIds,
        institutionHtml   = '';

    $('.select-box-large.institution option').remove();

    institutionHtml = reduce(institutions, (html, institution) => {
        return html + '<option ' + (indexOf(selectedIds,institution.id) != -1 ? 'selected="selected"' : '') + ' value="' + institution.id + '">' + institution.name + '</option>';
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

$('.book-details').on('click', function(e) {
    e.preventDefault();

    const storeId      = $('.store-select-box').chosen().val(),
        institutionIds = $('.select-box-large.institution').chosen().val(),
        productIds     = $('.select-box-large.book').chosen().val(),
        event          = $(this).data('event');

    window.location = `/books/daily?${qs.stringify({
        storeId,
        institutionIds,
        productIds,
        event
    })}`;
});

$('.top-book-details').on('click', function(e) {
    e.preventDefault();

    const storeId      = $('.store-select-box').chosen().val(),
        institutionIds = $('.select-box-large.institution').chosen().val(),
        productIds     = $('.select-box-large.book').chosen().val(),
        event          = $(this).data('event');

    window.location = `/books/activity?${qs.stringify({
        storeId,
        institutionIds,
        productIds,
        event
    })}`;
});
