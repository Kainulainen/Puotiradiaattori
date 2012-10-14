describe('Puotiradiaattori', function () {
    beforeEach(function () {
        Puotiradiaattori.connectToServer = $.noop;
        Puotiradiaattori.updateCounters(fakeJSON({"today":345}));
    });
    describe('counter configuration', function() {
        it('labels counter', function() {
           expect($('h1:first').text()).toBe(Config.counters[0].label);
        });
        it('sets counter digit count', function() {
            expect($('#today').find('.spinner').length).toEqual(Config.counters[0].digits);
        });
    });
    describe('updating counter when new data is received', function() {
        it('increases counter', function() {
            Puotiradiaattori.updateCounters(fakeJSON({"today":234980980}));
            expect($('#today').counterDigits()).toBe('0234980980');
        });
        it('decreases counter', function() {
            Puotiradiaattori.updateCounters(fakeJSON({"today":34}));
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

function fakeJSON(obj) {return JSON.stringify(obj)}

$.fn.counterDigits = function() {
    return $.map($(this).find('.spinner'),function (element) {
        return $(element).attr('class').split('roll-to-')[1];
    }).reverse().join('');
}