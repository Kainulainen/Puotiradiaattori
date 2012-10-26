describe('Puotiradiaattori', function () {
    beforeEach(function () {
        spinCounters({"today":345});
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
            spinCounters({"today":234980980});
            expect($('#today').counterDigits()).toBe('0234980980');
        });
        it('decreases counter', function() {
            spinCounters({"today":34});
            expect($('#today').counterDigits()).toBe('0000000034');
        });
        it('adds spinners when there are not enough digits', function() {
            spinCounters({"today":34234980980});
            expect($('#today').counterDigits()).toBe('34234980980');
        });
        it('plays sound when new digits are added', function() {
            spyOn(Puotiradiaattori.sound, 'play');
            spinCounters({"today":134234980980});
            expect(Puotiradiaattori.sound.play).toHaveBeenCalled();
        });
    });
    describe('server connection indicating', function() {
        it('indicates when server is connected', function() {
            Puotiradiaattori.connection.open();
            expect($('#connection').html()).toBe('CONNECTED');
        });
        it('indicates when server is disconnected', function() {
            Puotiradiaattori.connection.open();
            Puotiradiaattori.connection.close();
            expect($('#connection').html()).toBe('DISCONNECTED');
        });
    });
    describe('reconnecting to server', function() {
        it('tries to reconnect after 50000ms', function() {
            jasmine.Clock.useMock();
            spyOn(Puotiradiaattori.connection, 'connect');
            Puotiradiaattori.connection.close();
            jasmine.Clock.tick(50000);
            expect(Puotiradiaattori.connection.connect).toHaveBeenCalled();
        });
    });
});

describe('Sound', function() {
    it('can be set to on by default', function() {
        expect(Sound(true).isOn()).toBeTruthy();
    });
    it('can be set to off by default', function() {
        expect(Sound(false).isOn()).toBeFalsy();
    });
    it('can be toggled', function() {
        var sound = Sound(false);
        sound.toggle();
        expect(sound.isOn()).toBeTruthy();
    });
});

function spinCounters(json) {
    Puotiradiaattori.connection.message(fakeJSON(json));
}

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