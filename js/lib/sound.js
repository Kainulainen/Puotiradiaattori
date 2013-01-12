define(function() {
    return function(soundIsOn) {
        var on = soundIsOn;
        var audio = new Audio();
        audio.src = "audio/Cash_register.ogg";
        return {
            isOn: function()  {return on;},
            toggle: function () {on = !on;},
            play: function () {if (on) audio.play();}
        }
    }
})