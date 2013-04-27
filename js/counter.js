define(function(require) {
    var $ = require('jquery');
    var _ = require('_');
    var settings = require('settings');
    var counterTemplate = require('tpl!counter.html');
    var spinnerTemplate = require('tpl!spinner.html');
    var targetTemplate = require('tpl!target.html');

    return function(message) {
        var id = _.keys(message)
        var value = _.values(message)
        var setup = _.find(settings.counters, function(settingsCounter) {return settingsCounter.id == id})

        function create() {
            $('#counters').append(setup.target ? $(counterTemplate(setup)).append(targetTemplate(setup)).wrap('<div></div>').parent().html() : counterTemplate(setup));
        }

        function updateSpinners() {
            return byId().find('.counter').html(createSpinners(updatedNumberOfSpinners()));
        }
        function createSpinners(digits) {return _.range(digits).map(function(element, index) {
            return spinnerTemplate({currentDigit: byId().find('.spinner').eq(index).attr('class') || 'spinner roll-to-0'})}).join('');
        }
        function updatedNumberOfSpinners() {
            var newCount = digitsToSpin().length;
            var defaultCount = setup.digits;
            return newCount > defaultCount ? newCount : defaultCount;
        }

        function spin() {
            var spinners = byId().find('.spinner');
            var currentDigits = digitsToSpin();
            var updatedDigits = _.flatten([zeros(spinners.length - currentDigits.length), currentDigits]).reverse();
            var updatedClasses = updatedDigits.map(function(digit) {return 'spinner roll-to-' + digit });
            _.each(updatedClasses, function(updatedClass, index) {return spinners.eq(index).attr('class', updatedClass)})
        }

        function showTargetValue() {
            byId().find('.target').addClass('show').find('.value').text(targetPercent().toFixed(1) + '%').toggleClass('reached', reachedTarget());
        }
        function targetPercent() {return (value / setup.target.value) * 100;}
        function reachedTarget() {return targetPercent() >= 100 }
        function hasTarget() {return typeof setup.target != 'undefined'}

        function byId() {return $('#' + id);}
        function digitsToSpin() {return value.toString().split('');}
        function zeros(count) {return _.range(count).map(function() {return '0'})}
        function newCounter() {return byId().length == 0;}

        return {
            updateSpinners: updateSpinners,
            spin: spin,
            showTargetValue: showTargetValue,
            hasTarget: hasTarget,
            reachedTarget: reachedTarget,
            newCounter: newCounter,
            create: create
        }
    }
})