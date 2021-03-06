define(function(require) {
    var $ = require('jquery')
    var _ = require('_')
    var settings = require('settings')
    var tpl = require('tpl')
    var counterTemplate = require('tpl!counter.html')
    var spinnerTemplate = require('tpl!spinner.html')
    var targetTemplate = require('tpl!target.html')

    return function(message) {
        var id = _.keys(message)[0]
        var value = _.values(message)[0]
        var setup = _.find(settings.counters, {'id':id})

        function updateDigits() {
            if (_.isEmpty(counter())) create()
            updateSpinners()
            setTimeout(spin, 500)
        }

        function create() {
            $('#counters').append(setup.target ? $(counterTemplate(setup)).append(targetTemplate(setup)).wrap('<div></div>').parent().html() : counterTemplate(setup))
        }

        function updateSpinners() {
            counter().find('.counter').html(createSpinners(updatedNumberOfSpinners()))
        }
        function createSpinners(digits) {
            return _.range(digits).map(function(element, index) {
                return spinnerTemplate({currentDigit: counter().find('.spinner').eq(index).attr('class') || 'spinner roll-to-0'})
            }).join('')
        }
        function updatedNumberOfSpinners() {
            var newCount = digitsToSpin().length
            var defaultCount = setup.digits
            return newCount > defaultCount ? newCount : defaultCount
        }

        function spin() {
            var spinners = counter().find('.spinner')
            var currentDigits = digitsToSpin()
            var updatedDigits = _.flatten([zeros(spinners.length - currentDigits.length), currentDigits])
            var updatedClasses = updatedDigits.map(function(digit) {return 'spinner roll-to-' + digit })
            _.each(updatedClasses, function(updatedClass, index) {return spinners.eq(index).attr('class', updatedClass)})
        }

        function showTargetValue() {
            counter().find('.target').addClass('show').find('.value').text(targetPercent().toFixed(1) + '%').toggleClass('reached', reachedTarget())
        }
        function targetPercent() {return (value / setup.target.value) * 100}
        function reachedTarget() {return targetPercent() >= 100}
        function hasTarget() {return !_.isUndefined(setup.target)}

        function counter() {return $('#' + id)}
        function digitsToSpin() {return value.toString().split('').map(Number)}
        function zeros(count) {return _.range(0, count, 0);}

        return {
            updateDigits:updateDigits,
            showTargetValue: showTargetValue,
            hasTarget: hasTarget,
            reachedTarget: reachedTarget
        }
    }
})