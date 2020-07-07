self.addEventListener('message', function (e) {

    self.importScripts('js/turf.min.js')
    //self.postMessage(e.data.chunks.length);

    const states = e.data.chunks;
    const pins = e.data.pins;

    states.forEach(state => {
        state.properties.closed = 0;
        state.properties.storeNumber = 0;
        pins.features.forEach(pin => {
            //define if a pin is inside a polygon
            if (turf.booleanPointInPolygon(pin, state)) {
                state.properties.storeNumber++
                if (pin.properties.closed === 1) {
                    state.properties.closed++;
                }
            }
        })
        state.properties.color = 'white'
        if (state.properties.closed >= 10) {
            state.properties.color = 'red'
        }
        if (state.properties.storeNumber > 0 && state.properties.closed < 10) {
            state.properties.color = 'green'
        }
    });
    self.postMessage(states)

}, false);