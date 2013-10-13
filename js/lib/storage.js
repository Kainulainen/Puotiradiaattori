define(function () {
    var key = 'puoti';
    return {
        save: function (data) {
            window.localStorage.setItem(key, JSON.stringify(data));
        },
        fetch: function () {
            return JSON.parse(window.localStorage.getItem(key));
        },
        clear: function () {window.localStorage.removeItem(key);}
    }
});