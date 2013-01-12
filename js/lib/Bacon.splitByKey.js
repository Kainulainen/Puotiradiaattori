Bacon.Observable.prototype.splitByKey = function() {
    return this.flatMap(function(object) {
        var stream = Bacon.never()
        _.each(object, function(value, key) {
            var newObj = {};
            newObj[key] = value;
            stream = stream.concat(Bacon.once(newObj))
        })
        return stream
    })
}
