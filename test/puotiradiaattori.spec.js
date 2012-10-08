describe('Puotiradiaattori', function () {
    var defaultData, increaseData, decreaseData
    beforeEach(function () {
        defaultData = JSON.stringify({"today":14587});
        increaseData = JSON.stringify({"today":234980980});
        decreaseData = JSON.stringify({"today":34});
        Puotiradiaattori.connectToServer = function() {};
        Puotiradiaattori.init('');
        Puotiradiaattori.updateCounters(defaultData);
    });
    describe('updating counter when new data is received', function() {
        it('increases counter', function() {
            Puotiradiaattori.updateCounters(increaseData);
            expect($('#today').counterDigits()).toBe('0234980980');
        });
        it('decreases counter', function() {
            Puotiradiaattori.updateCounters(decreaseData);
            expect($('#today').counterDigits()).toBe('0000000034');
        });
    });
    describe('server connection indicating', function() {
        it('indicates when server is connected', function() {
            Puotiradiaattori.connect();
            expect($('#connection').html()).toBe('CONNECTED');
        });
        it('indicates when server is disconnected', function() {
            Puotiradiaattori.connect();
            Puotiradiaattori.disconnect();
            expect($('#connection').html()).toBe('DISCONNECTED');
        });
    });
    describe('reconnecting to server', function() {
        it('tries to reconnect after 50000ms', function() {
            jasmine.Clock.useMock();
            spyOn(Puotiradiaattori, 'connectToServer');
            Puotiradiaattori.disconnect();
            jasmine.Clock.tick(50000);
            expect(Puotiradiaattori.connectToServer).toHaveBeenCalled();
        });
    });
});

$.fn.counterDigits = function() {
    return $.map($(this).find('.spinner'),function (element) {
        return $(element).attr('class').split('roll-to-')[1];
    }).reverse().join('');
}