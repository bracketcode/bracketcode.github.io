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
