var API_KEY = 'AIzaSyC_HhJ3YZStGj8e3YJtB9hvFthZ4K4wemE';
var API_URL = 'https://youtubereporting.googleapis.com/v1/jobs?key='+API_KEY;


/*
* JSON Structure
* jobsArrObject = {
*   JobName:
*   JobID:
*   reportType:    
* }
*/
var jobsArr = [];

/*
* reports object = {
*   repID:
*   jobID:
*   startTime:
*   endTime:
*   createTime:
*   downloadURL:
* }
*/
var todaysReports = []; 

/* JSON object containing meta data to post to server
* report metadata report name, start time, end time
* access token
* download URL
*/
var metaRep = {
    "reportName" : null,
    "accessToken" : null,
    "downloadURL" : null
}

function callback() {
    if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
    } else {
        // Tab exists
    }
}

/* Authenticate first and start creating jobs */
chrome.runtime.onMessage.addListener(function(response, sender, sendResponse){
    if(isNaN(response)) {

        if (response == "Authenticate"){ 
            chrome.identity.getAuthToken({'interactive':true}, function (authToken){
                
                $.ajax({
                    /* Channel Basic */
                    type: 'POST',
                    url:  API_URL,
                    headers: {authorization: "Bearer " + authToken},
                    contentType: 'application/json',
                    data: JSON.stringify({ 
                        name: 'Channel Basic',
                        reportTypeId: 'channel_basic_a2'
                    }),
                    success: function(data){
                        //var responseData = JSON.parse(data);
                        var responseData = JSON.stringify(data);
                        console.log("Success" + responseData);
                    },
                    error: function(response) {
                        console.log("Request Failed");
                        console.log(response.message);
                    }
                });
            
                /* Content Owner Demographics 
                * 
                *  INSUFFICIENT PERMISSIONS, need G suite service account?
                * 
                *  From Reporting API documentation: Forbidden (403) The request attempted 
                *  to create a job for a system-managed report. 
                *  YouTube will automatically generate system-managed reports, 
                *  and content owners will not be able to modify or delete jobs that 
                *  create those reports
                * 
                */
                // $.ajax({
                //     type: 'POST',
                //     url: API_URL,  
                //     headers: {authorization: "Bearer " + authToken},
                //     contentType: 'application/json',
                //     data: JSON.stringify({ 
                //         name: 'Content Owner Demographics',
                //         reportTypeId: 'content_owner_demographics_a1'
                //     }),
                //     success: function(data){
                //         //var responseData = JSON.parse(data);
                //         var responseData = JSON.stringify(data);
                //         console.log("Success" + responseData);
                //     },
                //     error: function(response) {
                //         console.log("Request Failed");
                //         console.log(response.message);
                //     }
                // });
            
                /* Channel Province */
                $.ajax({
                    type: 'POST',
                    url:  API_URL,
                    headers: {authorization: "Bearer " + authToken},
                    contentType: 'application/json',
                    data: JSON.stringify({ 
                        name: 'Channel Province',
                        reportTypeId: 'channel_province_a2'
                    }),
                    success: function(data){
                        //var responseData = JSON.parse(data);
                        var responseData = JSON.stringify(data);
                        console.log("Success" + responseData);
                    },
                    error: function(response) {
                        console.log("Request Failed");
                        console.log(response.message);
                    }
                });
            
                /* Channel Traffic Source */
                $.ajax({
                    type: 'POST',
                    url:  API_URL,
                    headers: {authorization: "Bearer " + authToken},
                    contentType: 'application/json',
                    data: JSON.stringify({ 
                        name: 'Channel Traffic Source',
                        reportTypeId: 'channel_traffic_source_a2'
                    }),
                    success: function(data){
                        //var responseData = JSON.parse(data);
                        var responseData = JSON.stringify(data);
                        console.log("Success" + responseData);
                    },
                    error: function(response) {
                        console.log("Request Failed");
                        console.log(response.message);
                    }
                });
            
                /* Content Onwer Estimated Revenue
                * 
                *  INSUFFICIENT PERMISSIONS, need G suite service account?
                */
                // $.ajax({
                //     type: 'POST',
                //     url:  API_URL,
                //     headers: {authorization: "Bearer " + authToken},
                //     contentType: 'application/json',
                //     data: JSON.stringify({ 
                //         name: 'Content Owner Estimated Revenue',
                //         reportTypeId: 'content_owner_estimated_revenue_a1'
                //     }),
                //     success: function(data){
                //         //var responseData = JSON.parse(data);
                //         var responseData = JSON.stringify(data);
                //         console.log("Success" + responseData);
                //     },
                //     error: function(response) {
                //         console.log("Request Failed");
                //         console.log(response.message);
                //     }
                // });


                /* Get list of jobs just created and push it into the array */
                $.ajax({
                    type: 'GET',
                    url: API_URL+'&includeSystemManaged=true',
                    headers: {authorization: "Bearer " + authToken },

                    success: function(data){
                        console.log("Success" + data);
                        for(job of data.jobs){
                            jobsArr.push({
                                "JobName": job.name, 
                                "JobID": job.id,
                                "reportType": job.reportTypeId 
                            });
                        }
                        console.log(jobsArr);
                    },
                    error: function(response) {
                        console.log("Request Failed");
                        console.log(response.message);
                    }
                });
                
                chrome.runtime.sendMessage("verifiedAccount");

                /** at this point set a chrome alarm to retrieve first jobs **/
                /** Jobs Take 48 hours to create, upon creation, a job's report is created daily */

                //this alarm will set off 2 days after the jobs are created and repeat daily 
                //chrome.alarms.create("JobCreated_48Hours_daily", {delayInMinutes: 2880.0, periodInMinutes: 1440.0});

                /* for testing purposes */
                chrome.alarms.create("JobCreated_48Hours_daily", {delayInMinutes: 0.2, periodInMinutes: 0.2});
            });
        }             
    }
}); 


/** listen for the chrome alarms here **/
chrome.alarms.onAlarm.addListener(function (alarm){
    
    var jobID = '';
    var reportID = '';
    var reportName = '';
    var zDate;
    var reportURL = 'https://youtubereporting.googleapis.com/v1/jobs/'+ jobID +'/reports/?createdAfter=' + zDate + '&key=' + API_KEY;

    if(alarm.name == "JobCreated_48Hours_daily") {
        console.log("Got an alarm ", alarm.name);
    
        zDate = new Date();
        zDate = zuluDate(getYesterday(zDate));
        console.log(zDate);


        chrome.identity.getAuthToken({'interactive': false}, function(authToken){
        
            /* Calls a list of the most recent report for all jobs in the jobs array */
            //for(jobs of jobsArr){
            for(var i = 0; i < jobsArr.length; i++){
                var obj = jobsArr[i];
                jobID = obj.JobID;
                reportName = obj.reportType;
                console.log(obj.reportType);

                $.ajax({
                    /*
                    * Calls a get request on for a report based on sepecific jobID
                    * returns a download URL
                    */
                    type: 'GET',
                    url:  'https://youtubereporting.googleapis.com/v1/jobs/'+ jobID +'/reports/?createdAfter=' + zDate + '&key=' + API_KEY,
                    headers: {authorization: "Bearer " + authToken},
                    contentType: 'application/json',
    
                    success: function(data){
                        console.log("Success " + data);
                        console.log("MAKING AJAX CALL iteration: " + i);
                        
                        rep = data.reports[0];

                        todaysReports.push({
                            "repType": reportName,
                            "repID": rep.id,
                            "jobID": rep.jobId,
                            "startTime": rep.startTime,
                            "endTime": rep.endTime,
                            "createTime": rep.createTime,
                            "downloadURL": rep.downloadUrl
                        });
                    },
                    error: function(response) {
                        console.log("Request Failed ");
                        console.log(response.message);
                    }
                }); 
            }//end for

            //push report type to today's reports
            console.log("Entering for loop today's report");
            for(var i = 0; i < todaysReports; i++){
                var obj=todaysReports[i];
                console.log("today's report" + obj[i]);
                var rtype = getReportName(obj.jobID);
                obj.repType = rtype;
            }
            
            
        });

        //TO DO: post today's reports array database
        //clear todaysReports array to get it ready for the next day
    }

    console.log(todaysReports); 
});



//on suspend test
chrome.runtime.onSuspend.addListener(function() {
    chrome.browserAction.setBadge({text: 'Suspended'});
    console.log("Suspended...");
});


function clearAlarm(alarmName){
    chrome.alarms.clear(alarmName, function() {
        console.log("clearing alarm " + alarmName);
    });
}

function clearAllAlarms(){
    chrome.alarms.clearAll(function(){
        console.log("clearing all alarms...");
    });
}

function zuluDate(date){
    function pad(n){ return n<10 ? '0'+n : n }
    return pad(date.getUTCFullYear()) + '-' 
        + pad(date.getUTCMonth()+1) + '-'
        + pad(date.getUTCDate()) + 'T'
        + pad(date.getUTCHours()) + '%3A' //%3A is the ':' char for url headers
        + pad(date.getUTCMinutes()) + '%3A'
        + pad(date.getUTCSeconds()) + 'Z'
}

function getYesterday(date){
    var today = new Date();
    var yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return yesterday;
}

function getReportName(jobid){
    for(var i = 0; i < jobsArr.length; i++){
        var obj = jobsArr[i];
        if(obj.JobID == jobid){
            return obj.reportType;
        }
    }
    return "error";
}


