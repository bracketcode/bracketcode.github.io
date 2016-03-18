var debugConsoleContainer;
var debugConsoleController;
var oldConsoleLog;

var debugConsoleDepReady = false;
var debugConsoleReady = false;

var consoleLogHooked = false;

if(!(typeof console === "undefined")) {
    oldConsoleLog = console.log.bind(console);
}

Array.prototype.unique = function() {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};

function initDebugConsole() {
    if (debugConsoleDepReady) {
        debugConsoleContainer = $('<div class="console" id="debugConsole">');
        $('body').append(debugConsoleContainer);
        debugConsoleContainer.hide();
        debugConsoleController = debugConsoleContainer.console({
               promptLabel: '>> ',
               commandValidate:function(line){
                 if (line == "") return false;
                 else return true;
               },
               commandHandle:function(line, report){
                   try { var ret = eval(line);
                         if (typeof ret != 'undefined') report(ret.toString(), "jquery-console-message-success");
                         else report(true, "jquery-console-message-success"); }
                   catch (e) { report(e.toString(), "jquery-console-message-success"); }
               },
               completeHandle:function(prefix){
                   result = "";
                   
                   if (prefix.lastIndexOf(".") != -1) {
                       objectSearch = prefix.substring(0, prefix.lastIndexOf("."));
                       truePrefix = prefix.substring(prefix.lastIndexOf(".") + 1);
                   } else {
                       objectSearch = "window";
                       truePrefix = prefix;
                   }
                   
                   //console.log("objectSearch = "+objectSearch+", truePrefix = "+truePrefix);
                   
                   found = [];
                   keys = [];
                   keys1 = [];
                   keys2 = [];
                   keys3 = [];
                   try {
                        keys1 = Object.keys(eval(objectSearch));
                    } catch (e) {}
                    try {
                        keys2 = Object.getOwnPropertyNames(eval(objectSearch));
                    } catch (e) {}
                   
                   try {
                       for (var k in eval(objectSearch)) {
                           keys3.push(k);
                        }
                    } catch(e) {}
                    
                   keys = keys1.concat(keys2).concat(keys3).unique()
                   
                   for (var i = 0; i < keys.length; i++) {
                       item = keys[i];
                       //console.log("completeHandle: "+item);
                       if (item.indexOf(truePrefix) === 0) {
                           //console.log("FOUND: "+item);
                           found.push(item.substring(truePrefix.length));
                       }
                   }
                   
                   //console.log("FOUND: "+found_globals.length);
                   return found;
               },
               cols: 50,
               animateScroll:true,
               promptHistory:true,
               welcomeMessage:'Debug Console\n=============\n'+
                                'This is a Javascript console. For help, type\n'+
                                '"helpDebugConsole()". Tab completion is available.',
             });
    } else {
        // Not ready yet, reload in a second...
        setTimeout(initDebugConsole, 1000);
    }
}

function showDebugConsole() {
    if (debugConsoleDepReady && (debugConsoleController != null)) {
        $( "#debugConsole" ).dialog({
            title: "Debug Console",
            height: 360,
            width: 535,
        });
        debugConsoleReady = true;
    } else {
        // Not ready yet, reload in a second...
        setTimeout(showDebugConsole, 1000);
    }
}

function hideDebugConsole() {
    $( "#debugConsole" ).dialog("close");
}

function clearDebugConsole() {
    debugConsoleController.reset();
}

function resetDebugConsole() {
    debugConsoleController.reset();
}

function helpDebugConsole() {
    // Disabled until we're able to report AFTER the command, not
    // before
    /*debugConsoleController.report("Help:", "jquery-console-prompt-box");
    debugConsoleController.report("  helpDebugConsole()  - this help.", "jquery-console-prompt-box");
    debugConsoleController.report("  resetDebugConsole() - clear this debug console.", "jquery-console-prompt-box");
    debugConsoleController.report("  clearDebugConsole() - same as above, just different name.", "jquery-console-prompt-box");
    debugConsoleController.report("  hideDebugConsole()  - hide this debug console.", "jquery-console-prompt-box");
    debugConsoleController.report("  showDebugConsole()  - show this debug console.", "jquery-console-prompt-box");*/
    return "Help:\n" +
    "  helpDebugConsole()  - this help.\n" +
    "  resetDebugConsole() - clear this debug console.\n" +
    "  clearDebugConsole() - same as above, just different name.\n" +
    "  hideDebugConsole()  - hide this debug console.\n" +
    "  showDebugConsole()  - show this debug console.";
}

function initHookConsoleLog() {
    if (debugConsoleDepReady) {
        console.log = function (message) {
            if (typeof message == 'object') {
                consoleMsg = (JSON && JSON.stringify ? JSON.stringify(message) : message);
            } else {
                consoleMsg = message;
            }
            debugConsoleController.commandResult(consoleMsg, "jquery-console-message-value");
            if(!(typeof oldConsoleLog === "undefined")) {
                oldConsoleLog(message);
            }
        }
        consoleLogHooked = true;
    } else {
        // Not ready yet, reload in a second...
        setTimeout(initHookConsoleLog, 1000);
    }
}

$.getScript( "https://code.jquery.com/ui/1.11.3/jquery-ui.min.js", function() {
    $.getScript( "js/jquery.console.js", function() {
        $('<link>')
          .appendTo('head')
          .attr({type : 'text/css', rel : 'stylesheet'})
          .attr('href', 'https://code.jquery.com/ui/1.11.4/themes/ui-darkness/jquery-ui.css');
        debugConsoleDepReady = true;
    });
});
