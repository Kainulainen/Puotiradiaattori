Bacon.Observable.prototype.splitByKey = function() {
    return this.flatMap(function(object) {
        return _.reduce(object, function(stream, value, key) {
            var newObj = {};
            newObj[key] = value;
            return stream.concat(Bacon.once(newObj))
        }, Bacon.never())
    })
}