define(function (require) {
    require('jasmine');
    require('jasmine.html');
    require('jasmine.jquery');
    var Sound = require('sound');

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
});