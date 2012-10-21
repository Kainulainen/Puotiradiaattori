describe('Puotiradiaattori', function () {
    beforeEach(function () {
        Puotiradiaattori.message(fakeJSON({"today":345}));
    });
    describe('creating counters', function() {
        it('creates spinner with numbers in order from 0 to 9', function() {
            expect($('#today').digitsInSpinner()).toEqual('0123456789');
        });
    });
    describe('counter configuration', function() {
        it('labels counter', function() {
           expect($('#today').find('h1').text()).toBe(Config.counters[0].label);
        });
        it('sets counter digit count', function() {
            expect($('#today').find('.spinner').length).toEqual(Config.counters[0].digits);
        });
    });
    describe('updating counter when new data is received', function() {
        it('increases counter', function() {
            Puotiradiaattori.message(fakeJSON({"today":234980980}));
            expect($('#today').counterDigits()).toBe('0234980980');
        });
        it('decreases counter', function() {
            Puotiradiaattori.message(fakeJSON({"today":34}));
            expect($('#today').counterDigits()).toBe('0000000034');
        });
        it('adds spinners when there are not enough digits', function() {
            Puotiradiaattori.message(fakeJSON({"today":34234980980}));
            expect($('#today').counterDigits()).toBe('34234980980');
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
            spyOn(Puotiradiaattori, 'reconnect');
            Puotiradiaattori.disconnect();
            jasmine.Clock.tick(50000);
            expect(Puotiradiaattori.reconnect).toHaveBeenCalled();
        });
    });
});

function fakeJSON(obj) {
    var message = {};
    message.data = JSON.stringify(obj);
    return message;
}

$.fn.digitsInSpinner = function() {
    return $.map($(this).find('.spinner:first .plane'), function(element) {
        return $(element).attr('class').split('digit-')[1]
    }).join('');
}

$.fn.counterDigits = function() {
    return $.map($(this).find('.spinner'),function (element) {
        return $(element).attr('class').split('roll-to-')[1];
    }).reverse().join('');
}