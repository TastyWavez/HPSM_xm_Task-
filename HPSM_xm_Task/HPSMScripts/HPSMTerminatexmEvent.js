var JSON = lib.JSON.json();
var REST = lib.smis_RestClient;
var RESTUtil = lib.smis_CommonLib;

var sURLAddRest = "<Incident Task form URL-Basic Auth>"; // end point URL from XOD integration builder
var sURLBaseRest = "<xMatters base url e.g. yourinstance.xmatters.com>";
var sEventPath = "/api/xm/1/events";
var sUser = < user assigned REST role in xMatters > ;
var sPass = < password > ;
//var bDebug = false;

function addEvent(record) {
    var newJSON = {};

    // set up the payload
    newJSON.properties = {};
    newJSON.properties.Status = record.status;
    newJSON.properties.Acknowledge = record.ce_acknowledge_status;
    newJSON.properties.Category = record.category;
    newJSON.properties.Open = record.open;
    newJSON.properties.Urgency = record.severity;
    newJSON.properties.Impact = record.initial_impact;
    newJSON.properties.Priority = record.priority_code;
    newJSON.properties.Title = record.brief_description;
    newJSON.properties.Due_Date = record.due_date;
    newJSON.properties.ParentIncident = record.parent_incident;
    newJSON.properties.Description = record.description;
    newJSON.properties.Task_ID = record.id;
    newJSON.properties.Affected_CI = record.logical_name;
    newJSON.recipients = [{
        "targetName": record.assignment
    }];


    //send it
    if (bDebug) print("newJSON=" + JSON.stringify(newJSON));
    var sURLRest = sURLAddRest; //use the XOD defined AddGroup endpoint
    var retResponse = postJSON(newJSON, sURLRest, sUser, sPass);
    if (bDebug) print("retResponse.requestId:" + retResponse.requestId);

}


function terminateEvent(record) {

    var relatedEventsPath = sEventPath + "?status=ACTIVE&propertyName=Task_ID%23en&propertyValue=" + record.id;

    //1.) GET xMatters Events based on Task ID and Active
    var events = query(relatedEventsPath);

    for (var i = 0; i < events.count; i++) {
        print("in for loop ");
        var json = {};
        json.id = events.data[i].id;
        json.status = "TERMINATED";

        //2.) Based on GET use the xMatters Event ID to Terminate the xM Event
        postJSON(json, sURLBaseRest + sEventPath, sUser, sPass);

    }

}

function query(path) {

    var headers = REST.createBasicAuthHttpHeaders("en", sUser, sPass);

    var contentType = new Header();
    contentType.name = "Content-Type";
    contentType.value = "application/json";
    headers.push(contentType);

    try {
        var rawJSON = REST.doRESTGetRequest(sURLBaseRest + path, headers);
        print("COUNT " + rawJSON.total);
        return lib.smis_CommonLib.fromJSON(rawJSON);
    } catch (ex) {
        throw new Error(ex);
    }
}

function postJSON(oJSON, url, username, password) {
    if (bDebug) print(arguments.callee.name + ":url:" + url + ":username:" + username + ":password:" + password);

    var headers = REST.createBasicAuthHttpHeaders("en", username, password);

    var contentType = new Header();
    contentType.name = "Content-Type";
    contentType.value = "application/json";
    headers.push(contentType);

    var rawJSON = REST.doRESTPostRequest(url, headers, JSON.stringify(oJSON));
    return RESTUtil.fromJSON(rawJSON);
}