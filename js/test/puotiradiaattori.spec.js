define(function (require) {
    var puotiradiaattori = require('puotiradiaattori')
    var app = puotiradiaattori.init();
    var settings = require('settings');
    var $ = require('jquery');
    var _ = require('underscore');
    describe('Puotiradiaattori', function () {
        beforeEach(function () {
            puotiradiaattori.init();
            spinCounters({"today": 345, 'week': 456});
        });
        describe('creating counters', function () {
            it('creates spinner with 10 digits', function () {
                expect($('#today').digitsInSpinner()).toEqual(10);
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
                waitForCountersToSpin(function() {
                    expect($('#today').counterDigits()).toBe('0234980980');
                })
            });
            it('decreases counter', function () {
                spinCounters({"today": 34});
                waitForCountersToSpin(function() {
                    expect($('#today').counterDigits()).toBe('0000000034');
                })
            });
            it('adds spinners when there are not enough digits', function () {
                spinCounters({"today": 34234980980});
                waitForCountersToSpin(function() {
                    expect($('#today').counterDigits()).toBe('34234980980');
                });
            });
            it('removes spinners when there has been previously been more digits that the set default', function () {
                spinCounters({"today": 12334234980980});
                spinCounters({"today": 4980980});
                waitForCountersToSpin(function() {
                    expect($('#today').counterDigits()).toBe('0004980980');
                });
            });
        });
        describe('updating multiple counters at once', function () {
            it('sets today to 345', function () {
                waitForCountersToSpin(function() {
                    expect($('#today').counterDigits()).toBe('0000000345');
                });

            });
            it('sets week to 456', function () {
                waitForCountersToSpin(function() {
                    expect($('#week').counterDigits()).toBe('0000000456');
                });
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
                spyOn(app.connection, 'connect');
                connectionError()
                jasmine.Clock.tick(50000);
                expect(app.connection.connect).toHaveBeenCalled();
            });
        });
        describe('timestamp of the last update', function() {
            it('updates shown timestamp when new data is recieved', function() {
                expect($('#timeSinceLastUpdate').text()).toBe('just now')
            })
            it('shows a pretty date which is updated every minute since the last update time', function() {
                spinCounters({"today": 134234980980}, modifyCurrentTimeInMinutes(-1));
                expect($('#timeSinceLastUpdate').text()).toBe('a minute ago')
            })
        })
    });

    function spinCounters(json, time) {toMessageBus(fakeJSON(json, time));}
    function fakeJSON(obj, time) {return {'type':'message','data':JSON.stringify({'puoti':obj,'time': formattedDate(time || new Date())})};} //2013-01-24T09:49:18Z

    function connectionError() {toMessageBus({'type': 'error'});}
    function openConnection() {toMessageBus({'type': 'open'});}
    function closeConnection() {toMessageBus({'type': 'close'});}

    function toMessageBus(msg) {app.connection.bus.push(msg)}

    function assertConnectionIndication(text) {
        expect($('#connection').html()).toBe(text);
    }

    function formattedDate(date) {
        return date.getFullYear()
                + '-' + pad( date.getMonth() + 1 )
                + '-' + pad( date.getDate() )
                + 'T' + pad( date.getHours() )
                + ':' + pad( date.getMinutes() )
                + ':' + pad( date.getSeconds() )
                + 'Z';
    }

    function pad(number) {
        var r = String(number);
        return (r.length === 1) ? r = '0' + r : r;
    }

    function modifyCurrentTimeInMinutes(minutes) {
        var date = new Date();
        return new Date(date.getTime() + minutes * 60000);
    }

    function waitForCountersToSpin(f) {
        waits(1000)
        runs(f)
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