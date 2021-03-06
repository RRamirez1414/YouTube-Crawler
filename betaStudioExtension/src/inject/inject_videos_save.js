/* 
	This function send differnt POST requests the db_portal server to save the crawled videos.
	The server is located at NMSU.
*/
//========================================================================
let totalNoVideos = 0;
function saveMetaData(chID, vTitles, vURLS, vDates, vViss, vDescs, vViews, vNoComms) {
	var vCount = vTitles.length;
	var httpReq = new Array(vCount);
	for(var i = 0; i < vCount; ++i)
	{		
		var vVis		    = vViss[i];
		if (!(vVis.indexOf('Public') > -1))
		{
			continue;			
		}
		totalNoVideos += 1;
		var vTitle 		    = vTitles[i];
		var vURL   		    = vURLS[i];
		var vID				= vURL.substring(vURL.indexOf("=") + 1);
		chrome.storage.sync.get(
			{list:[]},
			function(data) {
				console.log(data.list);
				if(data.list.length > 0){
					update(data.list, vID);
				}
				else{
					var vList=[vID];
					chrome.storage.sync.set(
						{list:vList},
						function(){console.log("Video ID added to vlist");}
					);
				}
			}
		);
		var vDateStatus     = vDates[i].split("\n");
		var vDate           = vDateStatus[0];
		var vStatus         = vDateStatus[1];
		var vDesc           = vDescs[i];
		var vView           = vViews[i];
		var vNoComm         = vNoComms[i];
		var todayDate		= Date.now();
		httpReq[i] = new XMLHttpRequest();
		httpReq[i].onreadystatechange = function() {
			if (typeof httpReq[i] !== 'undefined')
			{		
				console.log(httpReq[i].responseText);
				if (httpReq[i].readyState === XMLHttpRequest.DONE) {
					if (httpReq[i].status == 201) {
						console.log('successful');
					} 
					else {
						console.log("ERROR: status " + httpReq[i].status);
					}
				}
			}	
		}; 
		// Check if the server is not reachable
		httpReq[i].onerror = function(){
			chrome.runtime.sendMessage("NetworkError");
		};
		httpReq[i].timedout = 3000;
		httpReq[i].ontimeout = function(e){
			console.log("XMLHttpRequest is timedout");
			chrome.runtime.sendMessage("NetworkError");
		};
		httpReq[i].open('POST', 'https://plexweb.cs.nmsu.edu/VideosSaveRoute', true);
		httpReq[i].setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		httpReq[i].send('chID='     + encodeURIComponent(chID)    +
						'&todayDate='  + encodeURIComponent(todayDate)  +
						'&vTitle='  + encodeURIComponent(vTitle)  +
						'&vURL='    + encodeURIComponent(vURL)    +
						'&vID='     + encodeURIComponent(vID)     +
						'&vDate='   + encodeURIComponent(vDate)   +
						'&vStatus=' + encodeURIComponent(vStatus) +
						'&vVis='    + encodeURIComponent(vVis)    +
						'&vDesc='   + encodeURIComponent(vDesc)   +
						'&vView='   + encodeURIComponent(vView)   +
						'&vNoComm=' + encodeURIComponent(vNoComm));	
	}
}
//========================================================================
// Function to update videoIDs in chrome storage
function update(vList, vID)
{
	if(!vList.includes(vID))
	{
		vList.push(vID);
		chrome.storage.sync.set(
			{list : vList}, 
			function(){console.log("Video ID is added to videos list");});
	}
	else
		console.log("A trail to save duplicate video IDs");
}