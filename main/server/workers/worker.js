import request from 'request';

let timer = 0;

module.exports = (data, cb) => {
    timer = setInterval(function() {
        request.get('http://localhost:8001/api/getState', (err, response) => {
            if (err) {
                console.log(err);
            } else {
                let { status } = JSON.parse(response.body);
                console.log('ping status:', status);
                if (data.currentState !== status) {
                    clearInterval(timer);
                    cb(null, status);
                }
            }
        });
    }, 5000);
}
