/*
 * 999 lines of code on the screen, 999 lines of code.
 * Take one down, debug it around, 998 lines of code on the screen...
 * 
 * 99 hours of life on the wall, 99 hours of life.
 * Spend one now, drive it around, 98 hours of life on the wall...
 * 
 * 99 bottles of beer on the wall, 99 bottles of beer.
 * Take one down, pass it around, 98 bottles of beer on the wall...
 * 
 * ...
 * 
 * No more lines of code on the screen, no more lines of code.
 * No more hours of life on the wall, no more hours of life.
 * No more bottles of beer on the wall, no more bottles of beer.
 * 
 * Too tired to go to the store and buy some more, 0 bottles of beer on
 * the wall...
 */
 
// TODO:
// Link recognition (via hash # and/or GET ?param=bla)
// Twitter / Facebook integration
// Comparison
// Results loading

var bracketJSLoaded = true;
var bracket = null;
var picks = null;
var pickorder = null;
var bracketDebugEnabled = false;

var notifyPicksDone = false;

function initializePicks() {
    picks = { round1 : [], round2 : [], round3 : [], round4 : [], round5 : [], round6 : [] };
    
    initamt = 32;
    
    for (var round in picks) {
        for (i = 0; i < initamt; i++) {
            picks[round].push(null);
        }
        initamt = initamt / 2;
    }
    
    // Initialize pick order
    pickorder = [];
    for (regionIndex = 0; regionIndex < bracket.lineup.regions.length; regionIndex++) {
        regionObj = bracket.lineup.regions[regionIndex];
        for (var region in regionObj) {
            shortcode = bracket.lineup.shortcodes[region];
            pickregionobj = { region: region, shortcode: shortcode, sc: shortcode };
            pickorder.push(pickregionobj);
        }
    }
}

// round: int (starts at 1)
// region: shortcode of region
// region_match: int - match number relative to region and round (starts at 1)
// result: int 0 or 1
function makePick(round, region, region_match, result) {
    initamt = 32;
    for (i = 0; i < round - 1; i++) {
        initamt = initamt / 2;
    }
    
    // Get region relative position
    if (initamt >= pickorder.length) {
        region_rel = -1;
        for (i = 0; i < pickorder.length; i++) {
            if (pickorder[i].sc == region) {
                region_rel = i; break;
            }
        }
        total_regions = pickorder.length;
    } else {
        // region_rel is not a factor here, so set to 0 to cancel it out
        region_rel = 0;
        // total regions is not a factor here, so set to 1 to cancel it out
        total_regions = 1;
    }
    
    bracketDebug("region_rel = "+region_rel+", initamt = "+initamt+", total_regions = "+total_regions);
    bracketDebug("Final storage location: round"+round+"["+(((region_rel * initamt) / total_regions) + (region_match - 1))+"]");
    
    picks["round"+round][((region_rel * initamt) / total_regions) + (region_match - 1)] = result;
}

function picksDone() {
    done = true;
    for (var round in picks) {
        for (i = 0; i < picks[round].length; i++) {
            if (picks[round][i] === null) {
                done = false;
                break;
            }
        }
        if (!done) break;
    }
    return done;
}

function arrToStr(arr) {
    str = "[ ";
    for (i = 0; i < arr.length; i++) {
        str += arr[i];
        if (i < arr.length - 1) {
            str += ", ";
        }
    }
    str += " ]";
    return str;
}

function loadBracketData() {
    showJSModalWindow("Loading matchups for the bracket...", "Loading...");
    $.ajax({
        url: "yaml/matchup.yaml",
        cache: false,
        dataType: "text",
    })
    .done(function( yaml_data ) {
        bracket = jsyaml.load(yaml_data);
        bracketDebug(yaml_data);
        bracketDebug("Bracket loaded!");
        initializePicks();
        populateBracket();
    })
    .error(function() {
        bracketDebug("ERROR: Could not load matchups for the bracket.");
        showJSModalWindow("ERROR: Could not load matchups for the bracket.<br />" +
            "<a href='javascript:hideJSModalWindow()' class='btn btn-default btn-xs'><b>Close</b></a>",
            "Loading Failed!");
    });
}

function showJSModalWindow(msg, title) {
    if ($('#modal-window').attr("data-hasqtip")) {
        // qtip2 already loaded and running, just change content
        $("#qtip-"+$('#modal-window').qtip('api').get('id')).animate({
            opacity: "0",
        }, 100, function() {
                $('#modal-window').qtip('option', 'content.text', msg);
                $('#modal-window').qtip('option', 'content.title', title);
                
                $("#qtip-"+$('#modal-window').qtip('api').get('id')).animate({
                    opacity: "1",
                }, 100);
            });
    } else {
        $('#modal-window').qtip({
                content: {
                    text: msg,
                    title: title
                },
                position: {
                    my: 'center', at: 'center',
                    target: $(window)
                },
                show: {
                    ready: true,
                    modal: {
                        on: true,
                        blur: false
                    }
                },
                style: {
                    classes: 'qtip-dark qtip-shadow'
                },
                hide: false,
                events: {
                    render: function(event, api) {
                        $('button', api.elements.content).click(function(e) {
                            api.hide(e);
                        });
                    },
                    hide: function(event, api) { api.destroy(); }
                }
            });
    }
}

function hideJSModalWindow() {
    $('#modal-window').qtip('destroy');
}

function populateBracket() {
    for (regionIndex = 0; regionIndex < bracket.lineup.regions.length; regionIndex++) {
        regionObj = bracket.lineup.regions[regionIndex];
        for (var region in regionObj) {
            //bracketDebug("Loading region: "+region)
            shortcode = bracket.lineup.shortcodes[region];
            pairCounter = 0
            
            for (matchPairIndex = 0; matchPairIndex < regionObj[region].length; matchPairIndex++) {
                matchPairObj = regionObj[region][matchPairIndex];
                pairCounter++;
                for (var pairName in matchPairObj) {
                    //bracketDebug("Loading pair: "+pairName);
                    teamNumber = 1;
                    for (i = 0; i < matchPairObj[pairName].length; i++) {
                        teamObj = matchPairObj[pairName][i];
                        bracketDebug("Loading: [Region " + region + " (sc: " + shortcode + ")] [Pair " + pairName + "] [PCount " + pairCounter + "] Team: " + teamObj["team"] + " (seed: " + teamObj["seed"] + ")");
                        bracketDebug("#match" + shortcode + pairCounter + " .slot" + teamNumber + " .seed");
                        $("#match" + shortcode + pairCounter + " .slot" + teamNumber + " .seed").html(teamObj["seed"]);
                        $("#match" + shortcode + pairCounter + " .slot" + teamNumber + " .team").html(teamObj["team"]);
                        if (teamNumber < 2) teamNumber++;
                    }
                }
            }
        }
    }
    //$(".match"+shortcode+num)
    
    showBracket();
}


function showBracket() {
    hideJSModalWindow();
    $( ".slot" ).animate({
        opacity: "1",
      }, 1000, function() {});
    initializeBracketTransitions();
    initializeBracketClickability();
}

function initializeBracketTransitions() {
    $( ".slot" ).hover(function() {
      //bracketDebug("MOver detected over: "+this.innerHTML);
      $(this).animate({
        backgroundColor: "#ffbc8b",
      }, 100, function() {
      // Animation complete.
      });
    }, function() {
      //bracketDebug("MOut detected over: "+this.innerHTML);
      $(this).animate({
        backgroundColor: "transparent",
      }, 100, function() {
      // Animation complete.
      });
    });
}

function initializeBracketClickability() {
    $( ".slot" ).click(function() {
        bracketClick(this);
    });
    
    // Exempt one special slot - the final slot!
    $("#slot129").unbind("click");
}

function bracketClick(bracketSlot) {
    window.curBracketSlot = bracketSlot;
    
    // Make sure we actually can do something here
    if (bracketSlot == null) return;
    if ($(bracketSlot).children().length == 0) return;
    
    matchID = $(bracketSlot).parent().attr('id');
    matchNum = parseInt(matchID[matchID.length - 1]);
    
    if (isNaN(matchNum)) {
        // Try fetching the match number from the class...
        // In hindsight, this *might* be easier than using the ID...
        matchClass = $(bracketSlot).parent().attr('class');
        matchNum = parseInt(matchClass[matchClass.length - 1]);
    }
    
    slotClass = $(bracketSlot).attr('class');
    round = $(bracketSlot).parent().parent().parent().attr('id');
    roundNum = parseInt(round.substring(5));
    //bracketDebug("slotclass = "+slotClass);
    if (slotClass.indexOf("slot1") != -1)
        currentSlot = "slot1";
    else
        currentSlot = "slot2";
    
    slotNum = parseInt(currentSlot.substring(4));
    pickSlotNum = ((slotNum - 1) == 0) ? 1 : 0;
    
    // Figure out region
    bracketDebug("regionClass = "+$(bracketSlot).parent().parent().attr("class"));
    regionClass = $(bracketSlot).parent().parent().attr("class").split(" ");
    if (regionClass.length > 1) {
        regionNum = parseInt(regionClass[1].substring(6));
        regionSC = pickorder[regionNum - 1].sc;
    } else {
        regionNum = -1;
        regionSC = "";
    }
    
    // Sanity check for region sc
    if (matchID.substring(5).indexOf(regionSC) != 0) {
        bracketDebug("bracketClick: WARNING - shortcode '"+regionSC+"' not found!");
    }
    
    bracketDebug("bracketClick: matchID is "+matchID+", currentSlot is "+currentSlot)
    bracketDebug("bracketClick: roundNum is "+roundNum+", regionSC is "+regionSC);
    bracketDebug("bracketClick: slotNum is "+slotNum+", pickSlotNum is "+pickSlotNum);
    bracketDebug("bracketClick: matchNum is "+matchNum);
    nextMatchSlotObj = $('p[rel="'+matchID+'"]');
    
    window.curNextMatchSlotObj = nextMatchSlotObj;
    
    nextMatchSlotTeamObj = $('p[rel="'+matchID+'"] .team');
    if (nextMatchSlotTeamObj.length) {
        nextMatchSlotTeam = nextMatchSlotTeamObj.html();
    } else {
        nextMatchSlotTeam = "";
    }
    
    // Set the pick
    // makePick(int round, shortcode sc region, int region_match, int result)
    makePick(roundNum, regionSC, matchNum, pickSlotNum);
    
    if (nextMatchSlotObj.length) {
        nextMatchSlot = (nextMatchSlotObj.attr('class').indexOf("slot1") != -1) ? "slot1" : "slot2";
        nextMatchID = nextMatchSlotObj.parent().attr('id');
        bracketDebug("bracketClick: --> found next match slot!");
        bracketDebug("bracketClick: --> New match ID is "+nextMatchID);
        bracketDebug("bracketClick: --> New slot is "+nextMatchSlot);
        
        // Set the next slot up
        // <span class="seed">S2_T1</span> <span class="team">S2_T1</span> <em class="score"></em>
        nextSlotSeedObj = $('<span class="seed">');
        nextSlotSeedObj.html($("#"+matchID+" ."+currentSlot+" .seed").html());
        
        nextSlotTeamObj = $('<span class="team">');
        nextSlotTeamObj.html($("#"+matchID+" ."+currentSlot+" .team").html());
        
        nextSlotScoreObj = $('<em class="score">');
        
        // Clear the old stuff
        // TODO: check first before doing anything so that we can
        // update other entries as necessary
        nextMatchSlotObj.html("");
        
        nextMatchSlotObj.append(nextSlotSeedObj);
        nextMatchSlotObj.html(nextMatchSlotObj.html() + " ");
        nextMatchSlotObj.append(nextSlotTeamObj);
        nextMatchSlotObj.html(nextMatchSlotObj.html() + " ");
        nextMatchSlotObj.append(nextSlotScoreObj);
        
        // Look ahead
        nextNextMatchSlotObj = $('p[rel="'+nextMatchID+'"]');
        nextNextMatchSlotTeam = $('p[rel="'+nextMatchID+'"] .team').html();
        if ((nextNextMatchSlotObj.length) && (nextNextMatchSlotObj.children().length > 0)
                && (nextNextMatchSlotTeam == nextMatchSlotTeam)) {
            // Click next slot to change everything up!
            bracketDebug("*** Next slot: "+nextMatchID);
            bracketDebug("*** Cur = "+nextMatchSlotTeam+", New = "+nextNextMatchSlotTeam);
            bracketClick(nextMatchSlotObj);
        }
        
        nextMatchSlotObj.animate({
            backgroundColor: "#4c9ed9",
        }, 300, function() {
            nextMatchSlotObj.animate({
                backgroundColor: "transparent",
            }, 300, function() {
                // Animation complete.
            });
        });
    }
    
    enableCompletion();
}

function enableCompletion() {
    if (picksDone()) {
        if (!notifyPicksDone) {
            notifyPicksDone = true;
            showJSModalWindow("Your picks are complete! Now you can go save and share your bracket!<br />" +
                "<a href='javascript:hideJSModalWindow()' class='btn btn-default btn-xs'><b>Close</b></a>", "Picks Complete");
        }
        $('#saveShareBtn').html("Save + Share");
        addTooltip($('#saveShareBtn'), "Save and share your bracket with BracketCode™.", "Share/Save Your Bracket");
    }
}

function bracketDebug(msg) {
    if((bracketDebugEnabled) && (!(typeof console === "undefined"))) {
        console.log(msg);
    }
}

function initBracket() {
    if (bracketDebugEnabled) {
        if (!((typeof debugConsoleReady == 'boolean') && (debugConsoleReady))) {
            setTimeout(initBracket, 1000);
            return;
        }
    }
    
    loadBracketData();
    
    initTooltips();
}

function initTooltips() {
    addTooltip($('#importBtn'), "Import a BracketCode™. The BracketCode™ will overwrite your current picks, so beware!", "Import Bracket");
    addTooltip($('#saveShareBtn'), "You can't share/save your bracket until you complete it!", "<strike>Share/Save Your Bracket</strike> (Disabled)");
    addTooltip($('#resetBtn'), "This will reset your bracket entirely. Once you do this, you can't get your picks back!", "Reset Your Bracket", "qtip-red");
}

function addTooltip(element, msg, title, customStyle) {
    toolTipStyle = (typeof customStyle !== 'undefined') ? (customStyle + " qtip-shadow") : "qtip-light qtip-shadow";
    $(element).qtip({
                content: {
                    text: msg,
                    title: title
                },
                position: {
                    my: 'top center',  // Position my tool tip at...
                    at: 'bottom center', // at the ______ of this...
                },
                style: {
                    classes: toolTipStyle,
                },
            });
}

// Button funcs

function importBracket() {
    showJSModalWindow("Import someone else's bracket by entering their BracketCode™ here::<br /><br />"+
                "<input type='text' id='bracketCodeInput' style='color:#000;width:60%;' /><br /><br />" +
                "<a href='javascript:actuallyImportBracket()' class='btn btn-warning btn-xs'><b>Import</b></a> "+
                "<a href='javascript:hideJSModalWindow()' class='btn btn-default btn-xs'><b>Close</b></a>", "BracketCode - Import Bracket");
}

function actuallyImportBracket() {
    textBracketCode = $("#bracketCodeInput").val().replace(/\s+/g, '');;
    showJSModalWindow("Importing bracket via BracketCode™...", "Importing bracket...");
    importPicks(textBracketCode);
}

function importPicks(code) {
    try {
        if (code == '') throw "Empty input to importPicks()";
        rawPicks = bracketCode.decode(code);
        picks = rawPicks;
    } catch (e) {
        bracketDebug("ERROR OCCURRED WHILE IMPORTING '"+code+"': "+e);
        showJSModalWindow("ERROR: The BracketCode you entered doesn't seem to work.<br />" +
                "<a href='javascript:importBracket()' class='btn btn-success btn-xs'><b>Try Again</b></a> "+
                "<a href='javascript:hideJSModalWindow()' class='btn btn-default btn-xs'><b>Close</b></a>", "Error");
        return;
    }
    
    for (var round in picks) {
        if (round == "round1") continue;
        $("#"+round).animate({
            opacity: 0,
        }, 300);
    }
    
    $("#round7").animate({
            opacity: 0,
        }, 300);
    
    setTimeout(function() {
        renderPicks(rawPicks);
        notifyPicksDone = true;
        enableCompletion();
        hideJSModalWindow();
    }, 400);
    
    setTimeout(function() {
        for (var round in picks) {
            if (round == "round1") continue;
            $("#"+round).animate({
                opacity: 1,
            }, 300);
        }
        
        $("#round7").animate({
                opacity: 1,
            }, 300);
    }, 600);
}

function saveAndShare() {
    if (picksDone()) {
        finalBracketCode = bracketCode.encode(picks);
        showJSModalWindow("<h3>BracketCode™</h3>Yay! Here's your BracketCode™! You can share your bracket by giving this code to everyone.<br /><br />"+
                "<input type='text' value='"+finalBracketCode+"' style='color:#000;width:60%;' /><br /><br />" +
                "<a href='javascript:hideJSModalWindow()' class='btn btn-default btn-xs'><b>Close</b></a>", "BracketCode - Save and Share");
    } else {
        showJSModalWindow("You haven't filled out your bracket yet! It must be completely filled before you can save + share it.<br />" +
                "<a href='javascript:hideJSModalWindow()' class='btn btn-default btn-xs'><b>Close</b></a>", "Oops!");
    }
}

function resetBracket() {
    showJSModalWindow("Are you sure you want to reset your bracket? <b>Your bracket will be LOST.</b><br />" +
                "<a href='javascript:triggerResetBracket()' class='btn btn-danger btn-xs'><b>Yes</b></a> <a href='javascript:hideJSModalWindow()' class='btn btn-default btn-xs'><b>No, back to safety</b></a>", "Oops!");
}

function triggerResetBracket() {
    hideJSModalWindow();
    actuallyResetBracket();
}

function actuallyResetBracket() {
    $('#saveShareBtn').html("<strike>Save + Share</strike>");
    
    initializePicks();
    notifyPicksDone = false;
    initTooltips();
    for (var round in picks) {
        if (round == "round1") continue;
        $("#"+round).animate({
            opacity: 0,
        }, 300);
    }
    
    $("#round7").animate({
            opacity: 0,
        }, 300);
    
    setTimeout(function() {
        for (var round in picks) {
            if (round == "round1") continue;
            $("#"+round+" .region .match .slot").html("");
            bracketDebug("Bringing back: "+round);
            $("#"+round).animate({
                opacity: 1,
            }, 300);
        }
        
        $("#round7 .region #match_r7_final_champion .slot").html("");
        $("#round7").animate({
                opacity: 1,
            }, 300);
    }, 400);
}

function renderPicks(rPicks) {
    initamt = 32;
    
    numRegions = 4;
    
    regionCounter = 0;
    
    for (var round in rPicks) {
        trueRound = parseInt(round.substring(5)) + 1
        
        for (regionCounter = 0; regionCounter < numRegions; regionCounter++) {
            matchObjs = $($("#round"+trueRound).children("div")[regionCounter]).children("div");
            bracketDebug("TRY: "+round);
            if (((matchObjs.length * 2) == (rPicks[round].length / numRegions))
                || (((matchObjs.length * 2) == rPicks[round].length))
                || (matchObjs.length == rPicks[round].length)) {
                targetSlot = 0;
                for (i = 0; i < matchObjs.length; i++) {
                    for (j = 0; j < 2; j++) {
                        matchSlot = (rPicks[round][i+j] == 1) ? "slot1" : "slot2";
                        slotObj = $($(matchObjs[i]).children('p')[j]);
                    
                        if (!slotObj.length)
                            throw "Undefined slotObj";
                        
                        window.curSlotObj = slotObj;
                        
                        prevMatchID = slotObj.attr('rel');
                        
                        bracketDebug("round = "+round+", matchObj (i) = "+i+", slot (j) = "+j+", matchSlot = "+matchSlot+", prevMatchID = "+prevMatchID);
                        bracketDebug(matchObjs);
                        
                        slotSeedObj = $('<span class="seed">');
                        slotSeedObj.html($("#"+prevMatchID+" ."+matchSlot+" .seed").html());
                        
                        slotTeamObj = $('<span class="team">');
                        slotTeamObj.html($("#"+prevMatchID+" ."+matchSlot+" .team").html());
                        
                        slotScoreObj = $('<em class="score">');
                        
                        // Clear the old stuff
                        slotObj.html("");
                        
                        slotObj.append(slotSeedObj);
                        slotObj.html(slotObj.html() + " ");
                        slotObj.append(slotTeamObj);
                        slotObj.html(slotObj.html() + " ");
                        slotObj.append(slotScoreObj);
                        
                        if ($(matchObjs[i]).children('p').length == 1) { bracketDebug("Done round due to no more child objs, breaking"); break; }
                    }
                    if (matchObjs.length == 1) { bracketDebug("Done round due to no more objs, breaking"); break; }
                }
            } else {
                throw "Length mismatch at round "+round+"! (matchObjs.length = "+matchObjs.length+", rPicks[round].length = "+rPicks[round].length;
            }
            
            if (trueRound > 4) break;
        }
    }
}

var loadingTimeout; // timeout id is a global variable

jQuery( document ).ready(function( $ ) {
    initBracket();
    
    if (bracketDebugEnabled) {
        loadingTimeout = window.setTimeout(function() {
            showJSModalWindow("ERROR: Unable to load debug console! The bracket may not be usable.<br />" +
                "<a href='javascript:hideJSModalWindow()' class='btn btn-default btn-xs'><b>Close</b></a>", "Loading Failed");
        }, 5000);
        
        showJSModalWindow("Loading debugging console...<br />(Debugger has been enabled for this session!)", "Loading...");
        bracketDebug("Debugging enabled, loading dependencies for debug console...");
        $.getScript( "js/debug.js", function() {
            window.clearTimeout(loadingTimeout);
            $('<link>')
              .appendTo('head')
              .attr({type : 'text/css', rel : 'stylesheet'})
              .attr('href', 'css/debug.css');
            setTimeout(function() {
                    bracketDebug("Starting debug console...");
                    initDebugConsole();
                    initHookConsoleLog();
                    showDebugConsole();
                }, 1000);
        });
    }
});
