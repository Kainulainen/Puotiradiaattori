Bacon.Observable.prototype.skipDuplicates = function() {
    return this.withStateMachine(void 0, function(prev, event) {
        if (!event.hasValue()) {
            return [prev, [event]];
        } else if (_.isEqual(prev, event.value) === false) {
            return [event.value, [event]];
        } else {
            return [prev, []];
        }
    });
};