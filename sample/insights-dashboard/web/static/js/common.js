import nprogress from 'nprogress';
import Highcharts from 'highcharts';
import cookie from 'js-cookie';
import 'plugin';
import 'bootstrap/dist/css/bootstrap';
import 'font-awesome/css/font-awesome';
import '../css/app';
import head from 'lodash/head';
import qs from 'qs';

// register service worker
require('offline-plugin/runtime').install();

nprogress.configure({ showSpinner: false });

$(document).ajaxStart(function () {
    nprogress.start();
    $('.btnApply').prop('disabled', true);
    $('.btnApply').html('<i class="fa fa-spinner load-btn"></i>  Apply');
});

$(document).ajaxStop(function () {
    nprogress.done(true);
    $('.btnApply').prop('disabled', false);
    $('.btnApply').html('<i class="fa fa-play load-btn"></i>  Apply');
});

if(window.location.pathname.substring(1) !== '') {
    let paths = window.location.pathname.substring(1).split('/'),
       params = qs.parse(window.location.search.substring(1))

    if(paths[0]) {
        $('.main-sidebar .sidebar-menu li.link').removeClass('active');
        $('ul.sidebar-menu .' + head(paths)).addClass('active');
    }

    if(paths[1]) {
        $(`ul.sidebar-menu .${paths[0]}-${paths[1]}`).addClass('active');
    }

    if(paths[2]) {
        $(`ul.sidebar-menu .${paths[0]}-${paths[1]}-${paths[2]}`).addClass('active');

        if(params.event) {
            $(`ul.sidebar-menu .${paths[0]}-${paths[1]}-${paths[2]}-${params.event}`).addClass('active');
        }
    }

    if(params.event) {
        $(`ul.sidebar-menu .${paths[0]}-${paths[1]}-${params.event}`).addClass('active');
    }
}

$('body').on('click', '.flash-msgs .close', function () {
    $(this).closest('.flash-msgs').remove();
});

$('ul.menu > li').on('click', function() {
    $('ul.menu > li').removeClass('change');
    $(this).addClass('change');
});

$('body').on('click', function(e) {
    if (e.target.id === 'ul.menu > li'){
        return;
    }

    if ($(e.target).closest('ul.menu > li').length){
        return;
    }

    $('ul.menu > li').removeClass('change');
});

// initialize tooltips
$('.box-header > [data-toggle="tooltip"]').tooltip();

// themes
const themes = {
    'dark': {
            colors: [
            '#2b908f',
            '#90ee7e',
            '#f45b5b',
            '#7798BF',
            '#aaeeee',
            '#ff0066',
            '#eeaaee',
            '#55BF3B',
            '#DF5353',
            '#7798BF',
            '#2b908f',
            '#796363',
            '#cc0000',
            '#f45b5b',
        ],
        chart: {
            backgroundColor: {
                linearGradient: {
                    x1: 0,
                    y1: 0,
                    x2: 1,
                    y2: 1
                },
                stops: [
                    [0, '#2a2a2b'],
                    [1, '#3e3e40']
                ]
            },
            style: {
                fontFamily: "'Unica One', sans-serif"
            },
            plotBorderColor: '#606063'
        },
        title: {
            style: {
                color: '#E0E0E3',
                fontSize: '20px'
            }
        },
        subtitle: {
            style: {
                color: '#E0E0E3',
            }
        },
        xAxis: {
            gridLineColor: '#707073',
            labels: {
                style: {
                    color: '#E0E0E3'
                }
            },
            lineColor: '#707073',
            minorGridLineColor: '#505053',
            tickColor: '#707073',
            title: {
                style: {
                    color: '#A0A0A3'

                }
            }
        },
        yAxis: {
            gridLineColor: '#707073',
            labels: {
                style: {
                    color: '#E0E0E3'
                }
            },
            lineColor: '#707073',
            minorGridLineColor: '#505053',
            tickColor: '#707073',
            tickWidth: 1,
            title: {
                style: {
                    color: '#A0A0A3'
                }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            style: {
                color: '#F0F0F0'
            }
        },
        plotOptions: {
            series: {
                dataLabels: {
                    color: '#B0B0B3'
                },
                marker: {
                    lineColor: '#333'
                }
            },
            boxplot: {
                fillColor: '#505053'
            },
            candlestick: {
                lineColor: 'white'
            },
            errorbar: {
                color: 'white'
            }
        },
        legend: {
            itemStyle: {
                color: '#E0E0E3'
            },
            itemHoverStyle: {
                color: '#FFF'
            },
            itemHiddenStyle: {
                color: '#606063'
            }
        },
        credits: {
            style: {
                color: '#666'
            }
        },
        labels: {
            style: {
                color: '#707073'
            }
        },
        drilldown: {
            activeAxisLabelStyle: {
                color: '#F0F0F3'
            },
            activeDataLabelStyle: {
                color: '#F0F0F3'
            }
        },
        navigation: {
            buttonOptions: {
                symbolStroke: '#DDDDDD',
                theme: {
                    fill: '#505053'
                }
            }
        },
        // scroll charts
        rangeSelector: {
            buttonTheme: {
                fill: '#505053',
                stroke: '#000000',
                style: {
                    color: '#CCC'
                },
                states: {
                    hover: {
                        fill: '#707073',
                        stroke: '#000000',
                        style: {
                            color: 'white'
                        }
                    },
                    select: {
                        fill: '#000003',
                        stroke: '#000000',
                        style: {
                            color: 'white'
                        }
                    }
                }
            },
            inputBoxBorderColor: '#505053',
            inputStyle: {
                backgroundColor: '#333',
                color: 'silver'
            },
            labelStyle: {
                color: 'silver'
            }
        },
        navigator: {
            handles: {
                backgroundColor: '#666',
                borderColor: '#AAA'
            },
            outlineColor: '#CCC',
            maskFill: 'rgba(255,255,255,0.1)',
            series: {
                color: '#7798BF',
                lineColor: '#A6C7ED'
            },
            xAxis: {
                gridLineColor: '#505053'
            }
        },
        scrollbar: {
            barBackgroundColor: '#808083',
            barBorderColor: '#808083',
            buttonArrowColor: '#CCC',
            buttonBackgroundColor: '#606063',
            buttonBorderColor: '#606063',
            rifleColor: '#FFF',
            trackBackgroundColor: '#404043',
            trackBorderColor: '#404043'
        },
        // special colors for some of the
        legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
        background2: '#505053',
        dataLabelsColor: '#B0B0B3',
        textColor: '#C0C0C0',
        contrastTextColor: '#F0F0F3',
        maskColor: 'rgba(255,255,255,0.3)'
    },
    'light': {
        colors: [
            '#7cb5ec',
            '#f7a35c',
            '#90ee7e',
            '#7798BF',
            '#aaeeee',
            '#ff0066',
            '#eeaaee',
            '#55BF3B',
            '#DF5353',
            '#7798BF',
            '#aaeeee',
            '#EEEEFF',
            '#000022',
            '#4444FF',
        ]
    }
};

const selectedTheme = cookie.get('theme');

if (themes[selectedTheme]) {
    setTheme(themes[selectedTheme]);
} else {
    setTheme(themes.light);
}

function setTheme(theme) {
    Highcharts.setOptions(theme);
}

$('.theme-menu').on('click', function() {
    $('.theme-option').slideToggle('slow');
});

$('.theme-option a:not([data-theme="'+ selectedTheme +'"])').addClass('pad-lf');
$('.theme-option a[data-theme="'+ selectedTheme +'"]').addClass('fa fa-check');

$('.theme-option a').on('click', function() {
    const theme = $(this).data('theme');

    $.post('/theme', {'theme': theme, _csrf : $('input[name=_csrf]').val()}, function (res) {
        if (res.success) {
            setTheme(themes[theme]);
            return window.location.reload();
        }

        // show error message, split point for async loading. Oh yesss
        require.ensure([], () => {
            const Flash = require('./flash').default;

            Flash.render({payload: res});
        });
    });
});

$('.bredcrumbs').on('click', function(e) {
    e.preventDefault();
    window.location = $(this).attr('href') + window.location.search;
});
