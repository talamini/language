    function MeterCtrl($scope, $http) {

    	$scope.wordBubbles = [];
    	$scope.Lines = [];
    	$scope.poetry = false;

    	var disyllable = {
    		"0 0": "pyrrhus",
    		"0 1": "iamb",
    		"1 0": "trochee",
    		"1 1": "spondee"
    	}
    	var trisyllable = {
    		"0 0 0": "tribrach",
    		"1 0 0": "dactyl",
    		"0 1 0": "amphibrach",
    		"0 0 1": "anapaest",
    		"0 1 1": "bacchius",
    		"1 1 0": "antibacchius",
    		"1 0 1": "cretic",
    		"1 1 1": "molossus"
    	}
    	var feet = {
    		disyllable: disyllable,
    		trisyllable: trisyllable
    	}

    	function DivideIntoFeet2(syllables) {
    		var tempSyllables = syllables;
    		var o = [];
    		for (var i = 0; i < syllables.length; i++) {
    			var s = tempSyllables.substring(0, i);
    			if(!!feet.disyllable[s]) {
    				o.push(feet.disyllable[s]);
    				tempSyllables = tempSyllables.substring(s.length + 1);
    				i = i - (s.length + 1);
				}
    		}
    		return o;
    	}
    	function DivideIntoFeet3(syllables) {
    		var tempSyllables = syllables;
    		var o = [];
    		for (var i = 0; i < syllables.length; i++) {
    			var s = tempSyllables.substring(0, i);
    			if(!!feet.trisyllable[s]) {
    				o.push(feet.trisyllable[s]);
    				tempSyllables = tempSyllables.substring(s.length + 1);
    				i = i - (s.length + 1);
				}
    		}
    		return o;
    	}

    	function More2Or3(syllables) {
    		var howManyNow = 0;
    		var number2 = 0;
    		var number3 = 0;
    		for (var i = 0; i < syllables.length; i++) {
    			if (syllables.substring(i, i + 1) == "1") {
    				console.info("1");
    				//reset
    				if (howManyNow == 1) {
    					number2++;
    				}
    				if (howManyNow == 2) {
    					number3++;
    				}
    				howManyNow = 0;
    			}
    			if (syllables.substring(i, i + 1) == "0") {
    				console.info("0");
    				howManyNow++;
    			}
    		}
    		return {"double": number2, "triple": number3};
    	}

    	function CompareToIdeal(syllables) {
    		var ideal2 = "";
    		for (var i = 0; i < syllables.length / 2; i++) {
    			ideal2 = ideal2 + "01";
    		}

    		i1 = ideal2.split('');
    		i2 = (ideal2.substring(1) + "0").split('');

    		var ideal3 = "";
    		for (var i = 0; i < syllables.length / 3; i++) {
    			ideal3 = ideal3 + "001";
    		}

    		i3 = ideal3.split('');
    		i4 = (ideal3.substring(1) + "0").split('');
    		i5 = (ideal3.substring(2) + "00").split('');

    		var s1 = 0;
    		var s2 = 0;
    		var s3 = 0;
    		var s4 = 0;
    		var s5 = 0;

    		for (var i = 0; i < syllables.length; i++) {
    			var currentChar = syllables.substring(i, i+1);
    			if (currentChar == i1[i]){s1++;}
    			if (currentChar == i2[i]){s2++;}
    			if (currentChar == i3[i]){s3++;}
    			if (currentChar == i4[i]){s4++;}
    			if (currentChar == i5[i]){s5++;}
    		}

    		var d = s1;
    		if (s2 > d) {
    			d = s2;
    		}

    		var t = s3;
    		if (s4 > t) {
    			t = s4;
    		}
    		if (s5 > t) {
    			t = s5;
    		}

	    	return {
	    		"Double": d,
	    		"Triple": t
	    	};

    	}


    	//also try this:  Divided into lines, measure how often each line matches a grid of ideal double vs ideal triple meter
    	//double meter needs to count the highest of either the original grid, or offset by 1
    	//triple meter needs to count the highest between it and it offest by 1 and then by 2 also

    	$scope.processPastedInText = function() {

    		var linesplit = $scope.pastedInText.split(/\n/);
    		var newlinesreplaced = "";

    		for (var k = 0; k < linesplit.length; k++) {
    			newlinesreplaced = newlinesreplaced + linesplit[k] + "\\ ";
    		}

    		//split on NOT a letter or a single quote
    		var split = newlinesreplaced.split(/[^a-zA-Z'\?\!\.\,\:\;\\]/m).filter(function(v){return v != ""});

    		var newsplit = [];

    		for (var i = 0; i < split.length; i++) {
    			var psplit = split[i].split(/(?=[\!\,\.\;\:\?\\])/m);

    			for (var j = 0; j < psplit.length; j++) {
    				newsplit.push(psplit[j]);
    			}
    		}

    		newsplit.map(function(v){
    			
    			if (
    				v == "\\" ||
    				v == "!" ||
    				v == "," ||
    				v == "." ||
    				v == ";" ||
    				v == ":" ||
    				v == "?") 
    			{
    				$scope.wordBubbles.push({type: "punctuation", text: v, syllables: "", display: true, linebreak: false})
    			} else {
	    			$scope.wordBubbles.push({type: "word", text: v, syllables: "", display: true, linebreak: false});
	    		}
    		});

    		LineBreak();

    		UnDisplay();

    		Lines();

    		StartGettingSyllables()
    	};

    	function LineBreak() {
    		$scope.wordBubbles.map(function(v){
    			if ($scope.poetry == false) {
    				if (v.text == "\\" ||
    					v.text == "!" ||
    					v.text == "," ||
    					v.text == "." ||
    					v.text == ";" ||
    					v.text == ":" ||
    					v.text == "?"
    					) {
    					v.linebreak = true;
    				}
    			} else {
    				if (v.text == "\\") {
    					v.linebreak = true;
    				}
    			}
    		});
    	}

    	function UnDisplay() {
    		$scope.wordBubbles.map(function(v){
    			if (v.type == "punctuation" && v.text == "\\") {
    				v.display = false;
    			}
    		});
    	}

    	function Lines() {
    		var l = [];
    		var current = [];
    		for (var i = 0; i < $scope.wordBubbles.length; i++) {
    			var c = $scope.wordBubbles[i];
    			if (c.linebreak == false) {
    				current.push(c);
    			}
    			if (c.linebreak == true) {
    				current.push(c);
    				l.push(current);
    				current = [];
    			}
    		}

    		$scope.Lines = l;
    	}



		function StartGettingSyllables() {

			var wordsWithoutSyllables = $scope.wordBubbles.filter(function(v){
				return (v.syllables == "" && v.type == "word");
			});

			if (wordsWithoutSyllables.length > 0) {
				//console.info("There are some words without syllables");

				//console.info(wordsWithoutSyllables[0].word);

				$http({method: 'GET', 
					url: 'http://localhost:8008/syllables/' + wordsWithoutSyllables[0].text,
					transformResponse: [function(data){return data;}]
					}).
				    success(function(data, status, headers, config) {
				    	//console.info("Success!");
				    	//console.info(data);

				    	var parsed = data.split('').filter(function(v){return v == '1' || v == '0'});
				    	parsed = parsed.map(function(v){

				    		if (v == "0") {
				    			return "V";
				    		}
				    		if (v == "1") {
				    			return "^";
				    		}
				    	})

				    	wordsWithoutSyllables[0].syllables = parsed;

				    	var newWordsWithoutSyllables = $scope.wordBubbles.filter(function(v){
							return v.syllables == "";
						});

						if (newWordsWithoutSyllables.length > 0) {
							StartGettingSyllables();
						}

				    }).
				    error(function(data, status, headers, config) {
				    	//console.info(data);
				    	//console.info("Error!");

				    	var badword = wordsWithoutSyllables[0];
				    	var i = $scope.wordBubbles.indexOf(badword);

				    	//console.info("Removing bad word");

				    	$scope.wordBubbles.splice(i, 1);

				    	StartGettingSyllables();

				    });

			} else {
				console.info("There are no words without syllables");
			}
		}

    }