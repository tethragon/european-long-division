/* ===========================================================================
 * pipwerks SCORM Wrapper for JavaScript
 * Created by Philip Hutchison, May 2008-2016
 * https://github.com/pipwerks/scorm-api-wrapper
 *
 * Open-source under the MIT License
 * =========================================================================== */

var pipwerks = window.pipwerks || {};
pipwerks.UTILS = {};
pipwerks.debug = { isActive: true };

pipwerks.scorm = {
  version: "1.2",
  handleCompletionStatus: true,
  handleExitMode: true,
  API: { handle: null, isFound: false },
  connection: { isActive: false },
  data: { completionStatus: null, exitStatus: null },
  debug: {}
};

pipwerks.UTILS.StringToBoolean = function(string) {
  switch (String(string).toLowerCase()) {
    case "true": case "yes": case "1": return true;
    case "false": case "no": case "0": case null: return false;
    default: return Boolean(string);
  }
};

pipwerks.UTILS.trace = function(msg) {
  if (pipwerks.debug.isActive && window.console && window.console.log) {
    window.console.log("[SCORM] " + msg);
  }
};

pipwerks.scorm.isAvailable = function() {
  return true;
};

pipwerks.scorm.API.find = function(win) {
  var API = null,
    findAttempts = 0,
    findAttemptLimit = 500,
    trace = pipwerks.UTILS.trace;

  while ((!win.API && !win.API_1484_11) &&
    (win.parent) &&
    (win.parent != win) &&
    (findAttempts <= findAttemptLimit)) {
    findAttempts++;
    win = win.parent;
  }

  if (pipwerks.scorm.version === "1.2") {
    if (win.API) {
      API = win.API;
    } else if (win.opener && typeof win.opener.API !== "undefined") {
      API = win.opener.API;
    }
  } else {
    if (win.API_1484_11) {
      API = win.API_1484_11;
    } else if (win.opener && typeof win.opener.API_1484_11 !== "undefined") {
      API = win.opener.API_1484_11;
    }
  }

  if (API) {
    pipwerks.scorm.API.isFound = true;
    trace("API found in window hierarchy.");
  } else {
    trace("API could not be found.");
  }

  return API;
};

pipwerks.scorm.API.get = function() {
  var API = pipwerks.scorm.API.handle,
    trace = pipwerks.UTILS.trace;

  if (!API) {
    API = pipwerks.scorm.API.find(window);
    if (!API && window.parent && window.parent != window) {
      API = pipwerks.scorm.API.find(window.parent);
    }
    if (!API && window.top && window.top.opener) {
      API = pipwerks.scorm.API.find(window.top.opener);
    }
    if (API) {
      pipwerks.scorm.API.handle = API;
    } else {
      trace("Unable to find an API adapter.");
    }
  }
  return API;
};

pipwerks.scorm.init = function() {
  var success = false,
    trace = pipwerks.UTILS.trace,
    scorm = pipwerks.scorm,
    API = scorm.API.get();

  if (API) {
    switch (scorm.version) {
      case "1.2":
        success = pipwerks.UTILS.StringToBoolean(API.LMSInitialize(""));
        break;
      case "2004":
        success = pipwerks.UTILS.StringToBoolean(API.Initialize(""));
        break;
    }
    if (success) {
      scorm.connection.isActive = true;
      trace("LMS connection established.");
    } else {
      trace("LMS failed to initialize.");
    }
  } else {
    trace("Could not initialize: API not found.");
  }
  return success;
};

pipwerks.scorm.get = function(parameter) {
  var value = null,
    trace = pipwerks.UTILS.trace,
    scorm = pipwerks.scorm,
    API = scorm.API.get();

  if (API && scorm.connection.isActive) {
    switch (scorm.version) {
      case "1.2":
        value = API.LMSGetValue(parameter);
        break;
      case "2004":
        value = API.GetValue(parameter);
        break;
    }
    trace("LMSGetValue('" + parameter + "') -> '" + value + "'");
  }
  return String(value);
};

pipwerks.scorm.set = function(parameter, value) {
  var success = false,
    trace = pipwerks.UTILS.trace,
    scorm = pipwerks.scorm,
    API = scorm.API.get();

  if (API && scorm.connection.isActive) {
    switch (scorm.version) {
      case "1.2":
        success = pipwerks.UTILS.StringToBoolean(API.LMSSetValue(parameter, value));
        break;
      case "2004":
        success = pipwerks.UTILS.StringToBoolean(API.SetValue(parameter, value));
        break;
    }
    trace("LMSSetValue('" + parameter + "', '" + value + "') -> " + success);
  }
  return success;
};

pipwerks.scorm.save = function() {
  var success = false,
    trace = pipwerks.UTILS.trace,
    scorm = pipwerks.scorm,
    API = scorm.API.get();

  if (API && scorm.connection.isActive) {
    switch (scorm.version) {
      case "1.2":
        success = pipwerks.UTILS.StringToBoolean(API.LMSCommit(""));
        break;
      case "2004":
        success = pipwerks.UTILS.StringToBoolean(API.Commit(""));
        break;
    }
    trace("LMSCommit -> " + success);
  }
  return success;
};

pipwerks.scorm.quit = function() {
  var success = false,
    trace = pipwerks.UTILS.trace,
    scorm = pipwerks.scorm,
    API = scorm.API.get();

  if (API && scorm.connection.isActive) {
    switch (scorm.version) {
      case "1.2":
        success = pipwerks.UTILS.StringToBoolean(API.LMSFinish(""));
        break;
      case "2004":
        success = pipwerks.UTILS.StringToBoolean(API.Terminate(""));
        break;
    }
    if (success) {
      scorm.connection.isActive = false;
      trace("LMS connection closed cleanly.");
    }
  }
  return success;
};
