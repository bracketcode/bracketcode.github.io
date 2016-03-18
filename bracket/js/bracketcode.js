/**
* Convert From/To Binary/Decimal/Hexadecimal in JavaScript
* https://gist.github.com/faisalman
*
* Copyright 2012, Faisalman <fyzlman@gmail.com>
* Licensed under The MIT License
* http://www.opensource.org/licenses/mit-license
*/

(function(){

    var convertBase = function (num) {
        this.from = function (baseFrom) {
            this.to = function (baseTo) {
                return parseInt(num, baseFrom).toString(baseTo);
            };
            return this;
        };
        return this;
    };
        
    // binary to decimal
    this.bin2dec = function (num) {
        return convertBase(num).from(2).to(10);
    };
    
    // binary to hexadecimal
    this.bin2hex = function (num) {
        return convertBase(num).from(2).to(16);
    };
    
    // decimal to binary
    this.dec2bin = function (num) {
        return convertBase(num).from(10).to(2);
    };
    
    // decimal to hexadecimal
    this.dec2hex = function (num) {
        return convertBase(num).from(10).to(16);
    };
    
    // hexadecimal to binary
    this.hex2bin = function (num) {
        return convertBase(num).from(16).to(2);
    };
    
    // hexadecimal to decimal
    this.hex2dec = function (num) {
        return convertBase(num).from(16).to(10);
    };
    
    return this;        
})();

/*
* Usage example:
* bin2dec('111'); // '7'
* dec2hex('42'); // '2a'
* hex2bin('f8'); // '11111000'
* dec2bin('22'); // '10110'
*/

/* enyo @ http://stackoverflow.com/a/16436975 */
function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

var bracketCode = {
    encode: function(bracketObj) {
        bracketCodeStr = ""
        
        if (!this.bracketDone(bracketObj))
            throw "Bracket object is incomplete - can't convert incomplete bracket.";
        
        for (var round in bracketObj) {
            // Only add dash if the string isn't blank
            // We do this so we don't have to do the alternative - truncating
            // the dash at the end.
            if (bracketCodeStr != "") bracketCodeStr += "-";
            roundDigits = ""
            for (i = 0; i < bracketObj[round].length; i++) {
                roundDigits += bracketObj[round][i];
            }
            bracketCodeStr += dec2hex(bin2dec(roundDigits));
        }
        return bracketCodeStr.toUpperCase();
    },
    decode: function(bracketCodeStr) {
        bracketObj = this.makeBracket();
        
        bracketPieces = bracketCodeStr.split("-");
        bracketRoundCounter = 0;
        
        initamt = 32;
        
        for (var round in bracketObj) {
            roundDigits = hex2bin(bracketPieces[bracketRoundCounter]);
            
            if (roundDigits.length < initamt) {
                for (i = 0; i < (initamt - roundDigits.length); i++) {
                    roundDigits = "0" + roundDigits;
                }
            } else if (roundDigits.length > initamt) {
                throw "BracketCode is invalid - "+round+" is too large!";
            }
            
            for (i = 0; i < roundDigits.length; i++) {
                bracketObj[round][i] = parseInt(roundDigits[i]);
            }
            
            initamt = initamt / 2;
            bracketRoundCounter++;
        }
        
        return bracketObj;
    },
    makeBracket: function() {
        bracketObj = { round1 : [], round2 : [], round3 : [], round4 : [], round5 : [], round6 : [] };
        
        initamt = 32;
        
        for (var round in picks) {
            for (i = 0; i < initamt; i++) {
                bracketObj[round].push(null);
            }
            initamt = initamt / 2;
        }
        
        return bracketObj;
    },
    bracketDone: function(bracketObj) {
        done = true;
        for (var round in bracketObj) {
            for (i = 0; i < bracketObj[round].length; i++) {
                if (bracketObj[round][i] === null) {
                    done = false;
                    break;
                }
            }
            if (!done) break;
        }
        return done;
    },
}

function testBracketCode() {
    bcode = bracketCode.encode(picks);
    new_bracket = bracketCode.decode(bcode);
    
    if (arraysEqual(picks.round1, new_bracket.round1) && \
        arraysEqual(picks.round2, new_bracket.round2) && \
        arraysEqual(picks.round3, new_bracket.round3) && \
        arraysEqual(picks.round4, new_bracket.round4) && \
        arraysEqual(picks.round5, new_bracket.round5) && \
        arraysEqual(picks.round6, new_bracket.round6)) {
        bracketDebug("BracketCode validated!");
    } else {
        bracketDebug("ERROR: BracketCode failed validation!");
        bracketDebug("Round 1 match: " + arraysEqual(picks.round1, new_bracket.round1));
        bracketDebug("Round 2 match: " + arraysEqual(picks.round2, new_bracket.round2));
        bracketDebug("Round 3 match: " + arraysEqual(picks.round3, new_bracket.round3));
        bracketDebug("Round 4 match: " + arraysEqual(picks.round4, new_bracket.round4));
        bracketDebug("Round 5 match: " + arraysEqual(picks.round5, new_bracket.round5));
        bracketDebug("Round 6 match: " + arraysEqual(picks.round6, new_bracket.round6));
    }
}

var partialBracketCode = {
    encode: function(bracketObj) {
        bracketCodeStr = ""
        
        for (var round in bracketObj) {
            // Only add dash if the string isn't blank
            // We do this so we don't have to do the alternative - truncating
            // the dash at the end.
            if (bracketCodeStr != "") bracketCodeStr += "-";
            roundDigits = ""
            allDigitsDefined = true;
            for (i = 0; i < bracketObj[round].length; i++) {
                if (bracketObj[round][i] == null) {
                    allDigitsDefined = false;
                    break;
                } else {
                    roundDigits += bracketObj[round][i];
                }
            }
            if (allDigitsDefined) {
                bracketCodeStr += dec2hex(bin2dec(roundDigits));
            } else {
                // Remove leading dash
                bracketCodeStr.substring(0, bracketCodeStr.length - 1);
            }
        }
        return bracketCodeStr.toUpperCase();
    },
    decode: function(bracketCodeStr) {
        bracketObj = this.makeBracket();
        
        bracketPieces = bracketCodeStr.split("-");
        bracketRoundCounter = 0;
        
        initamt = 32;
        
        for (var round in bracketObj) {
            roundDigits = hex2bin(bracketPieces[bracketRoundCounter]);
            
            if (roundDigits.length < initamt) {
                for (i = 0; i < (initamt - roundDigits.length); i++) {
                    roundDigits = "0" + roundDigits;
                }
            } else if (roundDigits.length > initamt) {
                throw "BracketCode is invalid - "+round+" is too large!";
            }
            
            for (i = 0; i < roundDigits.length; i++) {
                bracketObj[round][i] = parseInt(roundDigits[i]);
            }
            
            initamt = initamt / 2;
            bracketRoundCounter++;
        }
        
        return bracketObj;
    },
    makeBracket: function() {
        bracketObj = { round1 : [], round2 : [], round3 : [], round4 : [], round5 : [], round6 : [] };
        
        initamt = 32;
        
        for (var round in picks) {
            for (i = 0; i < initamt; i++) {
                bracketObj[round].push(null);
            }
            initamt = initamt / 2;
        }
        
        return bracketObj;
    },
    bracketDone: function(bracketObj) {
        done = true;
        for (var round in bracketObj) {
            for (i = 0; i < bracketObj[round].length; i++) {
                if (bracketObj[round][i] === null) {
                    done = false;
                    break;
                }
            }
            if (!done) break;
        }
        return done;
    },
}
