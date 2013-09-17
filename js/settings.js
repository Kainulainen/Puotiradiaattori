define({
    'serverUrl': 'ws://127.0.0.1:1337',
    'sound': true,
    'counters': [
        {'label': 'tänään', 'id': 'today', digits: 10, unit: '€', target: {label: 'tavoitteesta', value: 1000}},
        {'label': 'viikko', 'id': 'week', digits: 10, unit: '€', target: {label: 'tavoitteesta', value: 1000}},
        {'label': 'kuukausi', 'id': 'month', digits: 10, unit: '€'},
        {'label': 'vuosi', 'id': 'year', digits: 10, unit: '€'},
        {'label': 'kaikki', 'id': 'total', digits: 10, unit: '€'}
    ]
});