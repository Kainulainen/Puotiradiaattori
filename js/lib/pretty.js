/*
 * JavaScript Pretty Date
 * Copyright (c) 2011 John Resig (ejohn.org)
 * Licensed under the MIT and GPL licenses.
 */

// Takes an ISO time and returns a string representing how
// long ago the date represents.
define(function () {
    return function (time) {
        var UTC_date = new Date((time || "").replace(/-/g, "/").replace(/[TZ]/g, " "));
        var timeZoneOffsetInMilliseconds = new Date().getTimezoneOffset() * 60000;
        var diff = ((new Date().getTime() + timeZoneOffsetInMilliseconds) - UTC_date.getTime()) / 1000;
        var day_diff = Math.floor(diff / 86400);

        if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31)
            return;

        return day_diff == 0 && (
                diff < 60 && "just now" ||
                        diff < 120 && "a minute ago" ||
                        diff < 3600 && Math.floor(diff / 60) + " minutes ago" ||
                        diff < 7200 && "1 hour ago" ||
                        diff < 86400 && Math.floor(diff / 3600) + " hours ago") ||
                day_diff == 1 && "Yesterday" ||
                day_diff < 7 && day_diff + " days ago" ||
                day_diff < 31 && Math.ceil(day_diff / 7) + " weeks ago";
    }
})