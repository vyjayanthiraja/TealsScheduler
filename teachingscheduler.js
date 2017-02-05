var fs = require('fs');
var auth = require('./auth');
var calendar = require('./calendar.js');
var moment = require('moment');
var promise = require('promise');
var _ = require('underscore');

if (process.argv.length < 4) {
    console.log("Usage : node teachingscheduler.js [schedule|delete] [config file name] (optional)[whatif]");
    process.exit(1);
}

var command = process.argv[2];
var configFile = process.argv[3];
var whatif = process.argv[4] === "whatif";

try {
    var fileContent = fs.readFileSync(configFile);
    var config = JSON.parse(fileContent);
    if (command === "schedule") {
        auth.authorizeClient(function (auth) {
            ScheduleEvents(auth, config, whatif);
        });
    }
    else if (command === "delete") {
        auth.authorizeClient(function (auth) {
            DeleteEvents(auth, config, whatif);
        });
    }
}
catch (e) {
    console.error("Error in reading config file " + e);
}

function DeleteEvents(auth, config, whatif) {
    var daysToDelete = _.map(config['daysToDelete'], ConvertDayString);
    var startDate = moment(config['startDate'],'YYYY-MM-DD');
    var endDate = moment(config['endDate'], 'YYYY-MM-DD');
    var calendarId = config['calendar'];
    var timeMin = new Date(startDate.year(), startDate.month(), startDate.date(), 1, 0, 0);
    var timeMax = new Date(endDate.year(), endDate.month(), endDate.date(), 1, 0, 0);
    calendar.listEvents(auth, calendarId, timeMax, timeMin).then(function (res){
        var deleteTasks = [];
        for(var i = 0; i<res.items.length;i++)
        {
            var date = new Date(res.items[i]['start']['dateTime']);
            var day = date.getDay();
            if(daysToDelete.indexOf(day) > -1)
            {
                if(whatif)
                {
                    console.log("Deleting event " + JSON.stringify(res.items[i]));
                }
                else
                {
                    deleteTasks.push(calendar.deleteEvent(auth, calendarId, res.items[i].id));
                }
            }
        }

        promise.all(deleteTasks).done(function(results){
            console.log("Finished deleting all events");
        }, function(err){
            console.log("Error occurred when deleting events" + err);
        })
    });
}

function ScheduleEvents(auth, config, whatif) {
    var daysToSkip = _.map(config['daysToSkip'], ConvertDayString);
    var datesToSkipConfig = config['datesToSkip'];
    var datesToSkip = [];
    for (var i = 0; i< datesToSkipConfig.length ; i++)
    {
        datesToSkip.push(moment(datesToSkipConfig[i], 'YYYY-MM-DD'));
    }
    var teachingTeams = config['teachingTeams'];
    var startDate = moment(config['startDate'],'YYYY-MM-DD');
    var endDate = moment(config['endDate'], 'YYYY-MM-DD');
    var startTimeString = config['startTime'];
    var endTimeString = config['endTime'];
    var startTimeSegs = startTimeString.split(':');
    var endTimeSegs = endTimeString.split(':');
    var calendarId = config['calendar'];
    var currDate = startDate;
    var createdTasks = [];
    var currTeam = 0;

    while (currDate <= endDate) {
        var day = currDate.day();
        var skipDate = false;
        for(var i = 0 ; i < datesToSkip.length; i++)
        {
            skipDate = skipDate | currDate.isSame(datesToSkip[i])
        }

        if ((daysToSkip.indexOf(day) == -1) && !skipDate) {
            var startTime = new Date(
                currDate.year(), 
                currDate.month(),
                currDate.date(), 
                parseInt(startTimeSegs[0]), 
                parseInt(startTimeSegs[1]), 
                parseInt(startTimeSegs[2]));
            var endTime = new Date(
                currDate.year(), 
                currDate.month(),
                currDate.date(), 
                parseInt(endTimeSegs[0]), 
                parseInt(endTimeSegs[1]), 
                parseInt(endTimeSegs[2]));
            var event = CreateEvent(currDate, startTime, endTime, teachingTeams[currTeam++]);    
            if(whatif)
            {
                console.log("Creating event " + JSON.stringify(event));
            }
            else
            {
                createdTasks.push(calendar.createEvent(auth, event, calendarId));
            }

            if(currTeam == teachingTeams.length)
            {
                currTeam = 0;
            }
        }

        currDate = currDate.clone().add(1, 'day');
    }

    promise.all(createdTasks).done(function(results){
        console.log("Finished creating all events");
    }, function(err){
        console.log("Error occurred when creating events" + err);
    })
}

function CreateEvent(date, startTime, endTime, team) {
    var event = {
        'summary': 'Intro to CS class',
        'location': 'Skype meeting',
        'start': {
            'dateTime': startTime,
            'timeZone': 'America/Los_Angeles',
        },
        'end': {
            'dateTime': endTime,
            'timeZone': 'America/Los_Angeles',
        },
        'reminders': {
            'useDefault': false,
            'overrides': [
                { 'method': 'email', 'minutes': 12 * 60 }
            ],
        }
    }

    event['attendees'] = [];
    for(var i = 0; i< team.length; i++)
    {
        event['attendees'].push(team[i]);
    }

    return event;
}

function ConvertDayString(dayString) {
    if (dayString === "Sunday") {
        return 0;
    }
    else if (dayString === "Monday") {
        return 1;
    }
    else if (dayString === "Tuesday") {
        return 2;
    }
    else if (dayString === "Wednesday") {
        return 3;
    }
    else if (dayString === "Thursday") {
        return 4;
    }
    else if (dayString === "Friday") {
        return 5;
    }
    else if (dayString === "Saturday") {
        return 6;
    }
}