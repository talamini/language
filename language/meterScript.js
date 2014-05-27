    function MeterCtrl($scope, $http) {

        var infoFromServer = new Bacon.Bus();

        var svg = d3.select("div.forcegraph").append("svg");

        infoFromServer.onValue(function(v){
            console.info("I'm doing Bacon!  ");
            console.info(v);



        });

        var clicks = $('#myButton').asEventStream('click');

        clicks.onValue(function(){alert('clicked!')});

    	$scope.wordBubbles = [];
    	$scope.Lines = [];
    	$scope.poetry = false;

        var colorList = [
            "#393b79",
            "#5254a3",
            "#6b6ecf",
            "#9c9ede",
            "#637939",
            "#8ca252",
            "#b5cf6b",
            "#cedb9c",
            "#8c6d31",
            "#bd9e39",
            "#e7ba52",
            "#e7cb94",
            "#843c39",
            "#ad494a",
            "#d6616b",
            "#e7969c",
            "#7b4173",
            "#a55194",
            "#ce6dbd",
            "#de9ed6",
            "#1f77b4",
            "#ff7f0e",
            "#2ca02c",
            "#d62728",
            "#9467bd",
            "#8c564b",
            "#e377c2",
            "#7f7f7f",
            "#bcbd22",
            "#17becf"
        ];

        var mostCommonWords = [
            "the",
            "be",
            "to",
            "of",
            "and",
            "a",
            "in",
            "that",
            "have",
            "I",
            "it",
            "for",
            "not",
            "on",
            "with",
            "he",
            "as",
            "you",
            "do",
            "at"
        ];

        $scope.makeGraph = function() {

            var nodes = $scope.wordBubbles;
            var links = $scope.wordBubbles
                .map(function(v, i){
                    if (i < $scope.wordBubbles.length - 1) {
                        return {source: i, target: (i + 1)};
                    }
                })
                .filter(function(v){
                    return !!v;
                });

            var force = d3.layout.force()
                .nodes(nodes)
                .links(links)
                .size([400, 200])
                .gravity([0.01])
                .linkDistance([50])
                .start();

            var link = svg.selectAll("line")
                .data(links)
                .enter().append("line");

            var node = svg.selectAll("text")
                .data(nodes)
                .enter().append("text")
                //.attr("r", 5)
                .call(force.drag);

            force.on("tick", function() {
              link.attr("x1", function(d) { return d.source.x; })
                  .attr("y1", function(d) { return d.source.y; })
                  .attr("x2", function(d) { return d.target.x; })
                  .attr("y2", function(d) { return d.target.y; })
                  .attr("stroke", "black")
                  .attr("stroke-width", 1);

              node.attr("x", function(d) { return d.x; })
                  .attr("y", function(d) { return d.y; })
                  .text(function(d) {return d.text;});
            });
        };

        var rhymeList = [];

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

        $scope.analyzeMeter = function() {

            var ideal = CompareToIdeal(CurrentWholeMeter());

            var countAfter = More2Or3(CurrentWholeMeter());

            $scope.idealAnalysis = "Ideal:  Double:  " + ideal.Double + ", Triple:  " + ideal.Triple;

            $scope.countingAnalysis = "Counting:  Double:  " + countAfter.double + ", Triple:  " + countAfter.triple;

            //$scope.idealAnalysis = $scope.idealAnalysis + " -- Other:  Double:  " + d.double + "  Triple:  " + d.triple;
        }

        function CurrentWholeMeter() {
            var output = "";
            $scope.wordBubbles.map(function(x){
                x.syllables.map(function(y){
                    if (y == "v") {
                        output = output + "0";
                    }
                    if (y == "^") {
                        output = output + "1";
                    }
                });
            });
            return output;
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
    				//console.info("1");
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
    				//console.info("0");
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

    	$scope.toEdit = function(bubble) {

	    	bubble.editing = true;

	    	console.info(bubble);

    	}

    	$scope.unEdit = function(bubble) {

	    	bubble.editing = false;

	    	console.info(bubble);

    	}

        $scope.toAdvanced = function(bubble) {
            bubble.advanced = true;
            console.info(bubble);
        }

        $scope.unAdvanced = function(bubble) {
            bubble.advanced = false;
        }

    	$scope.flipSyllable = function(bubble, index) {
    		if (bubble.syllables[index] == "v") {
    			bubble.syllables[index] = "^";
    		} else {
    			bubble.syllables[index] = "v";
    		}
    	}

    	$scope.addSyllable = function(bubble) {
    		bubble.syllables.push("v");
    	}

        $scope.removeSyllable = function(bubble) {
            bubble.syllables.pop();
        }

    	$scope.processPastedInText = function() {

	    	$scope.wordBubbles = [];
	    	$scope.Lines = [];

    		var linesplit = $scope.pastedInText.split(/\n/);
    		var newlinesreplaced = "";

    		for (var k = 0; k < linesplit.length; k++) {
    			newlinesreplaced = newlinesreplaced + linesplit[k] + "\\ ";
    		}

    		newlinesreplaced = newlinesreplaced.replace(/\u2019/g, "'");

    		//split on NOT a letter or a single quote
    		var split = newlinesreplaced.split(/[^a-zA-Z'\?\!\.\,\:\;\\\(\)]/m).filter(function(v){return v != ""});

    		var newsplit = [];

    		for (var i = 0; i < split.length; i++) {
    			console.info(split[i]);
    			var psplit = split[i].split(/(?=[\!\,\.\;\:\?\\\(\)])/m);
    			
    			for (var j = 0; j < psplit.length; j++) {

    				if (psplit[j].split(/\b/).length == 2) {
    					//deal with punctuation prior to a word, mostly like these ---> (
    					newsplit.push(psplit[j].split(/\b/)[0]);
    					newsplit.push(psplit[j].split(/\b/)[1]);
    				} else {
	    				newsplit.push(psplit[j]);
	    			}
    			}
    		}

    		newsplit.map(function(v){

                var newBubble = {
                    styles: {
                        "background-color": "#A2B8D7"
                    },
                    text: v, 
                    syllables: [], 
                    display: true, 
                    linebreak: false, 
                    editing: false}
    			
    			if (
    				v == "\\" ||
    				v == "!" ||
    				v == "," ||
    				v == "." ||
    				v == ";" ||
    				v == ":" ||
    				v == "?" ||
    				v == ")" ||
    				v == "(") 
    			{
                    newBubble.type = "punctuation";
                    newBubble.styles["margin-left"] = "-5px";
    				$scope.wordBubbles.push(newBubble)
    			} else {
                    newBubble.type = "word";
	    			$scope.wordBubbles.push(newBubble);
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
    					v.text == "?" ||
    					v.text == "(" ||
    					v.text == ")"
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

        $scope.getInfo = function(infoword) {
            console.info("I'm here!  It's " + infoword);

            $http({method: 'GET', 
                    url: 'http://localhost:8008/info/' + infoword,
                    transformResponse: [function(data){return data;}]
                    })
                .success(function(data, status, headers, config){
                    console.info(data);

                    var results = data.match(/[^[\]]+(?=])/g);

                    console.info("results:");

                    console.info(results);
                    console.info(results[0]);

                    var syllables = results[0];
                    //syllables = syllables.match(/[^[\"]+(?=\")/g);
                    syllables = syllables.split('').filter(function(v){return v == '1' || v == '0'});
                    console.info(syllables);

                })
                .error();

        }

        $scope.recalculateRhyme = function(bubble) {

            var rhymeRegex = /(\w\w1[^1]*)$/;

            bubble.rhymekey = rhymeRegex.exec(bubble.pronunciation)[1];

            ProcessRhymes();

        }

        function ProcessRhymes() {
            $scope.wordBubbles.map(function(x, i){

                var matches = $scope.wordBubbles.filter(function(y){
                    return x.rhymekey == y.rhymekey 
                    && x.text.toUpperCase() != y.text.toUpperCase() 
                    && (!!x.rhymekey)
                    && (!!y.rhymekey);
                });
                if (matches.length > 0) {
                    rhymeList.push({rhymekey: x.rhymekey});
                }

            });

            var newRhymeList = [];
            rhymeList.map(function(x, i){
                var matches = rhymeList.slice(i).filter(function(y){
                    return y.rhymekey == x.rhymekey;
                })
                if (matches.length == 1) {
                    newRhymeList.push(x);
                }
            });

            console.info("new rhyme list");
            console.info(newRhymeList);

            rhymeList = newRhymeList;

            //get rid of duplicates
           /* [{"rhymekey": "foo"} {"rhymekey": "bar"} {"rhymekey": "foo"}]
                .reduce(function (acc, item) {
                var arr = acc[item.rhymekey];
                if (!arr)
                    arr = [];
                arr.push(item);
                acc[item.rhymekey] = arr;
                return acc;
            }, {})
                rhymes = []
                rhymeObj = {
                    "foo": [{ryhmekey: "foo"} {rhymekey: "foo"}]
                    "bar": [{rhymekey: "bar"}]
                }
                for (var key in rhymeObj  ) {

                    if (rhmeObj[key].length > 1)
                        rhymes.push(rymeObj[key])
                }*/

            rhymeList.map(function(x, i){
                if (!!colorList[i]) {
                    x.color = colorList[i];
                } else {
                    x.color = "white";
                }

            });

            console.info(rhymeList);

            $scope.wordBubbles.map(function(x, i){

                rhymeList.map(function(y){
                    if (y.rhymekey == x.rhymekey) {
                        x.styles["background-color"] = y.color;
                    }
                });

            });

        }

        $scope.analyzePuns = function() {
            console.info("button clicked");

            StartGettingPuns();
        }

        function StartGettingPuns() {
            var wordsWithoutPuns = $scope.wordBubbles
            .filter(function(v){
                return (v.type == "word")
            })
            .filter(function(v){
                return (!v.puns);
            });

            console.info(wordsWithoutPuns);
            console.info("length is " + wordsWithoutPuns.length);
            if (wordsWithoutPuns.length > 0) {
                console.info("going in again!");
                wordsWithoutPuns[0].styles["border-color"] = "red";
                $http({method: 'GET', 
                    url: 'http://localhost:8008/pun/' + wordsWithoutPuns[0].text,
                    transformResponse: [function(data){return data;}]
                    })
                    .success(function(data, status, headers, config){

                        var isWord = /\w/;

                        var puns = data
                            .split('\"')
                            .filter(function(v){
                                return isWord.test(v);
                            })
                            .map(function(v){
                                return v.split('(')[0].toLowerCase();
                            });

                        wordsWithoutPuns[0].puns = puns;
                        wordsWithoutPuns[0].styles["border-color"] = "black";

                        console.info(puns);

                        StartGettingPuns();

                    })
                    .error(function(data, status, headers, config){
                        console.info("error!");
                        console.info(data);
                        console.info(status);

                        wordsWithoutPuns[0].puns = [];

                    });
            } else {
                console.info("There are no more words to get puns for");
            }
        }

		function StartGettingSyllables() {

			var wordsWithoutSyllables = $scope.wordBubbles.filter(function(v){
				return (v.syllables == "" && v.type == "word");
			});

			if (wordsWithoutSyllables.length > 0) {
				//console.info("There are some words without syllables");

				//console.info(wordsWithoutSyllables[0].word);

				$http({method: 'GET', 
					url: 'http://localhost:8008/info/' + wordsWithoutSyllables[0].text,
					transformResponse: [function(data){return data;}]
					}).
				    success(function(data, status, headers, config) {
				    	console.info("Success!");
				    	console.info(data);

                        var results = data.match(/[^[\]]+(?=])/g);

                        var syll = results[0];
                        var pron = results[1];
                        var syn = results[2];
                        var rhy = results[3];

                        var isWord = /\w/;

                        var synonyms = syn
                            .split('\"')
                            .filter(function(v){
                                return isWord.test(v);
                            })
                            .map(function(v){
                                return v.split('(')[0].toLowerCase();
                            });

                        synonyms.shift();

                        wordsWithoutSyllables[0].synonyms = synonyms;

                        var regex = /rhymekey\" \"(.*)\"/;

                        if (!!regex.exec(rhy)) {
                            rhy = regex.exec(rhy)[1];
                        } else {
                            rhy = null;
                        }

                        wordsWithoutSyllables[0].rhymekey = rhy;

                        var preg = /pronounce\" \"(.*)\"/;

                        if (!!preg.exec(pron)) {
                            pron = preg.exec(pron)[1];
                        } else {
                            pron = null;
                        }

                        wordsWithoutSyllables[0].pronunciation = pron;

				    	syll = syll.split('').filter(function(v){return v == '1' || v == '0'});
				    	syll = syll.map(function(v){

				    		if (v == "0") {
				    			return "v";
				    		}
				    		if (v == "1") {
				    			return "^";
				    		}
				    	});

				    	wordsWithoutSyllables[0].syllables = syll;

                        infoFromServer.push(wordsWithoutSyllables[0]);

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

                ProcessRhymes();

			}
		}

    }