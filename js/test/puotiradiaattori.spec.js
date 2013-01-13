define(function (require) {
    var puotiradiaattori;
    var settings = require('settings');
    var $ = require('jquery');
    var _ = require('underscore');
    var Sound = require('sound');

    describe('Puotiradiaattori', function () {
        beforeEach(function () {
            puotiradiaattori = require('puotiradiaattori').init();
            spinCounters({"today": 345, 'week': 456});
        });
        describe('creating counters', function () {
            it('creates spinner with 10 digits', function () {
                expect($('#today').digitsInSpinner()).toEqual(10);
            });
            it('defaults to 4 digits if digit count is not set', function() {
                delete settings.counters[0].digits;
                puotiradiaattori = require('puotiradiaattori').init();
                expect($('#today').find('.spinner').length).toEqual(4);
                settings.counters[0].digits = 10;
            });
        });
        describe('counter settings configuration', function () {
            it('labels counter', function () {
                expect($('#today').find('h1').text()).toBe(settings.counters[0].label);
            });
            it('sets counter digit count', function () {
                expect($('#today').find('.spinner').length).toEqual(settings.counters[0].digits);
            });
        });
        describe('updating counter when new data is received', function () {
            it('increases counters', function () {
                spinCounters({"today": 234980980});
                expect($('#today').counterDigits()).toBe('0234980980');
            });
            it('decreases counter', function () {
                spinCounters({"today": 34});
                expect($('#today').counterDigits()).toBe('0000000034');
            });
            it('adds spinners when there are not enough digits', function () {
                spinCounters({"today": 34234980980});
                expect($('#today').counterDigits()).toBe('34234980980');
            });
            it('plays sound when new digits are added', function () {
                spyOn(puotiradiaattori.sound, 'play');
                spinCounters({"today": 134234980980});
                expect(puotiradiaattori.sound.play).toHaveBeenCalled();
            });
        });
        describe('updating multiple counters at once', function () {
            it('sets today to 345', function () {
                expect($('#today').counterDigits()).toBe('0000000345');
            });
            it('sets week to 456', function () {
                expect($('#week').counterDigits()).toBe('0000000456');
            });
        });
        describe('server connection indicating', function () {
            it('shows initial state to be disconnected', function () {
                assertConnectionIndication('DISCONNECTED');
            });
            it('indicates when server is connected', function () {
                openConnection()
                assertConnectionIndication('CONNECTED');
            });
            it('indicates when server is disconnected', function () {
                openConnection()
                closeConnection()
                assertConnectionIndication('DISCONNECTED');
            });
        });
        describe('reconnecting to server', function () {
            it('tries to reconnect after 50000ms', function () {
                jasmine.Clock.useMock();
                spyOn(puotiradiaattori.connection, 'connect');
                closeConnection()
                jasmine.Clock.tick(50000);
                expect(puotiradiaattori.connection.connect).toHaveBeenCalled();
            });
        });
    });

    describe('Sound', function () {
        it('can be set to on by default', function () {
            expect(Sound(true).isOn()).toBeTruthy();
        });
        it('can be set to off by default', function () {
            expect(Sound(false).isOn()).toBeFalsy();
        });
        it('can be toggled', function () {
            var sound = Sound(false);
            sound.toggle();
            expect(sound.isOn()).toBeTruthy();
        });
    });

    function spinCounters(json) {
        toMessageBus(fakeJSON(json));
    }

    function fakeJSON(obj) {
        return {'type': 'message', 'data': JSON.stringify(obj)}
    }

    function closeConnection() {
        toMessageBus({'type': 'close'});
    }

    function openConnection() {
        toMessageBus({'type': 'open'});
    }

    function toMessageBus(msg) {
        puotiradiaattori.connection.bus.push(msg)
    }

    function assertConnectionIndication(text) {
        expect($('#connection').html()).toBe(text);
    }

    $.fn.digitsInSpinner = function () {
        return $(this).find('.spinner:first .digit').length
    }

    $.fn.counterDigits = function () {
        return $.map($(this).find('.spinner'),function (element) {
            return $(element).attr('class').split('roll-to-')[1];
        }).reverse().join('');
    }

})