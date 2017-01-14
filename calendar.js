var google = require('googleapis');
var calendar = google.calendar('v3');
var promise = require('promise');

module.exports.createEvent = function(auth, event, calendarId)
{
    return new Promise(function(fulfill, reject){
        calendar.events.insert({
            auth: auth,
            calendarId: calendarId,
            resource: event,
        }, function (err, event) {
            if (err) {
                console.log('There was an error creating the event: ' + err);
                reject(err);
            }
            else{
                fulfill(event);
            }
        });
    })
}