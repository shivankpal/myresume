var platFormJsUrl = 'https://apis.google.com/js/platform.js';
var packageLoaded;
var trackingApiCalled;
var pixelTimer;
var createGuestUserTimer;
var generateClaimsTimer;
var isAccUserCalled = false;
var postGuestCreatedCalled = false;
var claimsPromise = undefined;
var configPromise = undefined;
var resourcePromise = undefined;
var featurePromise = undefined;
var triggerHIWStage = false;
var isRedirectDone = false;
var userUIdFrmExtrnlSite = '';
var postGuestUserTimer;
var configLoaded = false;
var resourceLoaded = false;
var reqAccountsGuestUserCreation = false;
var isHandlePostPageLoadCalled = false;
var BoldAuthCookieName = "BOLDAuth";
var environment = window.location.host.split('.')[0].replace('-builder', '');
var intlportal = ["muk", "mfr", "mes", "mit", "mbr"];
var $html = document.documentElement;
var isLocal = window.location.origin.indexOf('local') > -1;
RDL.logMessage = " Referrer : " + document.referrer + "\n- Location : " + window.location.href;
RDL.purgedDocHandled = false;
var PushnamiID = '5d7969905d28b600124cb99b';
function isINTL() {
    return isUK() || isFR() || isES() || isIT() || isBR();
}
function isUK() {
    window.RDL.isUK = false;
    if (RDL.Portal.portalCd == "muk") {
        window.RDL.isUK = true;
    }
    return window.RDL.isUK;
}
function isFR() {
    window.RDL.isFR = false;
    if (RDL.Portal.portalCd == "mfr") {
        window.RDL.isFR = true;
    }
    return window.RDL.isFR;
}
function isES() {
    window.RDL.isES = false;
    if (RDL.Portal.portalCd == "mes") {
        window.RDL.isES = true;
    }
    return window.RDL.isES;
}
function isIT() {
    window.RDL.isIT = false;
    if (RDL.Portal.portalCd == "mit") {
        window.RDL.isIT = true;
    }
    return window.RDL.isIT;
}
function isBR() {
    window.RDL.isBR = false;
    if (RDL.Portal.portalCd == "mbr") {
        window.RDL.isBR = true;
    }
    return window.RDL.isBR;
}
function CommonTrackProperties() {
    return {};
}
function getApiUrl(isV2) {
    var environment = window.location.host.split('.')[0].replace('-builder', '');
    var configName = "qa";
    var baseUrl = "";
    var apiEnvironment = RDL.environmentURL || environment;
    baseUrl = apiEnvironment != "www" && apiEnvironment != "builder" ? "https://api-@@env-embedded-builder." + RDL.Portal.url + "/api/v1/" : "https://api-embeddedbuilder." + RDL.Portal.url + "/api/v1/";
    switch (apiEnvironment) {
        case "reg":
        case "regression":
            configName = (RDL.isHLM || RDL.isJBH) ? "reg" : "regression";
            BoldAuthCookieName = "BOLDAuth_Reg";
            break;
        case "stg":
            configName = "stg";
            break;
        case "perf":
            configName = "perf";
            break;
        case "local":
        case "qa":
            BoldAuthCookieName = "BOLDAuth_QA";
            break;
        case "www":
        case "builder":
            break;
    }
    var returnUrl = baseUrl.replace('@@env', configName);
    if(RDL.isMPR && !isLocal){
        //returnUrl = window.location.origin + "/builderapi/v1/";
    }
    return isV2 ? returnUrl.replace('v1', 'v2') : returnUrl;
}

function isIPAD() {
    if (navigator.userAgent.match(/iPad/i))
        return true;
    else
        return false;
}

function startApp(event) {
    if (event != null)
        event.preventDefault();
    RDL.startPageLoader();
    clearInterval(packageLoaded);
    packageLoaded = setInterval(function () {
        if (window.hiwComponent && configLoaded && resourceLoaded) {
            clearInterval(packageLoaded);
            hideHIWPage();
            window.hiwComponent.moveToFunnel();
        }
    }, 10);
}

function hideHIWPage() {
    if (document.getElementById('howItWorks')) {
        document.getElementById('howItWorks').classList.add("d-none");
    }
}

function downLoadFile(name, url, fileType, skinCD, docformatName) {
    var xmlhttp;
    xmlhttp = new XMLHttpRequest();


    xmlhttp.onload = function (event) {
        var blob = xmlhttp.response;
        if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveOrOpenBlob(blob, name + '.' + fileType);
        } else {
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = name + '.' + fileType;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        var template = RDL.Skins.filter(function (item, index) {
            return item.skinCD == skinCD;
        });
        var templateName = template && template.length > 0 ? template[0].name : '';
        window.RDL.TrackEvents('document downloaded', { 'document type': 'resumes', 'document format': docformatName, 'template name': templateName }, null, window.RDL.isloggedIn);
    }

    xmlhttp.open('GET', url, true);
    xmlhttp.withCredentials = true;
    xmlhttp.responseType = "blob";
    xmlhttp.send();
}

function hasClass(elem, className) {
    return elem.className && (new RegExp(className, 'g')).test(elem.className);
}

function toggleClass(elem, className) {
    if (hasClass(elem, className)) {
        elem.className = elem.className.replace((new RegExp(className, 'g')), "");
    } else {
        elem.className += " " + className;
    }
}

function addClass(elem, className) {
    if (!hasClass(elem, className)) {
        elem.className += " " + className;
    }
}

function removeClass(elem, className) {
    if (hasClass(elem, className)) {
        elem.className = elem.className.replace((new RegExp(className, 'g')), "");
    }
}

function setClass(elem, className) {
    elem.className = className;
}

function getResourceUrl() {
    var environment = window.location.host.split('.')[0].replace('-builder', '');
    var portalcd = RDL.Portal.portalCd;
    if ((RDL.isZTY && !isLocal) || RDL.isHLM || RDL.isJBH || (RDL.isMPR && !isLocal)) {
        return "/blobcontent/" + portalcd + "/";
    } else {
        return (environment != "stg" && environment != "www" && environment != "builder") ? "https://lccontentdev.blob.core.windows.net/" + portalcd + "/" : "https://content.livecareer.com/" + portalcd + "/";
    }


}

function firePixel(url, isPostRegistration) {
    if (typeof dataLayer != "undefined") {
        clearInterval(pixelTimer);
        if (isPostRegistration)
            dataLayer.push({ 'event': 'stepregistered', 'category': 'contact', 'action': 'click', 'virtualurl': url });
        else
            dataLayer.push({ 'event': 'stepchanged', 'category': 'contact', 'action': 'click', 'virtualurl': url });
    }
}

function showLoaderOverlay(hideLoaderLine) {
    if (hideLoaderLine) {
        document.getElementsByClassName("loader-line")[0].classList.add("d-none");
    }
    document.getElementById('overlayLoader').classList.remove('d-none');
}

function hideLoaderOverlay(hideLoaderLine) {
    if (hideLoaderLine) {
        document.getElementsByClassName("loader-line")[0].classList.remove("d-none");
    }
    document.getElementById('overlayLoader').classList.add('d-none');
}

function AsyncSegTrack(isLoggedin, visitId) {
    if (window.RDL.UserConsent) {
        var userType;
        vsuid = window.RDL.readCookie("vstrType");
        userType = vsuid == null ? "New" : "Returning";
        if (!vsuid) {
            window.RDL.createCookie("vstrType", "1", 5 * 365, window.location.host.substr(window.location.host.indexOf('.')));
        }
        var objToSend = { 'Visitor Type': userType, 'Page Type': 'Product' };
        if (visitId) {
            objToSend.visitId = visitId;
        }
        if (typeof analytics != 'undefined') {
            RDL.TrackEvents("page", objToSend, null, isLoggedin);
        }
        else {
            var TrackEventsInterval = setInterval(function () {
                if (typeof analytics != 'undefined') {
                    RDL.TrackEvents("page", objToSend, null, isLoggedin);
                    clearInterval(TrackEventsInterval);
                }
            }, 100);
        }
    }
}

function trackEvent(eventName, eventpropval, userid, islogin) {
    if (RDL.readCookie("mixpanelprops") == null) {
        GetMixpanelProperties();
    }
    else {
        UpdateMixPanelURL();
    }
    TrackEvents(eventName, eventpropval, userid, islogin);
}
function UpdateMixPanelURL() {
    try {
        var mixpanelpropsVal = window.RDL.readCookie("mixpanelprops");
        var mixPanelValObj = JSON.parse(unescape(mixpanelpropsVal));
        if (mixPanelValObj["$current_url"] != window.location.href) {
            mixPanelValObj["$current_url"] = window.location.href;
            var mixpanelProperties = JSON.stringify(mixPanelValObj);
            window.RDL.createCookie("mixpanelprops", escape(mixpanelProperties));
        }
    }
    catch (ex) { }
}

function GetMixpanelProperties() {
    var mixpanelProperties = '';
    try {
        if (typeof mixpanel != 'undefined' && typeof mixpanel.get_distinct_id != 'undefined') {
            if (isIPAD()) {
                mixpanel.register({ 'device type': 'tablet' });
            } else {
                mixpanel.register({ 'device type': 'desktop' });
            }

            if (!RDL.isLCA && !RDL.isWhiteLabel) {
                var infoProperties = mixpanel._.info.properties();
                var persistProperties = mixpanel.persistence.properties();
                mixpanelProperties = JSON.stringify($.extend(infoProperties, persistProperties));
                RDL.createCookie("mixpanelprops", escape(mixpanelProperties), null, window.location.host.substr(window.location.host.indexOf('.')));
            }
        }
    }
    catch (e) {
        console.log('error in mixpanel properties fetching');
    }
}

function getConfigUrl() {
    var environment = window.location.host.split('.')[0].replace('-builder', '');
    var configName = "dev";
    var baseUrl = window.RDL.Paths.ResourcePath + "config/";
    environment = RDL.environmentURL ? RDL.environmentURL : environment;
    switch (environment) {
        case "regression":
        case "reg":
            configName = "reg";
            break;
        case "reg-stg":
            configName = "reg-stg";
            break;
        case "stg":
            configName = "stg";
            break;
        case "perf":
            configName = "perf";
            break;
        case "www":
            configName = "prod";
            break;
        case "builder":
            configName = "prod";
            break;
    }
    var filename = configName + ".js";
    if (versionNumber != "1.0.0") {
        filename = filename + "?v=" + versionNumber;
    }
    return baseUrl + filename;
}

function closeLongLoaderQualityBuilder() {
    var loaderNode = document.getElementById("longLoader");
    if (loaderNode) {
        loaderNode.classList.add("d-none");
        document.body.classList.remove("disable-scroll")
    }

}

function closeShortLoaderQualityBuilder() {
    var loaderNode = document.getElementById("shortLoader");
    var loaderApp = document.getElementById("app");

    if (loaderNode && loaderApp) {
        loaderNode.classList.add("d-none");
        loaderApp.classList.remove("blur");
    }

}
function applyCssonCards(cards) {
    for (var i = 0; i < cards.length; i++) {
        cards[i].classList.add("thumb-" + cards[i].parentElement.attributes["data-skincd"].value.toLowerCase());
    }
}
function applyImageCss() {
    var cards = document.getElementsByClassName('list-item-thumb');
    if (window.RDL.applyCardCss && cards && cards.length > 0) {
        applyCssonCards(cards);
    }
    else {
        setTimeout(function (cards) {
            applyImageCss();
        }, 50);
    }
}

function polyfillNodelistForeach() {
    //polyfill to support foreach on NodeList
    if (window.NodeList && !NodeList.prototype.forEach) {
        NodeList.prototype.forEach = function (callback, thisArg) {
            thisArg = thisArg || window;
            for (var i = 0; i < this.length; i++) {
                callback.call(thisArg, this[i], i, this);
            }
        };
    }
    if (window.DOMTokenList && !DOMTokenList.prototype.forEach) {
        DOMTokenList.prototype.forEach = function (callback, thisArg) {
            thisArg = thisArg || window;
            for (var i = 0; i < this.length; i++) {
                callback.call(thisArg, this[i], i, this);
            }
        };
    }
}

function loadGTM(w, d, s, l, i) {
    w[l] = w[l] || []; w[l].push({
        'gtm.start':
            new Date().getTime(), event: 'gtm.js'
    }); var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src =
            'https://www.googletagmanager.com/gtm.js?id=' + i + dl + (RDL.Portal.googleMapappendGTMQueryStringsKey ? RDL.Portal.googleMapappendGTMQueryStringsKey : ''); f.parentNode.insertBefore(j, f);
}
//End Google Tag Manager

function loadJs(src, async, callback, crossorigin) {
    var s,
        r,
        t;
    r = false;
    s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = src;
    if (crossorigin == true) {
        s.crossOrigin = 'anonymous';
    }
    s.async = (async != null && async != undefined) ? async : true;
    s.onload = s.onreadystatechange = function () {
        if (!r && (!this.readyState || this.readyState == 'complete' || this.readyState == 'loaded')) {
            r = true;
            callback && callback();
        }
    };
    t = document.getElementsByTagName('script')[0];
    t.parentNode.insertBefore(s, t);
}

function loadJsWithKey(src, id, key) {
    var f = document.createElement('script');
    f.setAttribute("src", src);
    f.setAttribute("id", id);
    f.setAttribute("data-app-key", key);
    if (typeof f != "undefined")
        document.getElementsByTagName("head")[0].appendChild(f);
}

function loadStyleSheet(src) {
    if (document.createStyleSheet) document.createStyleSheet(src);
    else {
        var stylesheet = document.createElement('link');
        stylesheet.href = src;
        stylesheet.rel = 'stylesheet';
        stylesheet.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(stylesheet);
    }
}

function loadgtms() {
    loadGTM(window, document, 'script', 'dataLayer', RDL.Portal.gtmKey1);
    if (RDL.Portal.gtmKey2 && RDL.Portal.gtmKey2 != null && RDL.Portal.gtmKey2.length > 0) {
        loadGTM(window, document, 'script', 'dataLayer', RDL.Portal.gtmKey2);
    }
}

function loadJqueryDepJs() {
    if (window.RDL.UserConsent) {
        window.RDL.LoadThirdPartyJS();
    }
    if (typeof (window.RDL.ExternalJavascripts) && window.RDL.ExternalJavascripts) {
        window.RDL.ExternalJavascripts.forEach(function (element) {
            var script = document.createElement('script');
            script.type = "text/javascript";
            script.src = element;
            document.getElementById('afterLoadContent').appendChild(script);
        });
    }
   
    if (jQuery) {
        $('#app').on('click', '.nav-check-links.link-action .link, .page-wrapper .icon-spell', function () {
            RDL.TrackEvents && RDL.TrackEvents('spell check clicked', { 'pathname': location.pathname }, null, window.RDL.isloggedIn);
        });
    }
}

function downLoadAccountsJs(){
    if (window.RDL.Portal && window.RDL.Portal.downLoadAccountsLoginJs) {
        // create guest user
        var divLoginWidget = document.getElementById('divLoginWidget');
        if (divLoginWidget) {
            divLoginWidget.setAttribute("data-targetDomain", window.RDL.Paths.AccountsURL);
            divLoginWidget.setAttribute("data-productCode", window.RDL.PortalSettings.ConfigureProductCd);
            divLoginWidget.setAttribute("data-portalCode", window.RDL.PortalSettings.ConfigurePortalCd);
        }
        var accountsUrl = window.RDL.Paths.AccountsURL + "/scripts/app/accounts.min.js";
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = accountsUrl;
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'accounts-js'));
    }
}

function checkSafariBrowser() {
    if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
        $html.classList.add('safari');
        var head = document.head || document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        style.type = 'text/css';
        var css = '::-webkit-scrollbar{-webkit-appearance: none;width: 7px;}::-webkit-scrollbar-thumb {border-radius: 4px;background-color: rgba(0, 0, 0, .5);-webkit-box-shadow: 0 0 1px rgba(255, 255, 255, .5);}';
        style.appendChild(document.createTextNode(css));
        head.appendChild(style);
    }
}

function setCountryDetails(resolve, reject) {
    callAjax(true, window.RDL.Paths.BaseApiUrl + 'user/countryclaims/', "GET", true, true, function (data) {
        if (data) {
            RDL.countryDetails = JSON.parse(data);
            resolve && resolve();
        }
        else {
            reject && reject();
        }
    });
}

function getLocalizationUrl() {
    var environment = window.location.host.split('.')[0].replace('-builder', '');
    var resourceName = "dev";
    var baseUrl = window.RDL.Paths.ResourcePath + "Resources/";
    environment = RDL.environmentURL ? RDL.environmentURL : environment;
    switch (environment) {
        case "regression":
        case "reg":
            resourceName = "reg";
            break;
        case "reg-stg":
            resourceName = "reg-stg";
            break;
        case "stg":
            resourceName = "stg";
            break;
        case "perf":
            resourceName = "perf";
            break;
        case "www":
            resourceName = "prod";
            break;
        case "builder":
            resourceName = "prod";
            break;
    }

    var filename = resourceName + ".json";
    if (versionNumber != "1.0.0") {
        filename = filename + "?v=" + versionNumber;
    }
    return baseUrl + filename;
}

function handleClaims(result, resolve) {
    RDL.UserClaims = JSON.parse(result);

    var cookieEnabledCheck = (((RDL.isMPROrMPCL || window.RDL.isINTL) && navigator.cookieEnabled) || RDL.isLCA || RDL.isWhiteLabel || RDL.isHLM);

    if (RDL.UserClaims.user_uid != null && RDL.UserClaims.user_uid != '' && cookieEnabledCheck) {
        window.RDL.userId = RDL.UserClaims.user_uid;
        window.RDL.partyID = RDL.UserClaims.partyid;
        window.RDL.ContinentCode = RDL.UserClaims.continentCode;
        window.RDL.isloggedIn = (RDL.UserClaims.role != "User") ? false : true;
        if (RDL.isBaseRoute && !isTemplateFlow()) {
            if (RDL.UserClaims.role == "Guest" && isAccUserCalled) {
                PostGuestCreated(window.RDL.userId, 'claim');
            }
            // else if (!window.RDL.executeDirectFunnelFlow) {
            //     // For Reg user - skip HIW n move to next page
            //     RDL.closePageLoader();
            //     clearInterval(packageLoaded);
            //     packageLoaded = setInterval(function () {
            //         if (window.appEntry && configLoaded && resourceLoaded) {
            //             clearInterval(packageLoaded);
            //             window.appEntry.preFunnelLoadProcessing();
            //         }
            //     }, 10);
            // }
        }
        else if (!RDL.isBaseRoute && RDL.UserClaims.role == "Guest" && isAccUserCalled) {
            window.location = window.RDL.Paths.BasePath;
        }
        else {
            hideHIWPage();
        }
    }
    else if (window.RDL.Portal && window.RDL.Portal.downLoadAccountsLoginJs) {
        var guestUserId = window.RDL.readCookie("guestUserId");
        window.RDL.userId = guestUserId;
        if (guestUserId == null || guestUserId == "" || window.RDL.readCookie(BoldAuthCookieName) == null) {
            if (window.RDL.Portal && window.RDL.Portal.isThirdPartySite) {
                userUIdFrmExtrnlSite = window.RDL.readCookie("useruid");
                if (userUIdFrmExtrnlSite) {
                    window.RDL.GenerateClaims();
                } else {
                    window.RDL.CreateGuestUser();
                }
            }
            else {
                if (isAccUserCalled && (RDL.isMPR || RDL.isLCA || RDL.isWhiteLabel || RDL.isHLM)) {
                    // redirect to LP.
                    clearAndRedirect("/?forceRedirect=claimNotFound")
                } else {
                    window.RDL.CreateGuestUser();
                }
            }
        }
        else {
            PostGuestCreated(guestUserId, 'claim');
        }
    } else {
        if (window.RDL.isINTL) {
            if (navigator.cookieEnabled) {
                if (RDL.GetQueryString('frmbldr') == '1')
                    window.location.href = window.location.origin;
                else {
                    var propQueryString = window.location.search; //adding UTM Parameters
                    if (propQueryString.length == 0)
                        propQueryString = "?wizard=true&productid=17";
                    window.location.href = "/membership/RegisterGuestUser.aspx" + propQueryString + "&frmbldr=1";
                }
            }
            else
                window.location.href = window.location.origin;
        }
    }
    if (resolve) {
        resolve("");
    }
}

function callAjax(logError, url, method, async, withCredentials, callback, resolve, data) {
    var xmlhttp;
    // compatible with IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onload = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            if (callback)
                if (resolve) {
                    callback(xmlhttp.responseText, resolve);
                }
                else {
                    callback(xmlhttp.responseText);
                }
        }
        else {
            if (callback) {
                if (resolve) {
                    callback(null, resolve);
    }
                else {
                    callback(null);
                }
            }
            if (logError) {
                RDL.logMessage = "An error occurred during the Ajax call";
                RDL.logMessage += "\n Referrer : " + document.referrer + "\n- Location : " + window.location.href;
                RDL.logMessage += "\n Status : " + xmlhttp.status + "\n- Request URL : " + xmlhttp.responseURL + "\n- Response Text : " + xmlhttp.responseText;
                let errorObj = {
                    ErrorMessage: 'Ajax call Error Logging-' + RDL.logMessage, LogAsInfo: true
                }
                callAjax(false, window.RDL.Paths.BaseApiUrl + 'error/log', 'POST', true, true, function () {
                    RDL.logMessage = "";
                }, null, JSON.stringify(errorObj));
            }
        }
    }
    xmlhttp.open(method, url, async);
    if (withCredentials)
        xmlhttp.withCredentials = true;

    if (data) {
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xmlhttp.send(data);
    }
    else {
        xmlhttp.send();
    }
}

function callAjaxTestBed(url, method, async, withCredentials, callback, resolve, data) {
    var xmlhttp;
    // compatible with IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onload = function () {
        if (xmlhttp.readyState == 4 && (xmlhttp.status == 200 || xmlhttp.status == 404)) {
            if (callback)
                if (resolve) {
                    callback(xmlhttp.responseText, resolve);
                }
                else {
                    callback(xmlhttp);
                }
        }
    }
    xmlhttp.open(method, url, async);
    if (withCredentials)
        xmlhttp.withCredentials = true;

    if (data) {
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xmlhttp.send(data);
    }
    else {
        xmlhttp.send();
    }
}

function getJobTitleIndustriesSet() {
    var url = window.RDL.Paths.ResourcePath + "Resources/jobtitleindustriesmapping.json";
    callAjax(true, url, "GET", true, false, function (data) {
        if (data) {
            RDL.JobTitleWithIndustry = JSON.parse(data);
        }
    });
}

function getFeatureSet(resolve) {
    var featureUrl = RDL.Paths.BaseApiUrl + 'config/features/' + RDL.Portal.portalCd;
    callAjax(true, featureUrl, "GET", true, false, function (data) {
        if (data) {
            RDL.ArrayFeatureSet = JSON.parse(data);
        }
        if (resolve)
            resolve("");
    });
}

function isFeaturePresent(featureCD) {
    var result = false;
    var feature = RDL.ArrayFeatureSet.filter(function (feature) { return feature.featureCD.toLowerCase() == featureCD.toLowerCase() });
    if (feature && feature.length && feature[0].isActive) {
        document.documentElement.classList.add('f-' + featureCD.toLowerCase());
        result = true;
    }
    return result;
}

function checkBrowserCompatibility() {
    // var objAgent = navigator.userAgent;
    // var objfullVersion = '' + parseFloat(navigator.appVersion);
    // var objOffsetVersion;
    // var legacyEditorURL;
    // if (window.location.hostname) {
    //     legacyEditorURL = window.location.protocol + "//" + window.location.hostname + '/information/unsupportedbrowsers.aspx';
    // }
    // else {
    //     legacyEditorURL = window.location.origin + '/information/unsupportedbrowsers.aspx';
    // }
    // // In Microsoft internet explorer 
    // if ((objOffsetVersion = objAgent.indexOf("MSIE")) != -1) {
    //     objfullVersion = objAgent.substring(objOffsetVersion + 5);
    //     if (objfullVersion.substring(0, objfullVersion.indexOf(".")) <= 9) {
    //         window.location = legacyEditorURL;
    //     }
    // }
    // // In Safari 
    // else if ((objOffsetVersion = objAgent.indexOf("Safari")) != -1) {
    //     objfullVersion = objAgent.substring(objOffsetVersion + 7);
    //     if ((objOffsetVersion = objAgent.indexOf("Version")) != -1) {
    //         objfullVersion = objAgent.substring(objOffsetVersion + 8);
    //         if (objfullVersion.substring(0, objfullVersion.indexOf(".")) <= 8) {
    //             window.location = legacyEditorURL;
    //         }
    //     }
    // }

    Promise.all([claimsPromise, configPromise, resourcePromise, featurePromise, countryDetailsPromise]).then(function (data) {
        RDL.claimsLoaded = true;
        loadJs(packageUrl, true); // load react main bundle asyn
        if (window.RDL.pageLoaded) {
            if (RDL.isINTL || (reqAccountsGuestUserCreation == false && isHandlePostPageLoadCalled == false)) {
                handlePostPageLoad();
            }
        }
        else {
            var pageLoadTimer = setInterval(function () {
                if (window.RDL.pageLoaded) {
                    clearInterval(pageLoadTimer);
                    if (RDL.isINTL || (reqAccountsGuestUserCreation == false && isHandlePostPageLoadCalled == false)) {
                        handlePostPageLoad();
                    }
                }
            }, 100);
        }
        //As of now it's being used for INTL only.
        loadLocalizedDefinitionTips();
        RDL.promiseAllResolveActivity();
    });
}
function loadLocalizedDefinitionTips() {
    if (window.RDL.Localization && window.RDL.isINTL) {
        RDL.Definition_Tips.forEach(function (item) {
            item.tips = window.RDL.Localization[item.tips] ? window.RDL.Localization[item.tips] : item.tips;
            item.name = window.RDL.Localization[item.name] ? window.RDL.Localization[item.name] : item.name;
            item.defaultText = window.RDL.Localization[item.defaultText] ? window.RDL.Localization[item.defaultText] : item.defaultText;
            item.title = window.RDL.Localization[item.title] ? window.RDL.Localization[item.title] : item.title;
            item.definition = window.RDL.Localization[item.definition] ? window.RDL.Localization[item.definition] : item.definition;
            if (item.BulbTipsDefinition)
                item.BulbTipsDefinition = window.RDL.Localization[item.BulbTipsDefinition] ? window.RDL.Localization[item.BulbTipsDefinition] : item.BulbTipsDefinition;
            if (item.BulbTips1)
                item.BulbTips1 = window.RDL.Localization[item.BulbTips1] ? window.RDL.Localization[item.BulbTips1] : item.BulbTips1;
            if (item.BulbTips2)
                item.BulbTips2 = window.RDL.Localization[item.BulbTips2] ? window.RDL.Localization[item.BulbTips2] : item.BulbTips2;
            if (item.BulbTips3)
                item.BulbTips3 = window.RDL.Localization[item.BulbTips3] ? window.RDL.Localization[item.BulbTips3] : item.BulbTips3;
            if (item.BulbTips4)
                item.BulbTips4 = window.RDL.Localization[item.BulbTips4] ? window.RDL.Localization[item.BulbTips4] : item.BulbTips4;

        });
    }
}
function polyfillArrayFrom() {
    if (Array.from) {
        return;
    }
    Array.from = (function () {
        var toStr = Object.prototype.toString;
        var isCallable = function (fn) {
            return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
        };
        var toInteger = function (value) {
            var number = Number(value);
            if (isNaN(number)) { return 0; }
            if (number === 0 || !isFinite(number)) { return number; }
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        };
        var maxSafeInteger = Math.pow(2, 53) - 1;
        var toLength = function (value) {
            var len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
        };

        // The length property of the from method is 1.
        return function from(arrayLike/*, mapFn, thisArg */) {
            // 1. Let C be the this value.
            var C = this;

            // 2. Let items be ToObject(arrayLike).
            var items = Object(arrayLike);

            // 3. ReturnIfAbrupt(items).
            if (arrayLike == null) {
                throw new TypeError('Array.from requires an array-like object - not null or undefined');
            }

            // 4. If mapfn is undefined, then Let mapping be false.
            var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            var T;
            if (typeof mapFn !== 'undefined') {
                // 5. else
                // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
                if (!isCallable(mapFn)) {
                    throw new TypeError('Array.from: when provided, the second argument must be a function');
                }

                // 5. b. If thisArg was supplied, Let T be thisArg; else Let T be undefined.
                if (arguments.length > 2) {
                    T = arguments[2];
                }
            }

            // 10. Let lenValue be Get(items, "length").
            // 11. Let len be ToLength(lenValue).
            var len = toLength(items.length);

            // 13. If IsConstructor(C) is true, then
            // 13. a. Let A be the result of calling the [[Construct]] internal method 
            // of C with an argument list containing the single item len.
            // 14. a. Else, Let A be ArrayCreate(len).
            var A = isCallable(C) ? Object(new C(len)) : new Array(len);

            // 16. Let k be 0.
            var k = 0;
            // 17. Repeat, while k < len… (also steps a - h)
            var kValue;
            while (k < len) {
                kValue = items[k];
                if (mapFn) {
                    A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                } else {
                    A[k] = kValue;
                }
                k += 1;
            }
            // 18. Let putStatus be Put(A, "length", len, true).
            A.length = len;
            // 20. Return A.
            return A;
        };
    }());

}

function handleAliasAndIdentify() {
    if (!window.RDL.isloggedIn) {
        var interval = setInterval(function () {
            if (typeof analytics != 'undefined') {
                clearInterval(interval);
                analytics.alias(RDL.UserClaims.user_uid);
                setTimeout(function () {
                    analytics.identify(RDL.UserClaims.user_uid, null);
                }, 100);
            }
        }, 50);
    }
}

function getLongMonths(culture) {
    var monthsLong = [""];
    for (i = 0; i < 12; i++) {
        var objDate = new Date(); objDate.setMonth(i);
        var locale = culture.toLowerCase(), month = objDate.toLocaleString(locale, { month: "long" });
        monthsLong.push(month.substr(0, 1).toUpperCase() + month.substr(1, month.length - 1));
    }
    return monthsLong;
}

function addExperimentsLocalizedText() {
    var expsList = Object.keys(RDL.PortalExperiments);
    if (expsList.length > 0) {
        expsList.forEach(function (exp) {
            var experimentID = RDL.PortalExperiments[exp].id;
            if (RDL.ExperimentsLocalization[experimentID]) {
                Object.assign(window.RDL.Localization, RDL.ExperimentsLocalization[experimentID]);
            }
        });
    }   
}

function handleLocalizationText(result, resolve) {
    var data = JSON.parse(result);
    window.RDL.Localization = data.localizedtext;
    window.RDL.localizedDocumentText = data.localizedtext.resumeNameLocalizedText ? data.localizedtext.resumeNameLocalizedText : "Resume";
    if (window.RDL.isINTL) {
        window.RDL.Localization.default_preview_documentTitle = "";
    }
    RDL.localizationResumeRenderer = {
        "firstNamDefaultText": window.RDL.Localization.default_preview_firstname,
        "lastNameDefaultText": window.RDL.Localization.default_preview_lastname,
        "professionDefaultText": window.RDL.Localization.default_preview_documentTitle,
        "streetAddressDefaultText": window.RDL.Localization.default_preview_street,
        "cityDefaultText": window.RDL.Localization.default_preview_city,
        "stateDefaultText": window.RDL.Localization.default_preview_state,
        "zipDefaultText": window.RDL.Localization.default_preview_zipcode,
        "emailDefaultText": window.RDL.Localization.default_preview_email,
        "phoneDefaultText": window.RDL.Localization.default_preview_phone,
        "cellPhoneDefaultText": window.RDL.Localization.cPhone || '',
        "resumeTitleDefaultText": window.RDL.Localization.rsTitlDef,
        "exRsmTitleDef": window.RDL.Localization.exRsTitlDef,
        "exRsmTitleDef2": window.RDL.Localization.exRsTitl2Def,
        "exRsmTitleDef3": window.RDL.Localization.exRsTitl3Def,
        "editSectionText": (window.RDL.Localization.editSection || ''),
        "dragText": window.RDL.Localization.move_Text,
        "deleteText": window.RDL.Localization.delete_Label,
        "editText": window.RDL.Localization.edit_Label,
        "addSubSectionText": "",
        "addNewSecDocText": window.RDL.Localization.addNewSecDoc,
        "finalRename": window.RDL.Localization.rename_Label,
        "finalRenameErr": window.RDL.Localization.enterValidDate_Text,
        "finalRenameCancel": window.RDL.Localization.cancel_Label,
        "suppInfoDefaultText": window.RDL.Localization.suppInfo,
        "editPhoto_Text": window.RDL.Localization.EditPhoto_Text,
        "currentText": window.RDL.Localization.current_Text,
        "shortMonths": window.RDL.Localization.shortMonth,
        "longMonths": getLongMonths(RDL.cultureCD || "en-us"),

        "schoolnameDefaultText": window.RDL.Localization.default_preview_schoolname,
        "schoollocationDefaultText": window.RDL.Localization.default_preview_schoollocation,
        "schoolcityDefaultText": window.RDL.Localization.default_preview_schoolcity,
        "schoolstateDefaultText": window.RDL.Localization.default_preview_schoolstate,
        "degreeearnedDefaultText": window.RDL.Localization.default_preview_degreeearned,
        "graduationyearDefaultText": window.RDL.Localization.default_preview_graduationyear,
        "fieldofexpertiseDefaultText": window.RDL.Localization.default_preview_fieldofexpertise,
      
        "jobtitleDefaultText": window.RDL.Localization.default_preview_jobtitle1,
        "companyNameDefaultText": window.RDL.Localization.default_preview_company1,
        "jobcityDefaultText": window.RDL.Localization.default_preview_jobcity1,
        "jobstateDefaultText": window.RDL.Localization.default_preview_jobstate1,
        "jobStarteDateDefaultText": window.RDL.Localization.default_preview_jobstartdate1,
        "jobEndDateDefaultText": window.RDL.Localization.default_preview_jobenddate1,
        "jobDescriptionDefaultText": window.RDL.Localization.default_preview_jobdescription1,

        "jobtitleDefaultText2": window.RDL.Localization.default_preview_jobtitle2,
        "companyNameDefaultText2": window.RDL.Localization.default_preview_company2,
        "jobcityDefaultText2": window.RDL.Localization.default_preview_jobcity2,
        "jobstateDefaultText2": window.RDL.Localization.default_preview_jobstate2,
        "jobStarteDateDefaultText2": window.RDL.Localization.default_preview_jobstartdate2,
        "jobEndDateDefaultText2": window.RDL.Localization.default_preview_jobenddate2,
        "jobDescriptionDefaultText2": window.RDL.Localization.default_preview_jobdescription2,

        "jobtitleDefaultText3": window.RDL.Localization.default_preview_jobtitle3,
        "companyNameDefaultText3": window.RDL.Localization.default_preview_company3,
        "jobcityDefaultText3": window.RDL.Localization.default_preview_jobcity3,
        "jobstateDefaultText3": window.RDL.Localization.default_preview_jobstate3,
        "jobStarteDateDefaultText3": window.RDL.Localization.default_preview_jobstartdate3,
        "jobEndDateDefaultText3": window.RDL.Localization.default_preview_jobenddate3,
        "jobDescriptionDefaultText3": window.RDL.Localization.default_preview_jobdescription3,

        "summaryDefaultText": window.RDL.Localization.default_preview_summary,

        "skillDef": window.RDL.Localization.default_preview_skill1,
        "skillDef2": window.RDL.Localization.default_preview_skill2,
        "DOB_Text": window.RDL.Localization.DOB_finalize_Text,
        "nationality_Text": window.RDL.Localization.nationality_finalize_Text,
        "toDate_text": window.RDL.Localization.toDate_text || ''

    }

    if (!window.RDL.isINTL) {
        window.RDL.Localization.flgEnabledSplit = false;
        window.RDL.Localization.degreeRWZ = [
            { name: "DGRE", value: "-2", label: "Enter a different degree" },
            { name: "DGRE", value: "Some College (No Degree)", label: "Some College (No Degree)" }

        ];

        window.RDL.Definition_Tips = [
            {
                "tips": "",
                "sectionTypeCd": "NAME",
                "name": window.RDL.Localization.nameName_SecType_db,
                "defaultText": "",
                "title": "",
                "definition": "",
                "doczonetypecd": "HEAD",
                "isDefaut": true
            }, {
                "tips": "",
                "sectionTypeCd": "CNTC",
                "name": window.RDL.Localization.cntcCntc_SecType_db,
                "defaultText": "",
                "title": "",
                "definition": "",
                "doczonetypecd": "HEAD",
                "isDefaut": true
            }, {
                "tips": "<li>" + window.RDL.Localization.needToknow_Text + "</li><li>" + window.RDL.Localization.summTips_ShowEmp_Text + "</li><li>" + window.RDL.Localization.summTips_Help_Text + "</li>",
                "sectionTypeCd": "SUMM",
                "name": window.RDL.Localization.professionalSummary_Text,
                "defaultText": window.RDL.Localization.placeholder_Summary,
                "title": "",
                "definition": "An overview of your career stating your most important strengths and abilities. This section provides a clear snapshot of who you are, what you can offer, and what you are looking to accomplish.",
                "doczonetypecd": "BODY",
                "isDefaut": true,
                "BulbTipsDefinition": window.RDL.Localization.shortCut_Text,
                "BulbTips1": window.RDL.Localization.careerOverView_Text,
                "BulbTips2": window.RDL.Localization.chooseExample_Text,
                "BulbTips3": window.RDL.Localization.summary_Text
            }, {
                "tips": "<li>" + window.RDL.Localization.needToknow_Text + "</li><li>" + window.RDL.Localization.skillTips_Scan_Text + "<li>" + window.RDL.Localization.skillTips_Help_Text + "</li>",
                "sectionTypeCd": "HILT",
                "name": window.RDL.Localization.skills_Label,
                "defaultText": window.RDL.Localization.placeholder_Skills_single,
                "title": "",
                "definition": "In this 2-column section, use bullets to highlight your top 4-8 skills. We recommend listing skills in short, 2-3 word phrases, without punctuation.",
                "doczonetypecd": "BODY",
                "isDefaut": true,
                "BulbTipsDefinition": window.RDL.Localization.managerInsightSkills_Text,
                "BulbTips1": window.RDL.Localization.relevantSkills_Text,
                "BulbTips2": window.RDL.Localization.dontHaveExperience_Text,
                "BulbTips3": window.RDL.Localization.bulletPhrases_Text,
                "BulbTips4": window.RDL.Localization.notSureAboutSkill_Text
            }, {
                "tips": "<li>" + window.RDL.Localization.needToknow_Text + "</li><li>" + window.RDL.Localization.expTips_ScanRsm_Text + "</li><li>" + window.RDL.Localization.expTips_BulletPointsImp_Text + "</li>",
                "sectionTypeCd": "EXPR",
                "name": window.RDL.Localization.wrkhWrkh_SecType_db,
                "defaultText": window.RDL.Localization.placeholder_Experience_enlargePreview,
                "definition": "Outline up to 10 years of recent work experience, beginning with your current employer. Use bullets to list your major efforts, accomplishments and experience. If you have relevant work experience from more than 10 years ago, we recommend adding a separate section called Previous Work History.",
                "title": "",
                "doczonetypecd": "BODY",
                "isDefaut": true,
                "BulbTipsDefinition": window.RDL.Localization.hiringManagers_Text,
                "BulbTips1": window.RDL.Localization.enterInfo_Text,
                "BulbTips2": window.RDL.Localization.useFullTitle_Textz,
                "BulbTips3": window.RDL.Localization.includeDate_Text,
                "BulbTips4": window.RDL.Localization.canRemember_Text
            }, {
                "tips": "<li>" + window.RDL.Localization.needToknow_Text + "</li><li>" + window.RDL.Localization.eduTips_Scan_Text + "</li><li>" + window.RDL.Localization.eduTips_FormatCare_Text + "</li>",
                "sectionTypeCd": "EDUC",
                "name": window.RDL.Localization.education_Label,
                "defaultText": "",
                "title": "",
                "definition": "Any degrees, coursework, professional development or training programs you have completed in preparation for your target job.",
                "doczonetypecd": "BODY",
                "isDefaut": true,
                "BulbTipsDefinition": window.RDL.Localization.ageism_Text,
                "BulbTips1": window.RDL.Localization.mbe_EducationTips_ListSchools_lbl,
                "BulbTips2": window.RDL.Localization.listSchool_Text,
                "BulbTips3": window.RDL.Localization.cources_Text,
                "BulbTips4": window.RDL.Localization.seperateSection_Text
            }, {
                "tips": "",
                "title": "",
                "sectionTypeCd": "AFIL",
                "definition": "",
                "name": window.RDL.Localization.affil_Text,
                "defaultText": window.RDL.Localization.placeHolderText_affi,
                "doczonetypecd": "BODY",
                "isDefaut": false
            }, {
                "tips": "",
                "title": "",
                "sectionTypeCd": "ACCM",
                "definition": "",
                "name": window.RDL.Localization.accomplishments_Label,
                "defaultText": window.RDL.Localization.placeHolderText_accm,
                "doczonetypecd": "BODY",
                "isDefaut": false
            }, {
                "tips": "",
                "title": "",
                "sectionTypeCd": "ADDI",
                "definition": "",
                "name": window.RDL.Localization.addInfo_Text,
                "defaultText": window.RDL.Localization.placeHolderText_addi,
                "doczonetypecd": "BODY",
                "isDefaut": false
            }, {
                "tips": "",
                "title": "",
                "sectionTypeCd": "LANG",
                "definition": "",
                "name": window.RDL.Localization.lang_Text,
                "defaultText": window.RDL.Localization.placeHolderText_lang,
                "doczonetypecd": "BODY",
                "isDefaut": false
            }, {
                "tips": "",
                "title": "",
                "sectionTypeCd": "SFTR",
                "definition": "",
                "name": window.RDL.Localization.sftr_Text,
                "defaultText": window.RDL.Localization.placeHolderText_sftr,
                "doczonetypecd": "BODY",
                "isDefaut": false
            }, {
                "tips": "",
                "title": "",
                "sectionTypeCd": "INTR",
                "definition": "",
                "name": window.RDL.Localization.intr_Text,
                "defaultText": window.RDL.Localization.placeHolderText_intr,
                "doczonetypecd": "BODY",
                "isDefaut": false
            }, {
                "tips": "",
                "title": "",
                "sectionTypeCd": "CERT",
                "definition": "",
                "name": window.RDL.Localization.cert_Text,
                "defaultText": window.RDL.Localization.placeHolderText_cert,
                "doczonetypecd": "BODY",
                "isDefaut": false
            }, {
                "tips": "",
                "title": "",
                "sectionTypeCd": "ALNK",
                "definition": "",
                "name": window.RDL.Localization.websitePortfolios_Text,
                "defaultText": "",
                "doczonetypecd": "BODY",
                "isDefaut": false
            }, {
                "tips": "",
                "title": "",
                "sectionTypeCd": "CUST",
                "definition": "",
                "name": "",
                "defaultText": window.RDL.Localization.placeHolderText_addi,
                "doczonetypecd": "BODY",
                "isDefaut": false
            }
        ];
    }
    resourceLoaded = true;
    if (resolve)
        resolve("");
}

function handlePostPageLoad() {
    isHandlePostPageLoadCalled = true;
    if(RDL.htmlSkinRendering){
        loadStyleSheet(RDL.Paths.ResourcePath + 'styles/lc-mpr-skins-styles.css');
    }
    //Load for MPES only.
    RDL.isES && loadJs("//wchat.freshchat.com/js/widget.js");
    if (reqAccountsGuestUserCreation) {
        clearInterval(trackingApiCalled);
    } else {
        try {
            (function (d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s); js.id = id;
                js.src = window.RDL.VisitorApiSetting.JSURL;
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'visitor-jssdk'));
        }
        catch (e) {
            //alert("Error in JS");
        }
    }


    var isGuestUser = (window.RDL.UserClaims == null) ? true : (window.RDL.UserClaims != null && window.RDL.UserClaims.role == "Guest" ? true : false);
    if (RDL.isBaseRoute && RDL.GetQueryString('mode') != 'new' && RDL.GetQueryString('welcomeback') != 1
        && RDL.GetQueryString('skin') == null && RDL.GetQueryString('docid') == null && isGuestUser) {
        triggerHIWStage = true;
    }
    else {
        RDL.startPageLoader();
    }
    if (window.RDL.isRefresh) {
        if (window.isNewOnboarding) {
            loadImageFiles();
        }
        window.RDL.isloggedIn = false;
        if (window.RDL.UserClaims) {
            if (window.RDL.UserClaims.role == "User") {
                window.RDL.isloggedIn = true;
            }
            handleAliasAndIdentify();
        }
        var visitId = RDL.readCookie("vsuid");        
        AsyncSegTrack(RDL.isloggedIn, visitId);
        if (RDL.isBaseRoute) {
            window.RDL.TrackEvents('enter builder', {}, '', window.RDL.isloggedIn);
            RDL.TrackOptimizelyEvents("enter builder");
        }
        if (isGuestUser && RDL.isBaseRoute) {
            if (!isAffiliateTraffic()) {
                window.RDL.BuilderUsageTrackEvents('viewed', 'create my resume', null, window.RDL.isloggedIn, null);
            }
        }
        if (!RDL.isLCA && !RDL.isWhiteLabel) {
            loadJs(platFormJsUrl, true);
        }
        // Code to trigger Enter builder stage.
        if (triggerHIWStage && window.RDL.UserClaims && window.RDL.UserClaims.user_uid) {
            triggerHIWStage = false;
            callAjax(true, window.RDL.Paths.BaseApiUrl + 'users/saveuserstages?userId=' + RDL.UserClaims.user_uid + '&productCd=' + window.RDL.PortalSettings.ConfigureProductCd
                + "&userStageId=" + 25 + "&portalCd=" + window.RDL.PortalSettings.ConfigurePortalCd, "PATCH", true);
        }
    }
    //setCountryDetails();
    //getFeatureSet();
    RDL.Skins.forEach(function (element) {
        var img = document.createElement('img');
        if (RDL.isINTL) {
            img.src = element.blobURL;
        } else if(!isIE){
            img.src = RDL.configServiceBlobUrl + "SkinImages/" + element.skinCD.toLowerCase() + (element.skinCD.startsWith("SRZ") || element.skinCD.startsWith("TRZ") ? ".png" : ".svg");
        }
        document.getElementById('afterLoadContent').appendChild(img);
    });
    RDL.loadFile();
    var bodyDom = document.getElementsByTagName('body')[0];
    if (bodyDom.classList.contains('no-scroll')) {
        bodyDom.classList.remove('no-scroll')
    }
    var sknCD = RDL.GetQueryString('skin');
    if (sknCD) {
        var isValidSkin = false;
        if (RDL.Skins && RDL.Skins.length > 0) {
            isValidSkin = RDL.Skins.some(function (element) { return element.skinCD == sknCD.toUpperCase() });
        }
        if (isValidSkin) {
            RDL.SkinFromPortal = sknCD.toUpperCase(); //necessary to keep it in upper case
        }
    }
    var theme = RDL.GetQueryString('theme') ? unescape(RDL.GetQueryString('theme')) : null;
    if (theme) {
        RDL.SkinThemeFromPortal = theme.toLowerCase();
    }
    loadJs("https://www.google.com/recaptcha/api.js?render=explicit", true);
    loadJs("https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js", true, loadJqueryDepJs);
    if (window.RDL.IsOptimizelyEnabled) {
        loadJs("https://cdn.optimizely.com/js/" + RDL.Portal.optimizelyKey + ".js", true);
    }
    loadJs(RDL.Paths.ResourcePath + "scripts/es6/es6-shim.min.js", true, polyfillArrayFrom, true);
    //loadJs(experimentUrl, true);
    loadStyleSheet(RDL.Paths.ResourcePath + "styles/font-awesome-5/css/fontawesome5.min.css");
    if(isIT()){
        loadStyleSheet("https://fonts.googleapis.com/css?family=Allura|Dancing+Script|Dynalight|Mrs+Saint+Delafield&display=swap");
    }
    applyImageCss();
    //checkSafariBrowser();
    polyfillNodelistForeach();
    // if (RDL.UserClaims && RDL.UserClaims.user_uid) {
    //     RDL.TrackEvents('identify', { "Experiment: MPR RWZ Componentization": "Componentization" }, RDL.UserClaims.user_uid, window.RDL.isloggedIn, true);
    // }
    if (RDL.isMPR) {
        getJobTitleIndustriesSet();
    }
    setUpGoogleUploadDropBox();

    if (RDL.isloggedIn) {
        RDL.UpdatePushnami();
    }

    if (RDL.sendSpellCheckText && RDL.clientEventsUrl) {
        (function () {
            loadJs(RDL.clientEventsUrl + "/scripts/boldEventStream.js", true, function(){
                let parentHtmlNode = (document.head == null ? document.body : document.head);
                let configObject = BoldEventStream.ClassInitializers.getNewConfigurationObject();
    
                configObject.Commons.enableConsoleLogging = false;
                configObject.Commons.enableErrorThrown = false;
                configObject.Commons.defaultClientToInitialize = BoldEventStream.Enums.SendClientToUse.Ajax;
                configObject.AjaxDetails.eventsPostEndpointUrl = RDL.clientEventsUrl + "/v1/clientevents";
    
    
                BoldEventStream.InitializeBoldStreamObjectAsync(window, parentHtmlNode, configObject);
            });            
        })();
    }
}
function setExperimentLocalizationObject() {
    RDL.ExperimentsLocalization = {};      

    if (RDL.PortalExperiments.mprSkipWorkHistoryForStudent) {
        RDL.ExperimentsLocalization[RDL.PortalExperiments.mprSkipWorkHistoryForStudent.id] = {
            "Skip_Work_History_For_Student": "Do you want to leave this section blank?",
            "Skip_Work_History_Primary_Label": "ADD A TITLE",
            "Skip_Work_History_Secondary_Label": "Skip for now",
            "Skip_Work_History_For_Student_Subtitle": "It's okay to include part-time or unofficial jobs too. Here are some titles we've seen students add:",
            "Skip_Work_History_For_Student_Related_Jobtitle_List": "Volunteer,Tutor,Babysitter,Dogwalker,Teaching Assistant,Office Helper,Work Study,Data Entry Clerk"
        };
    }
    if (RDL.PortalExperiments.mprResumeCheckInterstitial) {
        RDL.ExperimentsLocalization[RDL.PortalExperiments.mprResumeCheckInterstitial.id] = {
            "Resume_Check_Popup_Heading": "your resume is off to a great start!",
            "Resume_Check_Popup_SubHeading": "Let's make it even better",
            "Resume_Check_Popup_Improve_Text": "We found {0} ways to improve your resume",
            "Resume_Check_Tip1": "We scanned your resume for 30+ issues, including spelling, grammar and length, and have feedback on what to improve.",
            "Resume_Check_Tip2": "Subscribe to see all suggestions",
            "Resume_Check_Popup_FooterText": "Subscribe to see our suggestions",
            "Resume_Check_ResumeStrenght": "Resume Strength",
            "Resume_Check_Popup_Button_Text": "Continue",
            "Resume_Check_Compact_Button_Text": "Unlock",
            "Resume_Check_Score_Perfect_Text": "Perfect",
            "Resume_Check_Score_Excellent_Text": "Excellent",
            "Resume_Check_Score_Good_Text": "Good",
            "Resume_Check_Score_Average_Text": "Average",
            "Resume_Check_Score_Fair_Text": "Fair",
            "Resume_Check_Score_Weak_Text": "Weak"
        };
    }

    if (RDL.PortalExperiments.mprJobTitleFlowPersonalizationV2) {
        RDL.ExperimentsLocalization[RDL.PortalExperiments.mprJobTitleFlowPersonalizationV2.id] = {
            "how_many_years_expr_as": "How many years of relevant experience do you have as a <br/><b>{0}</b>?",
            "how_many_years_relevant_expr": "How many years of relevant experience do you have?",
            "please_make_selection": "Please make a selection",
            "add_another": "ADD ANOTHER",
            "what_is_job_title": "What’s the job title?",
            "can_add_upto_3_job_titles": "You can add up to 3 job titles.",
            "add_atleast_one_job_title": "Please add at least one job title",
            "have_next_job_in_mind": "Do you have your next job in mind?",
            "helps_give_recommendations": "It’s ok if you don’t. This helps us give you a personalized experience while you build your resume.",
            "tip_html": "<p>Include internships, unpaid jobs, and volunteer work.</p>",
            "how_long_working": "How long have you been working?"
        };
    }

    if (RDL.PortalExperiments.lcExpandedStudentFlow) {
        RDL.ExperimentsLocalization[RDL.PortalExperiments.lcExpandedStudentFlow.id] = {
            "what_certificate_degree_pursuing": "What kind of certificate or degree are you pursuing?",
            "enter_different_degree": "Enter a different degree (e.g. PHD)",
            "please_make_selection": "Please make a selection"
        };
    }

    if (RDL.PortalExperiments.mprUpdatedRelatedJobTitles) {
        RDL.ExperimentsLocalization[RDL.PortalExperiments.mprUpdatedRelatedJobTitles.id] = {
            "relatedJobTitle_Subheading": "Get help writing your bullet points with the pre-written examples below.",
            "title_tip_text": "We recommend expert written content for this job title. Use the search box to change title and explore more content.",
            "search_tip_text": "Want to see more pre-written examples? Try searching for another title.",
            "more_job_title_text": "More job titles like",
            "show_more_text": "Show More",
            "texteditor_placeholder_text": "Type your achievements and responsibilities here"
        };
    }
    if (RDL.PortalExperiments.mpukRegisterPageDataPrivacySection) {
        RDL.ExperimentsLocalization[RDL.PortalExperiments.mpukRegisterPageDataPrivacySection.id] = {
            "norton_privacy_title": "We’re serious about</br><b>protecting your privacy</b>",
            "norton_privacy_bullet1": "Your privacy is our #1 priority.",
            "norton_privacy_bullet2": "All your personal data is secure</br> and SSL encrypted.",
            "norton_privacy_bullet3": "We’ll never share your personal</br> data without your consent.",
            "norton_privacy_bullet4": "We’re constantly updating our </br>security to continue to keep </br> your data safe.",
            "norton_review_policy": "Review our privacy policy"
        };
    }
    if (RDL.PortalExperiments.mprGuestUserFlow) {
        RDL.ExperimentsLocalization[RDL.PortalExperiments.mprGuestUserFlow.id] = {
            "continue_as_guest": "Continue as a Guest",
            "build_work_not_saved": "Build your resume—your work will not be saved",
            "based_on_reviews": "Based on 4,013 reviews",
            "youre_almost_done": "You’re almost done",
            "our_customers_hired_by": "Our <span>customers</span> have been hired by:",
            "create_an_account": "Create an Account",
            "save_edit_any_device": "Save your resume and edit it on any device",
            "dont_lose_work": "{0}, don't lose your work",
            "work_experience": "Work Experience",
            "review": "Review",
            "excellent": "Excellent"
        };
    }    
    if (RDL.PortalExperiments.lcSkillRecommendation) {
        RDL.ExperimentsLocalization[RDL.PortalExperiments.lcSkillRecommendation.id] = {
            "Skill_Recommendation_Heading": "What job is this resume for?",
            "Skill_Recommendation_Sub_Heading": "We'll show you what skills the employer wants. Enter another job title to see the top skills for it.",
            "Skill_Recommendation_Sub_Heading_v2":"We'll show you what skills the employer wants.",
            "Skill_Recommendation_Top_4_Skills": "Here are the top 4 skills for a ",
            "Skill_Recommendation_Type_JobTitle": "Search for your desired job title to view results...",
            "Skill_Recommendation_Desired_JobTitle": "Desired Job Title",
            "Skill_Recommendation_Add_Selected_Skills": "Add Selected Skills",
        };
    }
    if (RDL.PortalExperiments.lcJTAutosuggestUpdate) {
        RDL.ExperimentsLocalization[RDL.PortalExperiments.lcJTAutosuggestUpdate.id] = {
            "Suggested_Titles": "Suggested Titles",
        };
    }

    if (RDL.PortalExperiments.mprRWZSAM) {
        RDL.ExperimentsLocalization[RDL.PortalExperiments.mprRWZSAM.id] = {
            "SAM_IndustryLabel": "Your industry help us give you better advice. We won't put it on your resume.",
            "SAM_yourIndustry_text": "What's your industry?",
            "SAM_recentJobHeadingText": "Tell us about your most recent job",
            "SAM_recommendIndustryMsg": "We recommend picking 3 or less",
            "SAM_whatWeHaveText":"What we have so far",
            "dates_Label" : "Dates",
            "jobDescription_Label":"Job Description",
            "whereYouWork_Txt":"Where did you work",
            "whoEmployerText":"Who is the employer?",
            "whenYouWorkText":"When did you work there?",
            "SAM_expDesc_heading": "Here is the pre-written text we found for you",
            "SAM_expDesc_subheading" : "You can add it to your resume, edit it, or write your own.",
            "in_Text" : "in"
        };
    }

}

function handleJSCSS(data) {
    try {
        if (data.hotFixJS) {
            eval(data.hotFixJS);
        }
        if (data.hotFixCSS) {
            var css = document.createElement('style');
            css.type = 'text/css';
            css.innerHTML = data.hotFixCSS;
            document.getElementsByTagName("head")[0].appendChild(css);
        }
    }
    catch (ex) { }
}

function handleConfig(result, resolve) {
    var data = JSON.parse(result);
    handleJSCSS(data);
    RDL.htmlSkinRendering = data.htmlSkinRendering;
    RDL.Portal.gtmKey1 = data.gtmKey1;
    RDL.Portal.gtmKey2 = data.gtmKey2;
    RDL.Portal.googleMapappendGTMQueryStringsKey = data.googleMapappendGTMQueryStringsKey;
    RDL.PortalExperiments = data.portalExperiments ? data.portalExperiments : {};
    setExperimentLocalizationObject();
    RDL.Portal.optimizelyKey = data.optimizelyKey;
    window.RDL.Paths.BaseUrl = data.externalLinks.dashboardLink;
    window.RDL.Paths.SellPageUrl = data.externalLinks.paymentLink;
    window.RDL.Paths.AccountsURL = data.externalLinks.accountsURL;
    window.RDL.Paths.termsOfUseURL = data.externalLinks.termsOfUseLink;
    window.RDL.Paths.privacyURL = data.externalLinks.privacyPolicyLink;
    window.RDL.Paths.ResumeCheckUrl = data.externalLinks.resumeCheckUrl;
    window.RDL.Paths.rootURL = data.externalLinks.rootURL;
    window.RDL.Paths.rguURL = data.externalLinks.rguURL;
    window.RDL.Paths.contactUsURL = data.externalLinks.contactusLink;
    window.RDL.Paths.mysettingsURL = data.externalLinks.mysettingLink;
    window.RDL.Paths.signoutURL = data.externalLinks.signOutUrl;
    window.RDL.Paths.signInURL = data.externalLinks.signInUrl;
    window.RDL.Paths.documentHomeUrl = data.externalLinks.documentHome;
    window.RDL.ExternalJavascripts = data.externalJavascripts;
    window.RDL.Paths.forgetPwdLink = data.externalLinks.forgetPwdLink;
    RDL.oldUrl = data.externalLinks.oldEditorUrl && data.externalLinks.oldEditorUrl.trim() != "" ? data.externalLinks.oldEditorUrl : null;
    RDL.PortalSettings.defaultPortalType = "3";
    RDL.PortalSettings.ConfigurePortal = data.portalID;
    RDL.PortalSettings.ConfigurePortalCd = data.portalCD;
    RDL.PortalSettings.ConfigureProductId = data.productID;
    RDL.PortalSettings.ConfigureProductCd = data.productCD;
    RDL.PortalSettings.ConfigurePortalName = data.portalName;
    RDL.PortalSettings.ShareResumeURL = data.externalLinks.shareUrl;
    window.RDL.VisitorApiSetting.JSURL = data.externalLinks.visitorAPIUrl;
    window.RDL.VisitorApiSetting.EnvMode = data.environment;
    window.RDL.VisitorApiSetting.PRODUCT_CODE = data.productCD;
    window.RDL.VisitorApiSetting.AccountCode = data.clientCD;
    window.RDL.segmentKey = data.segmentKey;
    segmentKey = data.segmentKey;
    window.RDL.BestJobMatchDelayTime = data.bestJobMatchDelayTime;
    window.RDL.googleClientID = data.googleLoginClientID;
    window.RDL.facebookClientID = data.facebookAppId;
    window.RDL.isTTCAddOrRemove = true;
    window.RDL.newRelicApplicationID = data.newRelicApplicationID;
    window.RDL.customerServiceEmailId = data.customerServiceEmailId;
    window.RDL.templateId = RDL.Portal.templateId ? RDL.Portal.templateId : "-3";
    window.RDL.steps = data.steps ? data.steps : undefined;
    window.RDL.styleSheetName = data.styleSheetName ? data.styleSheetName : "RbtoHtml2";
    window.RDL.multiColumnStyleSheetName = data.multiColumnStyleSheetName;
    window.RDL.intentcdMapping = data.intentcdMapping;
    window.RDL.enableCompanyAPIForUS = data.enableCompanyAPIForUS;
    window.RDL.configServiceBlobUrl = data.externalLinks.configSvcBlobUrl;
    window.RDL.EB3DownloadUrl = data.externalLinks.eb3DownloadUrl;
    window.RDL.EB4DownloadUrl = data.externalLinks.eb4DownloadUrl;
    window.RDL.CoverLetterUrl = data.externalLinks.coverLetterUrl;
    window.RDL.RenewSuspendedSubscription = data.externalLinks.renewSuspendedSubscription;
    window.RDL.ResumeReviewUrl = data.externalLinks.resumeReviewUrl;
    window.RDL.ResumeWritingUrl = data.externalLinks.resumeWritingUrl;
    window.RDL.IsOptimizelyEnabled = data.optimizelyEnabled != undefined ? Boolean(data.optimizelyEnabled) : true;
    window.RDL.trackExperimentsFromAPI = data.trackExperimentsFromAPI ? data.trackExperimentsFromAPI : false;
    window.RDL.ResumePreview = { showPreview: data.showResumePreview === true ? true : false, previousState: [] };
    window.RDL.maxloopCount = data.maxloopCount ? data.maxloopCount : RDL.maxloopCount;
    window.RDL.IsGDPREnable = data.Enable_GDPR;
    window.RDL.googleRecaptchaSiteKey = data.googleRecaptchaSiteKey;
    window.RDL.IsLCSEOFlow = false;
    window.RDL.DebounceTime = data.googleMapsDebounceTime ? parseInt(data.googleMapsDebounceTime) : 0;
    window.RDL.cultureCD = data.languageCulture;
    window.RDL.isDegreeDataLocal = data.isDegreeDataLocal || false;
    window.RDL.showContactExtraDetails = data.enableAdditionalFields || false;
    window.RDL.arrSkinOrder = data.skinOrder;
    window.RDL.sendSpellCheckText = data.externalLinks.clientEventsUrl ? true : false;
    window.RDL.clientEventsUrl = data.externalLinks.clientEventsUrl;

    //Need to remove this after this is config driven for all portals 
    if (window.RDL.isINTL) {
        window.RDL.Definition_Tips = data.definition_tips;
        window.RDL.intlPhotoSkins = "ATA1 MTA3 MCA2 MLU4 MLU6 MLU5 MLU7 MLF1 MLF2 MLF3 MLF4 MLF5 MLF6 MLI1 MLJ1 MLJ2 MLJ3 MLJ4 MLJ5 MLJ6 MLJ7 MLI6";
        window.RDL.roundPhotoSkins = "MLJ2 MLJ5";
        window.RDL.PopularSkins = data.popularSkins || " ";
        window.RDL.NewSkins = data.newSkins || " ";
        if (data.portalCD == 'MFR') {
            window.RDL.PopularSkins = "MLT6 MLU4 MLF6";
            window.RDL.NewSkins = "MLF1 MLF2 MLF3";
        }
        if(data.templateId){
            window.RDL.templateId = data.templateId ; 
    }
    }
    window.RDL.Skins = data.skins;
    window.RDL.colorsList = data.coloursList || null ;
    window.RDL.date = (new Date(2017, 10, 23));
    window.RDL.randomPhotoNumber = Math.random();
    window.RDL.googleRecaptchaSiteKey = data.googleRecaptchaSiteKey;
    window.RDL.templatesMappingToExprLevel = data.templatesMappingToExprLevel;
    window.RDL.variationMappingToTempOrder = data.variationMappingToTempOrder;
    window.RDL.UserConsent = window.RDL.isINTL ? true : !data.checkUserConsent;
    window.RDL.recommendationActionCodes = data.recommendationActionCodes;
    if (!window.RDL.UserConsent) {
        window.RDL.UserConsent = document.cookie.search(/consent=1/) > -1;
    }

    window.RDL.enableNewRelic = data.enableNewRelic;
    if (data.enableNewRelic) {
        addNewRelic(data.newRelicApplicationID);
    }
    if (RDL.isES && data.enableFreshChat == true) {
        window.RDL.freshChatToken = data.freshChatToken;
        window.RDL.freshChatTag = data.freshChatTag;
    }
    window.RDL.executeBuilderStepFlow = RDL.isBaseRoute && !!getBuilderStep() && data.enableDirectFlow;
    var templateFlow = window.RDL.GetQueryString('templateflow');
    var docID = window.RDL.GetQueryString('docid')
    if (templateFlow && templateFlow.toLowerCase() == 'contact' && docID) {
        window.RDL.executeBuilderStepFlow = false;
    }

    var logoptimizelyevents = window.RDL.GetQueryString('logoptimizelyevents');
    window.RDL.LogOptimizelyEvents = true;
    if (logoptimizelyevents && logoptimizelyevents.toLowerCase() == 'false') {
        window.RDL.LogOptimizelyEvents = false;
    }

    if (!window.RDL.isINTL) {
        data.skins.forEach(function (s) {
            s.blobUrl = data.externalLinks.configSvcBlobUrl + "SkinImages/" + s.skinCD.toLowerCase() + (s.skinCD.startsWith("SRZ") || s.skinCD.startsWith("TRZ") ? ".png" : ".svg");
            s.imageURL = data.externalLinks.configSvcBlobUrl + "SkinImages/" + s.skinCD.toLowerCase() + (s.skinCD.startsWith("SRZ") || s.skinCD.startsWith("TRZ") ? ".png" : ".svg");
            s.htmlURL = data.externalLinks.configSvcBlobUrl + s.skinCD + ".htm";
        });
    } else {
        data.skins.forEach(function (s) {
            if (s.blobURL && s.blobURL.substring(0, 1) == "/") {
                s.blobURL = s.blobURL.substring(1, s.blobURL.length); //remove head slash
            }
            s.imageURL = RDL.Paths.ResourcePath + s.blobURL;
            s.blobURL = RDL.Paths.ResourcePath + s.blobURL;
            s.htmlURL = getSkinHtmlPath() + s.skinCD + ".htm";
        });
    }
    configLoaded = true;
    downLoadAccountsJs();
    try {
        // try {
        //     (function (d, s, id) {
        //         var js, fjs = d.getElementsByTagName(s)[0];
        //         if (d.getElementById(id)) return;
        //         js = d.createElement(s); js.id = id;
        //         js.src = window.RDL.VisitorApiSetting.JSURL;
        //         fjs.parentNode.insertBefore(js, fjs);
        //     }(document, 'script', 'visitor-jssdk'));
        // }
        // catch (e) {
        //     //alert("Error in JS");
        // }
        function callTrackingApi() {
            if (typeof TS != 'undefined') {
                //TS.Track(window.RDL.VisitorApiSetting.PRODUCT_CODE, window.RDL.PortalSettings.ConfigurePortalCd, true, true);
                clearInterval(trackingApiCalled);
            }
        }
        clearInterval(trackingApiCalled);
        trackingApiCalled = setInterval(callTrackingApi, 200);
        if (resolve)
            resolve('');
    }
    catch (e) {
        console.log("error in visitlog");
    }
    setInterval(function () {
        window.RDL.IsUserExist();
    }, 15 * 60 * 1000);
    //getFeatureSet();

    RDL.dropBoxDriveKey = data.dropBoxAPI && data.dropBoxAPI.key ? data.dropBoxAPI.key : 'qpw0ky3psxs3hsz'; // personal test key :'qpw0ky3psxs3hsz'; 
    RDL.googlePickerInfo = data.googlePickerAPI;

    RDL.cloningSourceUserId = data.cloningSourceUserId;
}

function setUpGoogleUploadDropBox() {
    if (RDL.isMPROrMPCL || RDL.isLCA) {

        loadJsWithKey("https://www.dropbox.com/static/api/2/dropins.js", "dropboxjs", RDL.dropBoxDriveKey);

        if (!RDL.googlePickerInfo) {
            // personal test key
            RDL.googlePickerInfo = {
                "developerKey": "AIzaSyBrCK5V3-4CF6jf0XxudVGJETxD5DNYfJo",
                "clientId": "865460071118-mp86e6c7dslk20qnqb504cjfoag79olg.apps.googleusercontent.com",
                "appId": "865460071118"
            };
        }
        loadJs("https://apis.google.com/js/api.js?onload=loadPicker");
    }
}

function isAffiliateTraffic() {
    var afltTrafic = false;
    var templateFlow = window.RDL.GetQueryString('templateflow');
    var hiwBDFlow = window.RDL.GetQueryString('bdflow');
    if ((window.RDL.readCookie('BDLP') != null && hiwBDFlow == null) || window.RDL.readCookie('lp') == 'MPRUKZLP06' || templateFlow || window.RDL.executeBuilderStepFlow) {
        afltTrafic = true;
    }
    return afltTrafic;
}

function getBuilderStep() {
    var builderStep = window.RDL.GetQueryString('builderstep');
    if (builderStep) {
        if (isIPAD() && builderStep == 'selectresume') {
            builderStep = "contact";
        }
        else if (builderStep == 'finalize') {
            builderStep = "addsection";
        }
        window.RDL.createCookie('builderstep', builderStep.toLowerCase(), null);
    }
    return builderStep;
}

function isTemplateFlow() {
    var isValidTemplateFlow = false;
    var templateFlow = window.RDL.GetQueryString('templateflow');
    if (templateFlow && RDL.isBaseRoute && (templateFlow.toLowerCase() == 'selectresume' || templateFlow.toLowerCase() == 'contact' || templateFlow.toLowerCase() == 'choosetemplate')) {
        RDL.templateFlowValue = templateFlow.toLowerCase();
        if (isIPAD() && RDL.templateFlowValue == 'selectresume') {
            RDL.templateFlowValue = "contact";
        }
        isValidTemplateFlow = true;
    }
    return isValidTemplateFlow;
}

function isLP27Flow() {
    var isLP27Flow = false;
    if (window.RDL.readCookie('BDLP') != null && RDL.isBaseRoute) {
        isLP27Flow = true;
    }
    return isLP27Flow;
}

function handleSkins() {
    RDL.Skins.filter(function (skin) {
        return skin.skinCD !== RDL.selectedSkin;
    }).forEach(function (skin) {
        var skinName = skin.skinCD + '.htm';
        RDL.getSkinHtml(skinName, true);
    });
}
function getSkinHtmlPath() {
    var skinPath = RDL.configServiceBlobUrl;
    return skinPath;
}

function termConditions(event) {
    event.preventDefault();
    if (RDL.isLCA) {
        window.open('/terms-of-use');
    }
    else if (RDL.isMPROrMPCL || RDL.isINTL) {
        window.open('/information/termsofuse.aspx');
        //window.open('/information/termsofuse.aspx', 'livecareer', 'width=780,height=550,scrollbars=1,toolbar=0,resizable=1,menubar=0');
    } else {
        window.open(RDL.Paths.termsOfUseURL);
    }
}

function privacyPolicy(event) {
    event.preventDefault();
    if (RDL.isLCA) {
        window.open('/privacy-policy');
    }
    else if (RDL.isMPROrMPCL || RDL.isINTL) {
        window.open('/information/privacy.aspx');
        // window.open('/information/privacy.aspx', 'livecareer', 'width=780,height=550,scrollbars=1,toolbar=0,resizable=1,menubar=0');
    } else {
        window.open(RDL.Paths.privacyURL);
    }
}

function getGAClientId() {
    var clientId = "";
    window.ga && ga(function (tracker) {
        clientId = tracker.get('clientId');
    });
    return clientId;
}

function clearAndRedirect(redirectPath) {
    if (!isRedirectDone) {
        RDL.logMessage += "\n login Claims Call cookiecollection - " + document.cookie + "\n";
        RDL.logMessage += "\n Cookie Enabled - " + navigator.cookieEnabled + "\n";
        let errorObj = {
            ErrorMessage: 'RWZV2 Logging-' + redirectPath + RDL.logMessage, LogAsInfo: true
        }
        callAjax(true, window.RDL.Paths.BaseApiUrl + 'error/log', 'POST', true, true, function () {
            RemoveSelectedIndustryFromLocalStorage(); // clear local storage
            RDL.logMessage = "";
            isRedirectDone = true;
            window.RDL.delete_cookie(BoldAuthCookieName, window.RDL.Portal.cookieDomain);
            window.RDL.delete_cookie("userinfo", window.RDL.Portal.cookieDomain);
            window.RDL.delete_cookie("UserStatus", window.RDL.Portal.cookieDomain);
            window.RDL.delete_cookie("useruid", window.RDL.Portal.cookieDomain);
            window.RDL.delete_cookie("guestUserId", window.RDL.Portal.cookieDomain);
            window.RDL.delete_cookie("guestUserId");
            if (window.indexedDB) {
                window.indexedDB.deleteDatabase("localforage");
            }
            window.location = redirectPath;
        }, null, JSON.stringify(errorObj));
    }
}
function forceRedirect(redirectPath) {
    if (!isRedirectDone) {
        RDL.logMessage += "\n login Claims Call cookiecollection - " + document.cookie + "\n";
        RDL.logMessage += "\n Cookie Enabled - " + navigator.cookieEnabled + "\n";
        let errorObj = {
            ErrorMessage: 'RWZV2 Logging-' + redirectPath + RDL.logMessage, LogAsInfo: true
        }
        callAjax(true, window.RDL.Paths.BaseApiUrl + 'error/log', 'POST', true, true, function () {
            RDL.logMessage = "";
            isRedirectDone = true;
            window.location = redirectPath;
        }, null, JSON.stringify(errorObj));
    }
}
function createGuestUser() {
    RDL.logMessage += "\n createGuestUser called.";
    if (!RDL.isINTL) {
        if (typeof BOLD == "object" && typeof BOLD.Accounts.createGuest == 'function') {
            window.RDL.createUserCallCounter++;
            clearTimeout(window.RDL.createUserTimer);
            window.RDL.createUserTimer = setTimeout(function () {
                window.RDL.createUserCallCounter = 0;
            }, window.RDL.loopTimeGapInSec * 1000);
            RDL.logMessage += "\n createGuestUser createUserCallCounter" + window.RDL.createUserCallCounter;
            if (window.RDL.createUserCallCounter > window.RDL.maxloopCount) {
                clearAndRedirect("/?forceRedirect=StuckInUserCreation")
            }
            isAccUserCalled = true;
            BOLD.Accounts.createGuest(window.RDL.PortalSettings.ConfigureProductCd, null, location.href).then(function (data) {
                clearInterval(createGuestUserTimer);
                PostGuestCreated(data.GuestUserID);
            }, function (error) {
                clearAndRedirect("/?forceRedirect=StuckInUserCreation");
                clearInterval(createGuestUserTimer);
            });
            clearInterval(createGuestUserTimer);
        }
    }
    else {
        if (typeof CreateGuestUser == 'function') {
            var refCookieId = "14";
            var refCookie = window.RDL.readCookie("ref");
            if (refCookie != null && refCookie != undefined) {
                refCookieId = refCookie
            }

            window.RDL.createUserCallCounter++;
            clearTimeout(window.RDL.createUserTimer);
            window.RDL.createUserTimer = setTimeout(function () {
                window.RDL.createUserCallCounter = 0;
            }, window.RDL.loopTimeGapInSec * 1000);
            RDL.logMessage += "\n createGuestUser createUserCallCounter" + window.RDL.createUserCallCounter;
            if (window.RDL.createUserCallCounter > window.RDL.maxloopCount) {
                clearAndRedirect("/?forceRedirect=StuckInUserCreation")
            }
            isAccUserCalled = true;
            CreateGuestUser(window.RDL.Portal.portalId, window.RDL.Paths.AccountsURL, refCookieId);
            clearInterval(createGuestUserTimer);
        }
    }
}

function generateClaims() {
    if (typeof setguestuserclaims == 'function') {
        setguestuserclaims(userUIdFrmExtrnlSite, 'RWZ', window.RDL.Paths.AccountsURL);
        clearInterval(generateClaimsTimer);
    }
}

function PostGuestCreated(userUID, claimCall) {
    window.RDL.userId = userUID;
    if (!userUID && window.RDL.readCookie(BoldAuthCookieName) == null && RDL.readCookie("userinfo") && RDL.readCookie("userinfo").length > 0) {
        // case: if Boldauth is missing & only old userinfo exists & userid comes null from accounts, so clear the userInfo cookie.
        window.RDL.delete_cookie("userinfo", window.RDL.Portal.cookieDomain);
    }

    if (claimCall == null) {
        window.RDL.Claims(handleClaims);
    }
    else {
        clearInterval(postGuestUserTimer);
        postGuestUserTimer = setInterval(function () {
            handlePostGuestCreated(userUID);
        }, 200);
    }
}

function handlePostGuestCreated() {
    window.RDL.createCookie('guestUserId', window.RDL.userId, null);
    if (window.appEntry && postGuestCreatedCalled == false && window.RDL.UserClaims) {
        postGuestCreatedCalled = true;
        clearInterval(postGuestUserTimer);
        if(window.appEntry.isPostGuestUserCreationProcessingCalled == false){
            window.appEntry.postGuestUserCreationProcessing();
        }
        if(!RDL.isINTL && isHandlePostPageLoadCalled == false){
            handlePostPageLoad();
        }
    }
}

function postRegisterMethod(newUser, targetUrl, userId) {
    window.RDL.createCookie('guestUserId', '', null);
    window.login.handleResponse(userId, newUser);
}

function postLoginMethod(redirectUrl, userId) {
    window.RDL.createCookie('guestUserId', '', null);
    window.login.handleResponse(userId);
}

function postRegisterError(errorMessage) {
    var result = null;
    if (errorMessage == "FAILED_ALREADY_REGISTER") {
        result = -1;
    }
    window.login.handleResponse(result);
}

function PostGuestRegistered(userUID, response) {
    window.RDL.createCookie('guestUserId', '', null);
    window.login.handleGuestRegisteredResponse(userUID, response);
}

function PostDirectForgotPassword(response) {
    window.RDL.createCookie('guestUserId', '', null);
    window.login.handleForgotPasswordResponse(response);
}

function getPortalInfo() {
    var domain = window.location.host.split(':')[0].substr(window.location.host.indexOf('.') + 1);
    var portalCd = null;
    var portalUrl = null;
    switch (domain) {
        case "livecareer.com":
            portalCd = "lca";
            portalUrl = "livecareer.com";
            basePath = "/build-resume";
            defaultSkin = "CBG1";
            portalId = "3";
            templateId = "-3";
            downLoadAccountsLoginJs = true;
            cookieDomain = ".livecareer.com";
            RDL.isLCA = true;
            RDL.cultureCD = "en-US";
            break;
        case "myperfectresume.com":
            portalCd = "mpr";
            portalUrl = "myperfectresume.com";
            basePath = "/build-resume";
            defaultSkin = "CBG1";
            portalId = "16";
            templateId = "-3";
            downLoadAccountsLoginJs = true;
            cookieDomain = ".myperfectresume.com";
            RDL.isMPR = true;
            RDL.isMPROrMPCL = true;
            RDL.cultureCD = "en-US";
            break;
        case "myperfectcv.co.uk":
            portalCd = "muk";
            portalUrl = "myperfectcv.co.uk";
            basePath = "/build-cv";
            defaultSkin = "CBA1";
            portalId = "29";
            templateId = "1662";
            downLoadAccountsLoginJs = false;
            cookieDomain = ".myperfectcv.co.uk";
            RDL.cultureCD = "en-GB";
            RDL.isMPUK = true;
            RDL.enableResumeCheck = false;
            break;
        case "moncvparfait.fr":
            portalCd = "mfr";
            portalUrl = "moncvparfait.fr";
            basePath = "/creer-cv";
            defaultSkin = "CBA1";
            portalId = "32";
            templateId = "-5";
            downLoadAccountsLoginJs = false;
            cookieDomain = ".moncvparfait.fr";
            RDL.cultureCD = "fr-FR";
            break;
        case "micvideal.es":
            portalCd = "mes";
            portalUrl = "micvideal.es";
            basePath = "/crear-cv";
            defaultSkin = "CBA1";
            portalId = "33";
            templateId = "1660";
            downLoadAccountsLoginJs = false;
            cookieDomain = ".micvideal.es";
            RDL.cultureCD = "es-ES";
            break;
        case "meucurriculoperfeito.com.br":
            portalCd = "mbr";
            portalUrl = "meucurriculoperfeito.com.br";
            basePath = "/criar-curriculo";
            defaultSkin = "CBA1";
            portalId = "62";
            templateId = "-6";
            downLoadAccountsLoginJs = false;
            cookieDomain = ".meucurriculoperfeito.com.br";
            RDL.cultureCD = "pt-BR";
            break;
        case "ilcvperfetto.it":
            portalCd = "mit";
            portalUrl = "ilcvperfetto.it";
            basePath = "/crea-curriculum";
            defaultSkin = "CBA1";
            portalId = "37";
            templateId = "-7";
            downLoadAccountsLoginJs = false;
            cookieDomain = ".ilcvperfetto.it";
            RDL.cultureCD = "it-IT";
            break;
        case "myperfectcoverletter.com":
            portalCd = "mpc";
            portalUrl = "myperfectcoverletter.com";
            basePath = "/build-resume";
            defaultSkin = "CBG1";
            portalId = "20";
            templateId = "-3";
            downLoadAccountsLoginJs = false;
            cookieDomain = ".myperfectcoverletter.com";
            RDL.isMPCL = true;
            RDL.isMPROrMPCL = true;
            RDL.cultureCD = "en-US";
            break;
        case "zety.com":
            portalCd = "zty";
            portalUrl = "zety.com";
            basePath = "/resume";
            defaultSkin = "SRZ1";
            portalId = "84";
            templateId = "-3";
            downLoadAccountsLoginJs = true;
            cookieDomain = ".zety.com";
            RDL.isZTY = true;
            RDL.isWhiteLabel = true;
            RDL.cultureCD = "en-US";
            break;
        case "hloom.com":
            portalCd = "hlm";
            portalUrl = "hloom.com";
            basePath = "/build-resume";
            defaultSkin = "SRZ1";
            portalId = "67";
            templateId = "-3";
            downLoadAccountsLoginJs = true;
            cookieDomain = ".hloom.com";
            RDL.isHLM = true;
            RDL.cultureCD = "en-US";
            RDL.isWhiteLabel = false;
            break;
        case "jobhero.com":
            portalCd = "jbh";
            portalUrl = "jobhero.com";
            basePath = "/build-resume";
            defaultSkin = "SRZ1";
            portalId = "78";
            templateId = "-3";
            downLoadAccountsLoginJs = true;
            cookieDomain = ".jobhero.com";
            RDL.isJBH = true;
            RDL.isWhiteLabel = true;
            break;
    }
    return {
        portalCd: portalCd, url: portalUrl, slug: basePath, defaultSkin: defaultSkin, portalId: portalId, templateId: templateId,
        downLoadAccountsLoginJs: downLoadAccountsLoginJs, cookieDomain: cookieDomain
    };
}

function isMac() {
    if (navigator.userAgent.match(/Mac OS/i))
        return true;
    else
        return false;
}

window.RDL = window.RDL || {};


RDL.UserExperiments = {};
RDL.LCDOTCom = "livecareer.com";
RDL.builderVersion = "rb wizard";
RDL.previousDocuments = [];
RDL.avoidLoggedinCss = false;
RDL.showHeader = true;
RDL.prevDocTabVisible = false;
RDL.Localization = "";
RDL.Definition_Tips = [];
RDL.UserConsent = false;
RDL.strategyId = 14;
RDL.isMPR = false;
RDL.isLCA = false;
RDL.isMPCL = false;
RDL.isMPROrMPCL = false;
RDL.isZTY = false;
RDL.isHLM = false;
RDL.isJBH = false;
RDL.isWhiteLabel = false;
RDL.Portal = window.RDL.Portal || getPortalInfo();
RDL.mapsClientKey = "gme-boldna";
RDL.isloggedIn = false;
RDL.gatriggeredFor = "";
RDL.EnterBuildertriggered = false;
RDL.pageLoaded = false;
RDL.applyCardCss = false;
RDL.UserConsent = true;
RDL.Paths = {};
RDL.Paths.ResourcePath = getResourceUrl();
window.globalCompVars = {};
window.globalCompVars.BaseApiUrl = RDL.Paths.BaseApiUrl = getApiUrl();
window.globalCompVars.BaseApiUrlV2 = RDL.Paths.BaseApiUrlV2 = getApiUrl(true);
RDL.Paths.BasePath = RDL.Portal.slug || RDL.Portal.basePath;
RDL.Paths.ImageBasePath = window.RDL.Paths.ResourcePath + "images/desktop/";
RDL.Paths.termsOfUseURL = '';
RDL.Paths.privacyURL = '';
RDL.Paths.signoutURL = '';
RDL.Paths.mysettingsURL = '';
RDL.Paths.contactUsURL = '';
RDL.executeDirectFunnelFlow = false;
RDL.IsOptimizelyEnabled = true;
RDL.VisitorApiSetting = {};
RDL.PortalSettings = {};
RDL.Skins = {};
RDL.segmentKey = '';
RDL.guestUserID = null;
RDL.guestUserCreated = false;
RDL.isRefresh = true;
RDL.isBack = true;
RDL.isOverviewBack = false;
RDL.isEditingFinished = false;
RDL.loadedPageCalled = false;
RDL.googleClientID = '';
RDL.facebookClientID = '';
RDL.scrollPos = 0;
RDL.maintainScroll = false;
RDL.Content = [];
RDL.files = [];
RDL.WindowH = window.innerHeight;
RDL.Paths.signInURL = '';
RDL.currentZoomValue = 1.5;
RDL.dragCurrentZoomValue = 1.5;
RDL.currentZoomIndex = 2;
RDL.OnBoarding_Popup = true;
RDL.isBlankName = false;
RDL.isdragMove = true;
RDL.isTablet = navigator.userAgent.match(/iPad/i) != null;
RDL.isJobHero = /jobhero/i.test(window.location.pathname);
RDL.countryDetails = { countryCode: "", continentCode: "", isEuropianContinent: false, city: "", state: "", isEEACountry: false };
RDL.INVALID_ATTEMPT = 'fpcount';
RDL.isRWZFlow = true; //To be done conditionally
RDL.environmentURL = '';
RDL.maxloopCount = 5;
RDL.loopTimeGapInSec = 5;
RDL.createUserCallCounter = 0;
RDL.createUserTimer = undefined;
RDL.claimCallTimer = undefined;
RDL.userId = null;
RDL.isBDFlow = false;
RDL.builderStepValue = null;
RDL.templateFlowValue = null;
RDL.SkinFromPortal = null;
RDL.SkinThemeFromPortal = null;
RDL.claimCallCounter = 0;
RDL.ArrayFeatureSet = [];
RDL.JobTitleContentDetails = { experimentID: "", variation: "" }
RDL.EmployerContentDetails = { experimentID: "", variation: "" }
RDL.isBaseRoute = (location.pathname == RDL.Paths.BasePath || location.pathname == RDL.Paths.BasePath + '/');
RDL.isINTL = isINTL();
if (RDL.isTablet) {
    $html.classList.add("ipad");
}
RDL.defaultSkin = RDL.Portal.defaultSkin;
RDL.selectedSkin = '';
RDL.TTCSectionTypeCds = ["EXPR", "EDUC", "SKLL", "SUMM", "HILT", "ACTI", "CERT", "ACCM", "INTR"];
RDL.LogOptimizelyEvents = true;
RDL.ShowResumeCheck = false;

RDL.OnBoardingSteps = (function (data) {
    var result = {};
    var steps = data || ["CHOOSE_TEMPLATE", "RESUME_OPTIONS", "NAME", "LOGIN", "CONGRATS"];
    for (i = 0; i < steps.length; i++) {
        result[steps[i]] = steps[i];
    }
    result.steps = steps;
    return result;
})();

RDL.CreateGuestUser = function () {
    reqAccountsGuestUserCreation = true;
    RDL.logMessage += "\n RDL.CreateGuestUser called.";
    clearInterval(createGuestUserTimer);
    createGuestUserTimer = setInterval(createGuestUser, 200);
}

RDL.GenerateClaims = function () {
    clearInterval(generateClaimsTimer);
    generateClaimsTimer = setInterval(generateClaims, 200);
}

RDL.isNullOrWhitespace = function (input) {
    if (input == null || input == undefined) return true;
    return input.replace(/\s/g, '').length < 1;
}

RDL.createCookie = function (name, value, days, domain) {
    var expires = "";
    var _domain = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else
        expires = "";

    if (domain) {
        _domain = "; domain=" + domain;
    }
    else if (RDL.Portal.cookieDomain) {
        _domain = "; domain=" + RDL.Portal.cookieDomain;
    }
    document.cookie = name + "=" + value + expires + _domain + "; path=/;";
}


RDL.readCookie = function (name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

RDL.GetElementPosition = function (element) {
    return $(element).offset();
}

RDL.GetQueryString = function (field) {
    var href = window.location.href;
    var reg = new RegExp('[?&]' + field + '=([^&#]*)', 'i');
    var string = reg.exec(href);
    return string ? string[1] : null;
};

RDL.GetNewText = function (editorText, tempText) {
    var div = $('<div>');
    var con = $(editorText);
    div.html(con);
    var innerText = div.text();
    if (innerText != tempText) {
        $(div.children()[0]).text(tempText);
        editorText = div.html();
    }
    return editorText;
}

RDL.TrackOptimizelyEvents = function (eventName) {
    if (window.RDL.LogOptimizelyEvents) {
        if (window.RDL.UserConsent) {
            if (typeof TrackOptimizelyEvents == 'function') {
                TrackOptimizelyEvents(eventName);
            }
            else {
                var TrackOptimizelyEventsInterval = setInterval(function () {
                    if (typeof TrackOptimizelyEvents == 'function') {
                        TrackOptimizelyEvents(eventName);
                        clearInterval(TrackOptimizelyEventsInterval);
                    }
                }, 500);
            }
        }
    }
}

RDL.AnimateToPosition = function (topPosition, duration, callback) {
    if (duration == null || duration == undefined) { duration = 400; }
    $("html, body").animate({ scrollTop: topPosition }, duration, function () {
        if (callback) { callback(); }
    });
}

RDL.trackPageView = function (url, isPostRegistration) {
    if (window.RDL.UserConsent)
        pixelTimer = setInterval(function () { firePixel(url, isPostRegistration); }, 100);
};

RDL.Timer = (function () {
    var time = 0;
    var lastSaved = "Last Saved ";
    var formattedTime = "";
    var interval = null;

    var init = function () {
        interval = setInterval(currentTime, 60000);
    }

    var setTimerNode = function () {
        var timer = document.getElementById("timer");
        if (timer) {
            timer.innerText = getFormattedTime();
        }
    }

    var currentTime = function () {
        time++;
        setTimerNode();
    }

    var getFormattedTime = function () {
        formattedTime = lastSaved + time;
        if (time == 0) {
            formattedTime = lastSaved + "Just Now";
        }
        else if (time == 1) {
            formattedTime += " minute ago";
        }
        else if (time > 1 && time <= 59) {
            formattedTime += " minutes ago";
        }
        else {
            formattedTime = lastSaved + "Over an hour ago";
        }
        return formattedTime;
    }

    var reset = function () {
        time = 0;
        setTimerNode();
        clearInterval(interval);
        init();
    }

    return {
        init: init,
        getFormattedTime: getFormattedTime,
        reset: reset
    };
}());

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}

String.prototype.insert = function (index, string) {
    if (index > 0)
        return this.substring(0, index) + string + this.substring(index, this.length);
    else
        return string + this;
};

if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
    Element.prototype.closest = function (s) {
        var el = this;
        if (!document.documentElement.contains(el)) return null;
        do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
}

RDL.preventKeys = function (event) {
    if (event.which === 13) {
        event.preventDefault();
    }
};

RDL.SHA256 = function (s) {
    var chrsz = 8;
    var hexcase = 0;
    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }
    function S(X, n) { return (X >>> n) | (X << (32 - n)); }
    function R(X, n) { return (X >>> n); }
    function Ch(x, y, z) { return ((x & y) ^ ((~x) & z)); }
    function Maj(x, y, z) { return ((x & y) ^ (x & z) ^ (y & z)); }
    function Sigma0256(x) { return (S(x, 2) ^ S(x, 13) ^ S(x, 22)); }
    function Sigma1256(x) { return (S(x, 6) ^ S(x, 11) ^ S(x, 25)); }
    function Gamma0256(x) { return (S(x, 7) ^ S(x, 18) ^ R(x, 3)); }
    function Gamma1256(x) { return (S(x, 17) ^ S(x, 19) ^ R(x, 10)); }
    function core_sha256(m, l) {
        var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2);
        var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
        var W = new Array(64);
        var a, b, c, d, e, f, g, h, i, j;
        var T1, T2;
        m[l >> 5] |= 0x80 << (24 - l % 32);
        m[((l + 64 >> 9) << 4) + 15] = l;
        for (var i = 0; i < m.length; i += 16) {
            a = HASH[0];
            b = HASH[1];
            c = HASH[2];
            d = HASH[3];
            e = HASH[4];
            f = HASH[5];
            g = HASH[6];
            h = HASH[7];
            for (var j = 0; j < 64; j++) {
                if (j < 16) W[j] = m[j + i];
                else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
                T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
                T2 = safe_add(Sigma0256(a), Maj(a, b, c));
                h = g;
                g = f;
                f = e;
                e = safe_add(d, T1);
                d = c;
                c = b;
                b = a;
                a = safe_add(T1, T2);
            }
            HASH[0] = safe_add(a, HASH[0]);
            HASH[1] = safe_add(b, HASH[1]);
            HASH[2] = safe_add(c, HASH[2]);
            HASH[3] = safe_add(d, HASH[3]);
            HASH[4] = safe_add(e, HASH[4]);
            HASH[5] = safe_add(f, HASH[5]);
            HASH[6] = safe_add(g, HASH[6]);
            HASH[7] = safe_add(h, HASH[7]);
        }
        return HASH;
    }
    function str2binb(str) {
        var bin = Array();
        var mask = (1 << chrsz) - 1;
        for (var i = 0; i < str.length * chrsz; i += chrsz) {
            bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i % 32);
        }
        return bin;
    }
    function Utf8Encode(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    }
    function binb2hex(binarray) {
        var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var str = "";
        for (var i = 0; i < binarray.length * 4; i++) {
            str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) +
                hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
        }
        return str;
    }
    s = Utf8Encode(s);
    return binb2hex(core_sha256(str2binb(s), s.length * chrsz));
}

RDL.TrackEvents = function (eventName, eventpropval, userid, islogin, skipTraitsToIterable) {
    if (window.RDL.UserConsent) {
        if (RDL.UserClaims && RDL.UserClaims.user_uid) {
            if (eventpropval != null)
                eventpropval["userId"] = RDL.UserClaims.user_uid;
            else
                eventpropval = { 'userId': RDL.UserClaims.user_uid };
        }
        if (typeof analytics != 'undefined' && typeof mixpanel != 'undefined' && typeof mixpanel.get_distinct_id != 'undefined') {
            trackEvent(eventName, eventpropval, userid, islogin, skipTraitsToIterable);
        }
        else {
            var TrackEventsInterval = setInterval(function () {
                if (typeof analytics != 'undefined' && typeof mixpanel != 'undefined' && typeof mixpanel.get_distinct_id != 'undefined') {
                    trackEvent(eventName, eventpropval, userid, islogin, skipTraitsToIterable);
                    clearInterval(TrackEventsInterval);
                }
            }, 100);
        }
    }
};

RDL.BuilderUsageTrackEvents = function (action, screenName, label, islogin, clickOption) {
    var eventpropval = {};
    if (clickOption) {
        eventpropval = { 'action': action, 'screen name': screenName, 'click option': clickOption }
    }
    else {
        eventpropval = { 'action': action, 'screen name': screenName }
    }
    RDL.TrackEvents('builder usage', eventpropval, null, islogin);
};

RDL.UpdateMixPanelCookieLCUK = function () {
    try {
        var mixPanelProps = RDL.readCookie("mixpanelprops");
        if (mixPanelProps != null) {
            mixPanelProps = unescape(mixPanelProps);
            mixPanelProps = JSON.parse(mixPanelProps);
            delete mixPanelProps.mp_name_tag;
            delete mixPanelProps.id;
            mixPanelProps = JSON.stringify(mixPanelProps);
            mixPanelProps = escape(mixPanelProps);
            RDL.createCookie("mixpanelprops", mixPanelProps, null, window.location.host.substr(window.location.host.indexOf('.')));
        }
    } catch (e) {
        console.log("Error in updating mixpanel cookie LCUK ")
    }
}

RDL.startSaveDocLoader = function (loadingText) {
    var textNode = document.getElementsByClassName("progress-text")[0];
    if (typeof loadingText == "string" && textNode) {
        textNode.innerText = loadingText;
    } else {
        textNode.innerText = "Saving...";
    }
    document.getElementById("saveDocLoader").classList.remove("d-none");
    // document.getElementsByClassName('progress_qb')[0].classList.remove("d-none");
}

RDL.closeSaveDocLoader = function () {
    // document.getElementsByClassName('progress_qb')[0].classList.add("d-none");
    //  document.getElementById("saveDocLoader").classList.add("d-none");
}
RDL.startPageLoader = function () {
    document.getElementById("page-loader") && document.getElementById("page-loader").classList.remove("hide");
}
RDL.closePageLoader = function () {
    document.getElementById("page-loader") && document.getElementById("page-loader").classList.add("hide");
}

RDL.promiseAllResolveActivity = function () {
    let _jobTitle = window.RDL.GetQueryString("JobTitle");
    if (_jobTitle) {
        _jobTitle = _jobTitle.replace(/%20/g, " ").replace(/-/g, " ");;
        _jobTitle = RDL.convertToTitleCase(_jobTitle);
        window.RDL.createCookie("LP_JobTitle", _jobTitle, null, window.RDL.Portal.cookieDomain);
    }
    addExperimentsLocalizedText();
}
RDL.convertToTitleCase = function (str) {
    let wordsFromStr = str.split(' ');
    let words = [];

    for (let i = 0; i < wordsFromStr.length; i++) {
        words.push(wordsFromStr[i].substring(0, 1).toUpperCase() + '' + wordsFromStr[i].substring(1).toLowerCase());
    }

    return words.join(' ');
}

RDL.LoadThirdPartyJS = function () {
    loadgtms();
    loadJs(segmentUrl);
}

RDL.SaveFirstTouchValuesFromQS = function () {
    var saveUTM_Campaign_First_Touch = window.RDL.GetQueryString("utm_campaign") == null ? "undefined" : window.RDL.GetQueryString("utm_campaign");
    var saveUTM_Content_First_Touch = window.RDL.GetQueryString("utm_content") == null ? "undefined" : window.RDL.GetQueryString("utm_content");
    var saveUTM_Medium_First_Touch = window.RDL.GetQueryString("utm_medium") == null ? "undefined" : window.RDL.GetQueryString("utm_medium");
    var saveUTM_Source_First_Touch = window.RDL.GetQueryString("utm_source") == null ? "undefined" : window.RDL.GetQueryString("utm_source");
    var saveUTM_Term_First_Touch = window.RDL.GetQueryString("utm_term") == null ? "undefined" : window.RDL.GetQueryString("utm_term");
    var utmFirstTouchCookieValue = "";
    if (saveUTM_Campaign_First_Touch)
        utmFirstTouchCookieValue = "saveUTM_Campaign_First_Touch-" + saveUTM_Campaign_First_Touch + "#";
    if (saveUTM_Content_First_Touch)
        utmFirstTouchCookieValue = utmFirstTouchCookieValue + "saveUTM_Content_First_Touch-" + saveUTM_Content_First_Touch + "#";
    if (saveUTM_Medium_First_Touch)
        utmFirstTouchCookieValue = utmFirstTouchCookieValue + "saveUTM_Medium_First_Touch-" + saveUTM_Medium_First_Touch + "#";
    if (saveUTM_Source_First_Touch)
        utmFirstTouchCookieValue = utmFirstTouchCookieValue + "saveUTM_Source_First_Touch-" + saveUTM_Source_First_Touch + "#";
    if (saveUTM_Term_First_Touch)
        utmFirstTouchCookieValue = utmFirstTouchCookieValue + "saveUTM_Term_First_Touch-" + saveUTM_Term_First_Touch + "#";

    if (utmFirstTouchCookieValue.length > 0)
        utmFirstTouchCookieValue = utmFirstTouchCookieValue.slice(0, -1);; //remove the last #
    if (utmFirstTouchCookieValue.length > 0) {
        window.RDL.createCookie("UTMFirstTouchCookie", utmFirstTouchCookieValue.replace(/%22/g, '"'), null, window.location.host.substr(window.location.host.indexOf('.')));
    }
}

RDL.SaveLastTouchValuesFromQS = function () {
    var saveUTM_Campaign_Last_Touch = window.RDL.GetQueryString("utm_campaign") == null ? "undefined" : window.RDL.GetQueryString("utm_campaign");
    var saveUTM_Content_Last_Touch = window.RDL.GetQueryString("utm_content") == null ? "undefined" : window.RDL.GetQueryString("utm_content");
    var saveUTM_Medium_Last_Touch = window.RDL.GetQueryString("utm_medium") == null ? "undefined" : window.RDL.GetQueryString("utm_medium");
    var saveUTM_Source_Last_Touch = window.RDL.GetQueryString("utm_source") == null ? "undefined" : window.RDL.GetQueryString("utm_source");
    var saveUTM_Term_Last_Touch = window.RDL.GetQueryString("utm_term") == null ? "undefined" : window.RDL.GetQueryString("utm_term");
    var utmLastTouchCookieValue = "";
    if (saveUTM_Campaign_Last_Touch)
        utmLastTouchCookieValue = "saveUTM_Campaign_Last_Touch-" + saveUTM_Campaign_Last_Touch + "#";
    if (saveUTM_Content_Last_Touch)
        utmLastTouchCookieValue = utmLastTouchCookieValue + "saveUTM_Content_Last_Touch-" + saveUTM_Content_Last_Touch + "#";
    if (saveUTM_Medium_Last_Touch)
        utmLastTouchCookieValue = utmLastTouchCookieValue + "saveUTM_Medium_Last_Touch-" + saveUTM_Medium_Last_Touch + "#";
    if (saveUTM_Source_Last_Touch)
        utmLastTouchCookieValue = utmLastTouchCookieValue + "saveUTM_Source_Last_Touch-" + saveUTM_Source_Last_Touch + "#";
    if (saveUTM_Term_Last_Touch)
        utmLastTouchCookieValue = utmLastTouchCookieValue + "saveUTM_Term_Last_Touch-" + saveUTM_Term_Last_Touch + "#";

    if (utmLastTouchCookieValue.length > 0)
        utmLastTouchCookieValue = utmLastTouchCookieValue.slice(0, -1);; //remove the last #
    if (utmLastTouchCookieValue.length > 0) {
        window.RDL.createCookie("UTMLastTouchCookie", utmLastTouchCookieValue.replace(/%22/g, '"'), null, window.location.host.substr(window.location.host.indexOf('.')));
    }
}

RDL.isAnyAuthCookieExists = function () {
    var anyAuthCookieExists = true;
    if (RDL.isLCA || RDL.isMPR || RDL.isWhiteLabel || RDL.isHLM) {
        if (window.RDL.readCookie("userinfo") == null && window.RDL.readCookie(BoldAuthCookieName) == null) {
            anyAuthCookieExists = false;
        }
    }
    return anyAuthCookieExists;
}

RDL.delete_cookie = function (name, domain) {
    var _domain = "";
    var date = new Date();
    date.setTime(date.getTime() - 1);
    expires = "; expires=" + date.toGMTString();
    if (domain) {
        _domain = "; domain=" + domain;
    }
    document.cookie = name + "=;" + expires + _domain + "; path=/;";
};

RDL.RegisterGuestUserByAccountsJs = function (guestUserUID, emailAddress, password, firstName, lastName, phoneNumber, mobileNumber, EmailOptin, docId, keepMeLoggedIn, previousEmail) {
    // RegisterGuestUser(guestUserUID, emailAddress, password, RDL.PortalSettings.ConfigurePortalCd, RDL.PortalSettings.ConfigureProductCd, RDL.Paths.AccountsURL, firstName, lastName, phoneNumber, mobileNumber, 'Resumes', "", EmailOptin, docId, keepMeLoggedIn, previousEmail);
    let otherTraits = [{ "docId": docId }];
    //let otherProperties = [{ "docId": docId}];
    var optin = 0;
    if (EmailOptin == true) { optin = 1; }
    BOLD.Accounts.registerGuest(guestUserUID, emailAddress, password, firstName, lastName, RDL.PortalSettings.ConfigureProductCd, "Resumes", optin, previousEmail, otherTraits, null, "", "", window.location.href).then(function (data) {
        //console.log(data);
        window.login.handleResponseV2(data.userid, data.status);
    }, function (error) {
        RDL.closePageLoader();
        // alert("ërror in register user");
    })
}

RDL.ForgotPassword = function (emailAddress) {
    //DirectForgotPassword(emailAddress, RDL.PortalSettings.ConfigureProductCd, RDL.PortalSettings.ConfigurePortalName, 'flow', encodeURI(window.location.origin + RDL.Paths.BasePath + window.location.search), RDL.Paths.AccountsURL);
    BOLD.Accounts.forgotPassword(emailAddress, RDL.PortalSettings.ConfigureProductCd, encodeURI(window.location.origin + RDL.Paths.BasePath + window.location.search), "Resumes").then(function (data) {
        window.login.handleForgotPasswordResponse(data.Status);
    }, function (error) {
        window.login.handleForgotPasswordResponse("Error");
    });
}
RDL.IsUserExist = function () {
    if (window.RDL.UserClaims && window.RDL.UserClaims.user_uid) {
        var url = window.RDL.Paths.BaseApiUrl + 'users/' + window.RDL.UserClaims.user_uid;
        var xmlhttp;
        xmlhttp = new XMLHttpRequest();
        xmlhttp.onload = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var user = JSON.parse(xmlhttp.responseText);
                if (user == null || user == undefined) {
                    clearAndRedirect("/")
                }
            }
            else if (xmlhttp.readyState == 4 && xmlhttp.status == 400) {
                clearAndRedirect("/");
            }
        }
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    }
}

RDL.Claims = function (callback, isAsync, resolve, skipAuthCookieCheck) {
    RDL.logMessage += "\n Claims isAnyAuthCookieExists-" + RDL.isAnyAuthCookieExists();
    RDL.logMessage += "\n Claims userinfo cookie-" + window.RDL.readCookie("userinfo");
    RDL.logMessage += "\n Claims BOLDAuth Cookie-" + window.RDL.readCookie(BoldAuthCookieName);
    RDL.logMessage += "\n Claims RDL.UserClaims-" + RDL.UserClaims;
    if (RDL.isAnyAuthCookieExists() == true || skipAuthCookieCheck) {
        if (isAsync) {
            if (window.RDL.GetQueryString('uid') != null && window.RDL.GetQueryString('uid') != '') {
                callAjax(true, window.RDL.Paths.BaseApiUrlV2 + 'user/claims?portalId=' + RDL.Portal.portalId + '&v=' + versionNumber + '&urlReferrer=' + escape(document.referrer) + '&cookieEnabled=' + navigator.cookieEnabled + '&uid=' + window.RDL.GetQueryString('uid') + '&culture=' + window.RDL.cultureCD, "GET", true, true, callback, resolve);
            }
            else {
                callAjax(true, window.RDL.Paths.BaseApiUrlV2 + 'user/claims?portalId=' + RDL.Portal.portalId + '&v=' + versionNumber + '&urlReferrer=' + escape(document.referrer) + '&cookieEnabled=' + navigator.cookieEnabled + '&culture=' + window.RDL.cultureCD, "GET", true, true, callback, resolve);
            }
        } else {
            if (window.RDL.GetQueryString('uid') != null && window.RDL.GetQueryString('uid') != '') {

                callAjax(true, window.RDL.Paths.BaseApiUrlV2 + 'user/claims?portalId=' + RDL.Portal.portalId + '&v=' + versionNumber + '&urlReferrer=' + escape(document.referrer) + '&cookieEnabled=' + navigator.cookieEnabled + '&uid=' + window.RDL.GetQueryString('uid') + '&culture=' + window.RDL.cultureCD, "GET", false, true, callback);
            }
            else {

                callAjax(true, window.RDL.Paths.BaseApiUrlV2 + 'user/claims?portalId=' + RDL.Portal.portalId + '&v=' + versionNumber + '&urlReferrer=' + escape(document.referrer) + '&cookieEnabled=' + navigator.cookieEnabled + '&culture=' + window.RDL.cultureCD, "GET", false, true, callback);
            }
        }

        window.RDL.claimCallCounter++;
        clearTimeout(window.RDL.claimCallTimer);
        window.RDL.claimCallTimer = setTimeout(function () {
            window.RDL.claimCallCounter = 0;
        }, window.RDL.loopTimeGapInSec * 1000);

        if (window.RDL.claimCallCounter > window.RDL.maxloopCount) {
            // redirect to LP.
            clearAndRedirect("/?forceRedirect=StuckInClaimCall")
        }

    }
    else {
        RDL.logMessage += "\n Claims CreateGuestUser() called.";
        window.RDL.CreateGuestUser();
        if (resolve)
            resolve('');
    }
}
claimsPromise = new Promise(function (resolve, reject) {
    //When coming from LP27, we get BDLP cookie but when we come via
    //brightfire/balance affilaites we dont get this cookie 
    //Here we did not included 'bdflow' querystring in this condition 
    //because this qs comes for specific affiliates and for those affilates we show HIW with short funnel
    //So we dont need to to inclue that condition here
    if (isTemplateFlow() || isLP27Flow() || (RDL.UserClaims && RDL.UserClaims.user_uid)) {
        resolve();
    }
    else {
        if (!RDL.readCookie("ShowTnCLink")) {
            window.RDL.createCookie('ShowTnCLink', "1", null);
        }
        window.RDL.Claims(handleClaims, true, resolve);
    }
});


configPromise = new Promise(function (resolve, reject) {
    callAjax(true, getConfigUrl(), 'GET', true, false, handleConfig, resolve);
});

resourcePromise = new Promise(function (resolve, reject) {
    callAjax(true, getLocalizationUrl(), 'GET', true, false, handleLocalizationText, resolve);
});

featurePromise = new Promise(function (resolve, reject) {
    getFeatureSet(resolve);
});

countryDetailsPromise = new Promise(function (resolve, reject) {
    setCountryDetails(resolve, reject);
});

window.addEventListener("load", function () {
    RDL.pageLoaded = true;
});
checkBrowserCompatibility();

if (window.location.href.toLowerCase().indexOf("utm_") > -1) {
    RDL.SaveFirstTouchValuesFromQS();
    RDL.SaveLastTouchValuesFromQS();
}

RDL.loadFile = function () {
    if (RDL.Skins.filter) {
        handleSkins();
    }
    else {
        var skinTimer = setInterval(function () {
            if (RDL.Skins.filter) {
                clearInterval(skinTimer);
                handleSkins();
            }
        }, 100);
    }
}

RDL.getSkinHtml = function (skinName, isAsyncTrue) {
    var url = getSkinHtmlPath() + skinName;
    callAjax(true, url, 'GET', isAsyncTrue ? true : false, false, function (data) {
        var parser = new DOMParser();
        var htmlDoc = parser.parseFromString(data, "text/html");
        //EB-11749 :These multiple text comparisions are part of a temporary change.
        //Once the changes are done at skin level, this will be removed.
        //This replaces the word 'to' between from and to dates with its localized text
        RDL.isINTL && RDL.LocalizeFromEndDateToWordInSkin(htmlDoc);
        RDL.files[skinName] = htmlDoc;
    });
}
RDL.LocalizeFromEndDateToWordInSkin = function (htmlDoc) {
    try{
        if(RDL.localizationResumeRenderer.toDate_text){
            htmlDoc.querySelectorAll("span[dependency='JSTD+EDDT']").forEach(function(spanNode){
                if(spanNode && spanNode.innerText && spanNode.innerText.trim() &&
                    (spanNode.innerText.trim().toLowerCase() == "to" || 
                        spanNode.innerText.trim().toLowerCase() == "a" || 
                        spanNode.innerText.trim().toLowerCase() == "à")){
                            spanNode.innerText = spanNode.innerText.replace(spanNode.innerText.trim(),RDL.localizationResumeRenderer.toDate_text);
                        }
                });
        }
    } catch(error){
        console.log(error);
    }
}
RDL.RunScratchFlow = function () {
    window.selectResume.scratchFlow();
}
RDL.getTemplateFromSkin = function (skin) {
    var skinCD = skin || (RDL.selectedSkin || RDL.defaultSkin);
    var template = RDL.files[skinCD + '.htm'];
    if (!template) {
        RDL.getSkinHtml(skinCD + '.htm', false);
        template = RDL.files[skinCD + '.htm'];
        if (!template) {
            template = RDL.files[RDL.defaultSkin + '.htm'];
        }
    }
    return template;
}

RDL.isMultiColumnSkin = function (skinCD) {
    let isMultiColumn = false;
    var skinCD = skinCD || (RDL.selectedSkin || RDL.defaultSkin);
    let container = RDL.getTemplateFromSkin(skinCD).querySelectorAll("container");
    if (container != null && container.length > 0) {
        isMultiColumn = true;
    }
    return isMultiColumn;
}

RDL.visitedIndex = 0;
if (sessionStorage.getItem('visitedIndex')) {
    RDL.visitedIndex = sessionStorage.getItem('visitedIndex');
}
RDL.setVisitedIndex = function (visitedIndex) {
    if (RDL.visitedIndex < visitedIndex) {
        RDL.visitedIndex = visitedIndex;
        sessionStorage.setItem('visitedIndex', visitedIndex);
    }
}

RDL.UpdatePushnami = function () {
    if (RDL.isMPR) {
        if (window.Pushnami) {
            Pushnami.update({ "convert": "true" }).prompt();
        }
        else {
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "https://api.pushnami.com/scripts/v1/pushnami-adv/" + PushnamiID;
            script.onload = function () {
                Pushnami.update({ "convert": "true" }).prompt();
            };
            document.getElementsByTagName("head")[0].appendChild(script);
        }
    }
}

// Add Browser/Device specific classes
//var $html = document.documentElement;
var userAgent = navigator.userAgent.toLowerCase(),
    isIE = /*@cc_on!@*/false || !!document.documentMode,
    isEdge = !isIE && !!window.StyleMedia,
    isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
if (/MSIE/.test(userAgent) || /Trident/.test(userAgent)) {
    $html.classList.add('ie');
    if (/MSIE 10\.0/.test(userAgent)) $html.classList.add('ie10');
    if (/rv:11\.0/.test(userAgent)) $html.classList.add('ie11');
}
if (/firefox/.test(userAgent)) {
    $html.classList.add('firefox');
}

if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
    $html.classList.add('safari');
}

if (/iPad/.test(userAgent)) {
    $html.classList.add('ipad');
}

if (isEdge) {
    $html.classList.add('edge');
    if (/edge\/18\./.test(userAgent)) {
        $html.classList.add('edge18');
    }
}

if (isChrome) {
    $html.classList.add('chrome');
}

if (typeof Object.assign != 'function') {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, "assign", {
        value: function assign(target, varArgs) { // .length of function is 2
            'use strict';
            if (target == null) { // TypeError if undefined or null
                throw new TypeError('Cannot convert undefined or null to object');
            }

            var to = Object(target);

            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];

                if (nextSource != null) { // Skip over if undefined or null
                    for (var nextKey in nextSource) {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        },
        writable: true,
        configurable: true
    });
}

function storeSurveyInfoInSession(name, value) {
    var existingValue = sessionStorage.getItem("SurveyInfoJSON");
    var parsedValue = {};

    if (existingValue) {
        parsedValue = JSON.parse(existingValue);
    }
    parsedValue[name] = value;

    sessionStorage.setItem("SurveyInfoJSON", JSON.stringify(parsedValue));
}

function isUserPurged() {
    var _userPurged = false;
    try {
        if (!!window.RDL.UserClaims && !!window.RDL.UserClaims.role && !!window.RDL.UserClaims.createdOn && window.RDL.UserClaims.role.toLowerCase() == "guest") {
            var createdDate = window.RDL.UserClaims.createdOn;
            if (window.RDL.isINTL) {
                var initial = createdDate.split(/\//);
                createdDate = [initial[1], initial[0], initial[2]].join('/');
            }
            var date1 = new Date(createdDate);
            var date2 = new Date();
            var diffTime = Math.abs(date2.getTime() - date1.getTime());
            var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 29) {
                _userPurged = true;
            }
        }
    }
    catch (e) {
        _userPurged = false;
    }
    return _userPurged;

}
function getExperimentVariant(experiment) {
    let variant = 0;
    if (RDL.UserExperiments && experiment && experiment.id && RDL.UserExperiments[experiment.id]) {
        variant = RDL.UserExperiments[experiment.id].variant;
    }
    return variant;
}
function RemoveSelectedIndustryFromLocalStorage() {
    try {
        var storageItemName = "STORAGE_IndustrySelected";
        window.localStorage.removeItem(storageItemName);
    }
    catch (e) {
        console.log('Issue in localStorage access.');
    }
}

window.onerror = function (error, url, line) {
    if (isChrome && error && error.indexOf("ERR_CACHE_READ_FAILURE") > -1) {
        forceRedirect("/?forceRedirect=CACHE_READ_FAILURE");
    }
}

    //Polyfill for IE children support
    // Overwrites native 'children' prototype.
    // Adds Document & DocumentFragment support for IE9 & Safari.
    // Returns array instead of HTMLCollection.
    ; (function (constructor) {
        if (constructor &&
            constructor.prototype &&
            constructor.prototype.children == null) {
            Object.defineProperty(constructor.prototype, 'children', {
                get: function () {
                    var i = 0, node, nodes = this.childNodes, children = [];
                    while (node = nodes[i++]) {
                        if (node.nodeType === 1) {
                            children.push(node);
                        }
                    }
                    return children;
                }
            });
        }
    })(window.Node || window.Element);