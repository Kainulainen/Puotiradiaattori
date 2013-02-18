define(function () {
    var key = 'puoti';
    return {
        save: function (data) {
            window.localStorage.setItem(key, JSON.stringify(data));
        },
        fetch: function () {
            var stored = JSON.parse(window.localStorage.getItem(key));
            return stored || false
        },
        clear: function () {window.localStorage.removeItem(key);}
    }
});