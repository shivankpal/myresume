﻿
!function () {
    var analytics = window.analytics = window.analytics || []; if (!analytics.initialize) if (analytics.invoked) window.console && console.error && console.error("Segment snippet included twice."); else {
        analytics.invoked = !0; analytics.methods = ["trackSubmit", "trackClick", "trackLink", "trackForm", "pageview", "identify", "reset", "group", "track", "ready", "alias", "debug", "page", "once", "off", "on"]; analytics.factory = function (t) { return function () { var e = Array.prototype.slice.call(arguments); e.unshift(t); analytics.push(e); return analytics } }; for (var t = 0; t < analytics.methods.length; t++) { var e = analytics.methods[t]; analytics[e] = analytics.factory(e) } analytics.load = function (t) { var e = document.createElement("script"); e.type = "text/javascript"; e.async = !0; e.src = ("https:" === document.location.protocol ? "https://" : "http://") + "cdn.segment.com/analytics.js/v1/" + t + "/analytics.min.js"; var n = document.getElementsByTagName("script")[0]; n.parentNode.insertBefore(e, n) }; analytics.SNIPPET_VERSION = "4.0.0";
        analytics.load(window.RDL.segmentKey);
    }
}();
function TrackEvents(eventname, eventpropval, userid, islogin, skipTraitsToIterable) {
    var propertiesToBeSent = CommonTrackProperties(islogin);
    var eventproperties = {};

    if (eventpropval) {
        for (var item in eventpropval) {
            if (eventpropval[item]) {
                propertiesToBeSent[item] = eventpropval[item];
                eventproperties[item] = eventpropval[item];
            }
        }
    }
    switch (eventname) {
        case "identify":
            {
                FireSegmentIOIdentify(userid, eventproperties, skipTraitsToIterable);
                break;
            }
            case "page":
            {
                FireSegmentIOPage("", propertiesToBeSent);
                break;
            }
        default:
            {
                FireSegmentIOTrack(eventname, propertiesToBeSent);
            }
    }
}

function TrackPageEvents(eventpropval, islogin) {    
    var propertiesToBeSent = CommonTrackProperties(islogin);

    if (eventpropval) {
        for (var item in eventpropval) {
            if (eventpropval[item]) {
                propertiesToBeSent[item] = eventpropval[item];
            }
        }
    }
    FireSegmentIOPage("", propertiesToBeSent);
}

function TrackAlias(userid) {
    FireSegmentIOAlias(userid);
}

function FireSegmentIOIdentify(userid, traits, skipTraitsToIterable) {
    traits = traits || null;
    if (userid) {
        if (traits != null) {
            if (skipTraitsToIterable) {
                analytics.identify(userid, traits, {
                    integrations: {
                        'Iterable': false
                    }
                });
            }
            else{
                analytics.identify(userid, traits);
            }
        }
        else {
            analytics.identify(userid);
        }
    }
    else {
        analytics.identify(traits);
    }
    //clear traits
    analytics.ready(function () {
        analytics.user().traits({});
    });
}


function FireSegmentIOPage(pagename, properties) {
    try {
        properties = properties || null;
        if (properties != null) {
            analytics.page(pagename, properties);
        }
        else {
            analytics.page(pagename);
        }	
	}
    catch (ex) {
        console.log(ex);
    }
}

//The track API call is how you record any actions your users perform, along with any properties that describe the action.
function FireSegmentIOTrack(eventname, properties) {
    try {
    properties = properties || null;
    if (properties != null) {
        analytics.track(eventname, properties);
    }
    else {
        analytics.track(eventname);
    }
}
    catch (ex) {
        console.log(ex);
    }
}

function FireSegmentIOAlias(userid) {
    analytics.alias(userid);
}

function AsyncSegTrack(isLoggedin) {
    //Loaded a page event
    var userType ;
    vsuid = window.RDL.readCookie("vsuid");
    userType = vsuid == null ? "New" : "Returning";  	
    TrackPageEvents({'Visitor Type': userType, 'visitId': vsuid}, isLoggedin);
}
function AsyncEnterBuilderTrack()
{
    TrackEvents('enter builder',{'builder type': 'resumes', 'builder tech': 'HTML'},'', isLoggedin);
    
}
function FireSignUpEvents(uuid) {
    if (uuid != '') {
        TrackAlias(uuid);
        TrackEvents("identify", null, uuid, true);
    }
}

function CommonTrackProperties(islogin) {
   
    var propertiesToBeSent = {
        'builder type': 'Resume Wizard',
        'Platform': 'Web', 
        'Feature Set': 'Resumes',
        'Login Status': islogin ?'TRUE':'FALSE'
    };

    return propertiesToBeSent;
}