import moment from 'moment';
import 'bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';

class DatePicker {
    static getDateRanges() {
        const ranges = {
            startDate: moment().subtract(15, 'days').format('MMM-DD-YYYY'),
            endDate  : moment().subtract(1, 'days').format('MMM-DD-YYYY')
        };

        if (typeof Storage !== 'undefined') {
            if(sessionStorage.startDate) {
               ranges.startDate = sessionStorage.startDate;
            }

            if(sessionStorage.endDate) {
               ranges.endDate = sessionStorage.endDate;
            }
        }

        return ranges;
    }

    static saveRange(startDate, endDate) {
        if (typeof Storage !== 'undefined') {
            sessionStorage.startDate = startDate;
            sessionStorage.endDate = endDate;
        }
    }

    static setDatePicker(selector, cb) {
        const dateRange = this.getDateRanges();

        $(selector).daterangepicker({
            'locale': {
                'format': 'MMM D, YYYY'
            },
            'autoApply': true,
            'ranges': {
                'Today'        : [moment(), moment()],
                'Yesterday'    : [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days'  : [moment().subtract(6, 'days'), moment()],
                'Last 30 Days' : [moment().subtract(29, 'days'), moment()],
                'This Month'   : [moment().startOf('month'), moment().endOf('month')],
                'Last Month'   : [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            },
            'startDate' : dateRange.startDate,
            'endDate'   : dateRange.endDate,
            'opens'     : 'right'
        });

        this.setDateClickHandler(selector, this, cb);
    }

    static setDateClickHandler(selector, calender, cb) {
        $(selector).on('apply.daterangepicker', function(e, picker) {
            calender.saveRange(
                picker.startDate.format('MMM D, YYYY'),
                picker.endDate.format('MMM D, YYYY')
            );

            if (cb) {
                cb();
            }
        });
    }
}

export default DatePicker;
