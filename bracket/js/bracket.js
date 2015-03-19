var bracketJSLoaded = true;
var bracket = null;


function loadBracketData() {
    showLoadingWindow("Loading matchups for the bracket...", "Loading...");
    $.ajax({
        url: "yaml/matchup.yaml",
        cache: false,
        dataType: "text",
    })
    .done(function( yaml_data ) {
        bracket = jsyaml.load(yaml_data);
        console.log(yaml_data);
        console.log("Bracket loaded!")
        //populateBracket();
        showBracket(); // remove after debug
    })
    .error(function() {
        showLoadingWindow("ERROR: Could not load matchups for the bracket.<br />" +
            "<a href='javascript:hideLoadingWindow()' style='color: #fff; text-decoration: underline'><b>Close</b></a>",
            "Loading Failed!");
    });
}

function showLoadingWindow(msg, title) {
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

function hideLoadingWindow() {
    $('#modal-window').qtip('destroy');
}

function populateBracket() {
    for (regionIndex = 0; regionIndex < bracket.lineup.regions.length; regionIndex++) {
        regionObj = bracket.lineup.regions[regionIndex];
        for (var region in regionObj) {
            //console.log("Loading region: "+region)
            shortcode = bracket.lineup.shortcodes[region];
            pairCounter = 0
            
            for (matchPairIndex = 0; matchPairIndex < regionObj[region].length; matchPairIndex++) {
                matchPairObj = regionObj[region][matchPairIndex];
                pairCounter++;
                for (var pairName in matchPairObj) {
                    //console.log("Loading pair: "+pairName);
                    teamNumber = 1;
                    for (i = 0; i < matchPairObj[pairName].length; i++) {
                        teamObj = matchPairObj[pairName][i];
                        console.log("Loading: [Region " + region + " (sc: " + shortcode + ")] [Pair " + pairName + "] [PCount " + pairCounter + "] Team: " + teamObj["team"] + " (seed: " + teamObj["seed"] + ")");
                        console.log("#match" + shortcode + pairCounter + " .slot" + teamNumber + " .seed");
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
    hideLoadingWindow();
    $( ".slot" ).animate({
        opacity: "1",
      }, 1000, function() {});
    initializeBracketTransitions();
    initializeBracketClickability();
}

function initializeBracketTransitions() {
    $( ".slot" ).mouseover(function() {
      //console.log("MOver detected over: "+this.innerHTML);
      $(this).animate({
        backgroundColor: "#ffbc8b",
      }, 100, function() {
      // Animation complete.
      });
    });

    $( ".slot" ).mouseout(function() {
      //console.log("MOut detected over: "+this.innerHTML);
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
}

function bracketClick(bracketSlot) {
    matchID = $(bracketSlot).parent().attr('id');
    console.log("bracketClick: matchID is "+matchID);
}


jQuery( document ).ready(function( $ ) {
    loadBracketData();
});
