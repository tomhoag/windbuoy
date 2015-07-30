            
exports.handler = function(event, context) {

var request = require('request');

  	var bid = (event.bid === undefined ? 'CLSM4' : event.bid).toUpperCase();
	
	console.log("fetching for " + bid);
	var url = "http://www.ndbc.noaa.gov/data/realtime2/"+bid+".txt";
	
	var json = '{"buoy id":"' +bid+ '",';
	json = json.concat('"fetch timestamp":' + Date.now() + ', ');
	json = json.concat('"url":"' +url+ '", ');
		
	request({
		method : "GET",
		url : url
	}, function (error, response, body) {
  		if(error ||  response.statusCode !== 200) {
   		 	// handle error
			console.log(response.statusCode);
			json = json.concat('"response code":' + response.statusCode + ', ');
			json = json.concat('"data": []}');
			console.log(json);
			json = JSON.parse(json);
			context.done(null,json);
  		} else {
		
			// The first two lines are the measurment type and units
			// reports start on line 3
			var lines = body.split("\n").slice(0,3); // get the first N lines
			
			// remove the leading # from lines 0 & 1, create arrays of each line element
			var measurements = lines[0].replace("#","").split(/[ ]+/);
			var units = lines[1].replace("#","").split(/[ ]+/);
			var values = lines[2].split(/[ ]+/);

			json = json.concat('"response code":' + response.statusCode+ ', ');
			
			var reportDate = values[0]+'-'+values[1]+'-'+values[2]+' '+values[3]+':'+values[4];
			json = json.concat('"report date":"' +reportDate+ '", ');
			json = json.concat('"data": [');
			for(i=0; i<measurements.length; i++) {
				json = json.concat('{ "measurement":"' + measurements[i] + '",');
				json = json.concat('"unit":"' + units[i] + '",');
				json = json.concat('"value":"' + values[i] + '" } ,');
			}
		
			json = json.slice(0,-1); // slice off the last comma 
			json = json.concat("]}"); // close the data and json
			json = JSON.parse(json); // parse to remove the escaped "
		
			context.succeed(json);
		}
	});
};
