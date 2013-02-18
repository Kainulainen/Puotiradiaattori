define(function (require) {
    var puotiradiaattori = require('puotiradiaattori')
    var app = puotiradiaattori.init();
    var settings = require('settings');
    var storage = require('storage');
    var today = settings.counters[0];
    var week = settings.counters[1];
    var $ = require('jquery');
    var _ = require('underscore');
    describe('Puotiradiaattori', function () {
        beforeEach(function () {
            puotiradiaattori.init();
            spinCounters({"today": 345, 'week': 456});
        });
        describe('creating counters', function () {
            it('creates spinner with 10 digits', function () {
                expect(counter(today.id).digitsInSpinner()).toEqual(10);
            });
        });
        describe('counter settings configuration', function () {
            it('labels counter', function () {
                expect(counter(today.id).find('h1').text()).toBe(today.label);
            });
            it('sets counter digit count', function () {
                expect(counter(today.id).find('.spinner').length).toEqual(today.digits);
            });
            it('sets unit', function() {
                expect(counter(today.id).find('.unit').text()).toEqual(today.unit);
            });
            it('sets target label', function() {
                expect(counter(today.id).find('.target .label').text()).toBe(today.target.label);
            });
        });
        describe('updating counter when new data is received', function () {
            it('increases counters', function () {
                spinCounters({"today": 234980980});
                waitForCountersToSpin(function() {
                    expect(counter(today.id).counterDigits()).toBe('0234980980');
                })
            });
            it('decreases counter', function () {
                spinCounters({"today": 34});
                waitForCountersToSpin(function() {
                    expect(counter(today.id).counterDigits()).toBe('0000000034');
                })
            });
            it('adds spinners when there are not enough digits', function () {
                spinCounters({"today": 34234980980});
                waitForCountersToSpin(function() {
                    expect(counter(today.id).counterDigits()).toBe('34234980980');
                });
            });
            it('removes spinners when there has been previously been more digits that the set default', function () {
                spinCounters({"today": 12334234980980});
                spinCounters({"today": 4980980});
                waitForCountersToSpin(function() {
                    expect(counter(today.id).counterDigits()).toBe('0004980980');
                });
            });
        });
        describe('updating multiple counters at once', function () {
            it('sets today to 345', function () {
                waitForCountersToSpin(function() {
                    expect(counter(today.id).counterDigits()).toBe('0000000345');
                });

            });
            it('sets week to 456', function () {
                waitForCountersToSpin(function() {
                    expect(counter(week.id).counterDigits()).toBe('0000000456');
                });
            });
        });
        describe('target', function () {
            it('is optional', function() {
                runWithoutSetting(today, 'target', function() {
                    puotiradiaattori.init();
                    spinCounters({"today": 1});
                    expect(counter(today.id).find('.target').length).toEqual(0);
                })

            })
        });
        describe('target value', function () {
            describe('is over counter value', function() {
                beforeEach(function() {spinCounters({"today": 10000});});

                it('shows values over target', function() {
                    expect(counter(today.id).find('.target .value')).toHaveText('1000.0%');
                });
                it('changes css class', function() {
                    expect(counter(today.id).find('.target .value')).toHaveClass('reached');
                });
                it('plays sound', function() {
                    spyOn(app.sound, 'play');
                    spinCounters({"today": 134234980980});
                    expect(app.sound.play).toHaveBeenCalled();
                });
            });
            describe('is less than counter value', function() {
                beforeEach(function() {spinCounters({"today": 1});});

                it('shows values less than target', function() {
                    expect(counter(today.id).find('.target .value')).toHaveText('0.1%');
                });
                it('changes css class', function() {
                    expect(counter(today.id).find('.target .value')).not.toHaveClass('reached');
                });
            })
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
                assertLastUpdateIs('just now')
            })
            it('shows a pretty date which is updated every minute since the last update time', function() {
                spinCounters({"today": 134234980980}, modifyCurrentTimeInMinutes(-1));
                assertLastUpdateIs('a minute ago')
            })
        })
    });

    describe('saving spinner data to localstorage', function() {
        beforeEach(puotiradiaattori.init);

        it('returns nothing on first go', function() {
            storage.clear();
            expect(storage.fetch()).toBeFalsy();
        })
        it('saves last message recieved', function() {
            storage.clear();
            spinCounters({"today": 1, "week": 2}, new Date('2013-02-18T08:35:09Z'));
            expect(storage.fetch()).toEqual({puoti :{today:1, week:2},time:'2013-02-18T10:35:09Z'} ) // todo fix timezone offset
        })
        it('shows previously saved counter values', function() {
            waitForCountersToSpin(function() {
                expect(counter(today.id).counterDigits()).toBe('0000000001');
            })
        })
        it('shows previously saved time', function() {
            waitForCountersToSpin(function() {
                spinCounters({"today": 1, "week": 2}, modifyCurrentTimeInMinutes(-60));
                assertLastUpdateIs('1 hour ago');
            })
        })
    })

    function spinCounters(json, time) {toMessageBus(fakeJSON(json, time));}
    function fakeJSON(obj, time) {return {'type':'message','data':JSON.stringify({'puoti':obj,'time': formattedDate(time || new Date())})};} //2013-01-24T09:49:18Z

    function connectionError() {toMessageBus({'type': 'error'});}
    function openConnection() {toMessageBus({'type': 'open'});}
    function closeConnection() {toMessageBus({'type': 'close'});}

    function toMessageBus(msg) {app.connection.bus.push(msg)}

    function assertConnectionIndication(text) {
        expect($('#connection').html()).toBe(text);
    }
    function assertLastUpdateIs(expected) {expect($('#timeSinceLastUpdate').text()).toBe(expected)}

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

    function runWithoutSetting(counter, setting, func) {
        var savedSetting = counter[setting];
        delete counter[setting];
        func();
        counter[setting] = savedSetting;
    }

    function counter(counterId) {return $('#' + counterId);}

    $.fn.digitsInSpinner = function () {
        return $(this).find('.spinner:first .digit').length
    }

    $.fn.counterDigits = function () {
        return $.map($(this).find('.spinner'),function (element) {
            return $(element).attr('class').split('roll-to-')[1];
        }).reverse().join('');
    }

})