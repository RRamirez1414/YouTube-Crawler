// Clear and show an overlay
removeOverlay();
chrome.runtime.sendMessage("deleteVtab");
displayOverlay("<h3 align='center'>Crawling your channel analytics</h3>");

var table_list				= [];
var colsList				= [];
var updateColsList			= [];
var newTitles				= [];
var readyStateChkInterval 	= setInterval(chkDocReady	, 3000);
var tableHeadersInt			= 0;
var	tableContentsInt		= 0;
var numberOfCols			= 0;
//=========================================================
function chkDocReady(){
	if (document.readyState === "complete") {
		clearInterval(readyStateChkInterval);
		tableHeadersInt	= setInterval(getVideoTabHeaders,	3000);
	}
}

//=========================================================
function getVideoTabHeaders(){
	var mainColTitle		=	document.querySelector("#table-header-text");
	var	otherColTitles		= 	document.querySelectorAll("#header-title");
	var mainColTitleFlag	=	false;
	var otherColTilesFlag 	= 	false;
	colsList				=	[];
	if(mainColTitle	!== undefined && mainColTitle !== null)
	{
		mainColTitle 		= (mainColTitle.textContent).trim();
		colsList.push(mainColTitle);
		mainColTitleFlag	= 	true;
		console.log(mainColTitle);
	}
	if(otherColTitles !== undefined)
	{
		numberOfCols = otherColTitles.length + 1;
		otherColTitles.forEach(function(item){
			colsList.push((item.textContent).trim());
			console.log((item.textContent).trim());
		});
		otherColTilesFlag	=	true;
	}
	if(mainColTitleFlag === true && otherColTilesFlag === true)
	{
		clearInterval(tableHeadersInt);
		tableContentsInt	=	setInterval(getVideTabBody,	1000);
	}
}
//=========================================================
function getVideTabBody(){
	var firstCol		=	document.querySelectorAll("#entity-title-value");
	var firstColFlag	=	false;
	var otherColsFlag	=	false;
	var firstColVals	=	[];
	var otherColVals	=	[];
	var otherColsVals	=	[];
	
	if(firstCol !== undefined)
	{
		firstCol.forEach(function(item){
			firstColVals.push((item.textContent).trim());
			console.log((item.textContent).trim());
		});
		firstColFlag	=	true;
	}
	updateColsList.push(colsList[0]);
	otherColsVals.push(firstColVals);
	for(var i = 0; i < numberOfCols - 1; i++){
		var colIndex	=	3 + i;
		var otherCol_v1	=	document.querySelectorAll("#row-container > div:nth-child(" + colIndex + ") > div.layout.horizontal.end-justified.style-scope.yta-explore-table-row > div");
		var otherCol_v2	=	document.querySelectorAll("#row-container > div:nth-child(" + colIndex + ") > div.layout.horizontal.end-justified.style-scope.yta-explore-table-row > div.value.debug-metric-value.style-scope.yta-explore-table-row");
		var otherColPerc= 	document.querySelectorAll("#row-container > div:nth-child(" + colIndex + ") > div.layout.horizontal.end-justified.style-scope.yta-explore-table-row > div.formatted-percentage.style-scope.yta-explore-table-row");
		console.log(otherCol_v2.length + "----------------->");
		if(otherCol_v2 !== undefined && otherCol_v2 !== null && otherCol_v2.length > 0 && otherColPerc !== undefined && otherColPerc !== null && otherColPerc.length > 0)
		{
			otherCol_v2.forEach(function(item){
				otherColVals.push((item.textContent).trim());
				console.log((item.textContent).trim());
			});
			otherColsVals.push(otherColVals);
			
			otherColVals 	= 	[];
			updateColsList.push(colsList[i+1]);
			updateColsList.push(colsList[i+1]+'_Percent');
			otherColPerc.forEach(function(item){
				otherColVals.push((item.textContent).trim());
				console.log((item.textContent).trim());
			});
			otherColsVals.push(otherColVals);
			otherColVals 	= 	[];
			otherColsFlag	=	true;
		}
		else{
			if(otherCol_v1 !== null && otherCol_v1 !== undefined)
			{
				updateColsList.push(colsList[i+1]);
				otherCol_v1.forEach(function(item){
				otherColVals.push((item.textContent).trim());
				console.log((item.textContent).trim());
				});
				otherColsVals.push(otherColVals);
				otherColVals 	= 	[];
			}
			otherColsFlag	=	true;
		}
		otherCol_v1 = [];otherCol_v2 = [];otherColPerc = [];
	}
	if(firstColFlag === true && otherColsFlag === true)
	{
		console.log(otherColsVals);
		console.log(updateColsList);
		table_list.push({"header": updateColsList});
		table_list.push({"body"  : otherColsVals});
		console.log(table_list);
		clearInterval(tableContentsInt);
		
		// Extract Channel ID then paass it to inject_analytics_explore
		var urlOFpopup	= window.location.pathname;
		var chIdx 		= urlOFpopup.indexOf('/channel/');
		var match      	= urlOFpopup.match(/channel\//);
		var lastIndex  	= urlOFpopup.lastIndexOf(match[match.length-1]);
		var chID   		= urlOFpopup.substring(lastIndex + 8);
		chID			= chID.substring(0, chID.indexOf('/'));
		saveChExpAnalytics("lifetime", "genderAna", chID, table_list);
		//setTimeout(function(){chrome.runtime.sendMessage({msg: "channelCrawled", channelID: chID});}, 3000);
		setTimeout(function(){chrome.runtime.sendMessage("channelCrawled");}, 3000);
	}
}
console.log("in Explore");