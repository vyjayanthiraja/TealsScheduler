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

module.exports.listEvents = function(auth, calendarId, timeMax, timeMin)
{
    return new Promise(function(fulfill, reject){
        calendar.events.list({
            auth: auth,
            calendarId: calendarId,
            timeMax: timeMax.toISOString(),
            timeMin: timeMin.toISOString()
        }, function(err, events)
        {
            if(err) {
                console.log('There was an error listing the events: ' + err);
                reject(err);
            }
            else {
                fulfill(events);
            }
        });
    });
}

module.exports.deleteEvent = function(auth, calendarId, eventId)
{
    return new Promise(function(fulfill, reject){
        calendar.events.delete({
            auth: auth,
            calendarId: calendarId,
            eventId: eventId
        }, function(err)
        {
            if(err)
            {
                console.log('There was an error deleting the event: ' + err);
                reject(err);
            }
            else {
                fulfill();
            }
        })
    })
}