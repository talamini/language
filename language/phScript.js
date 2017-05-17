function PHCtrl($scope, $http) {
//for debugging only
window.MY_SCOPE = $scope;

	var nodes = [];
	var links = [];
	
	$scope.inputWord = 'mandate';
	$scope.suggestions = [];

	$scope.advanced = false;
	$scope.input = {};
	$scope.input.blueWord = 'mandate';
	$scope.input.redWord = 'deep';

	$scope.status = {};
	$scope.status.redSynonymsCount = 0;
	$scope.status.blueSynonymsCount = 0;
	$scope.status.showSynonymsCount = false;
	$scope.status.message = "";

	$scope.bigRedList = [];
	$scope.bigBlueList = [];
	$scope.bigRedListIsComplete = false;
	$scope.bigBlueListIsComplete = false;

	$scope.redSuggestions = [];
	$scope.blueSuggestions = [];
	
	function getRhymes(word, callback) {

		$http({method: 'GET', 
			url: 'http://localhost:8008/rhyme/' + word,
			transformResponse: [function(data){return data;}]
			}).
			success(function(data, status, headers, config) {
				
				var isWord = /\w/;

				var rhymes = data
					.split('\"')
					.filter(function(v){
					return isWord.test(v);
					})
					.map(function(v){
					return v.split('(')[0].toLowerCase();
					});
					
				callback(rhymes);				
			})
			.error(function(data){
				console.info("error!");
			});
	
	}


	function getSynonyms(word, callback) {

		$http({method: 'GET', 
			url: 'http://localhost:8008/info/' + word,
			transformResponse: [function(data){return data;}]
			}).
			success(function(data, status, headers, config) {
				
				var results = data.match(/[^[\]]+(?=])/g);
				
				var syn = results[2];
				
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
				
				callback(synonyms);
				
			})
			.error(function(data){
				console.info("error!");
			});
	
	}
	
	function draw() {

		var force = d3.layout.force()
		.nodes(nodes)
		.links(links)
		.size([600, 600])
		.gravity([0.02])
		.linkDistance([200])
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
	
	}

	var svg = d3.select("div.forcegraph").append("svg")
	.attr("height", "100%")
	.attr("width", "100%");

  $scope.easyButtonClick = function() {

  	$scope.redSuggestions = [];
  	$scope.blueSuggestions = [];
  	$scope.status.blueSynonymsCount = 0;
  	$scope.status.blueSynonymsTotal = 0;
  	$scope.status.redSynonymsCount = 0;
  	$scope.status.redSynonymsTotal = 0;
  	$scope.status.showSynonymsCount = true;
  	$scope.status.message = "";
  	$scope.bigBlueList.length = 0;
  	$scope.bigRedList.length = 0;

    getSynonyms($scope.input.blueWord, function(synonyms) {
        console.log("just got " + synonyms.length + " synonyms to " + $scope.input.blueWord);
        $scope.status.blueSynonymsTotal = synonyms.length;
        if (synonyms.length == 0) {
            $scope.status.message = "I couldn't find " + $scope.input.blueWord + " in my thesaurus";
        }
        synonyms.map(function(v, i){

            getRhymes(v, function(rhymes){
                $scope.status.blueSynonymsCount++;
                $scope.bigBlueList.push({word: v, rhymes: rhymes});
                if ($scope.bigBlueList.length == synonyms.length) {
                    $scope.bigBlueListIsComplete = true;
                    if ($scope.bigRedListIsComplete) {
                        $scope.bigBlueListIsComplete = false;
                        $scope.bigRedListIsComplete = false;
                        bothListsComplete();
                    }
                }
            });
        });
    });

    getSynonyms($scope.input.redWord, function(synonyms) {
        console.log("just got " + synonyms.length + " synonyms to " + $scope.input.redWord);
        $scope.status.redSynonymsTotal = synonyms.length;
        if (synonyms.length == 0) {
            $scope.status.message = "I couldn't find " + $scope.input.redWord + " in my thesaurus";
        }
        synonyms.map(function(v, i){

            getRhymes(v, function(rhymes){
                $scope.status.redSynonymsCount++;
                $scope.bigRedList.push({word: v, rhymes: rhymes});
                    if ($scope.bigRedList.length == synonyms.length) {
                        $scope.bigRedListIsComplete = true;
                        if ($scope.bigBlueListIsComplete) {
                            $scope.bigBlueListIsComplete = false;
                            $scope.bigRedListIsComplete = false;
                            bothListsComplete();
                        }
                    }
            });
        });
    });

  }

  function bothListsComplete() {
console.info("starting bothlistscomplete");
    var flatRedRhymes = [];
    //var flatBlueRhymes = [];
    //var flatRedSynonyms = [];
    var flatBlueSynonyms = [];

    for (i in $scope.bigRedList) {
        flatRedRhymes = flatRedRhymes.concat(
            $scope.bigRedList[i].rhymes.map(function(v){
                return {word: v, cameFrom: $scope.bigRedList[i].word}
            })

        );
        //flatRedSynonyms.push($scope.bigRedList[i].word);
    }

    for (i in $scope.bigBlueList) {
        /*flatBlueRhymes = flatBlueRhymes.concat(

            $scope.bigBlueList[i].rhymes.map(function(v){
                return {word: v, cameFrom: $scope.bigBlueList[i].word}
            })
        );*/
        flatBlueSynonyms.push($scope.bigBlueList[i].word);
    }

    console.info(flatBlueSynonyms.length + "    " + flatRedRhymes.length);

    //we want to find red rhymes equal to blue synonyms & vice versa

    /*$scope.redSuggestions = flatBlueRhymes.filter(function(n) {
        return flatRedSynonyms.indexOf(n.word) !== -1;
    });*/


    var temp = flatRedRhymes.filter(function(n) {
        return flatBlueSynonyms.indexOf(n.word) !== -1;
    });

    $scope.blueSuggestions = temp.filter(function(v) {
        return (v.word !== v.cameFrom);
    })

    if ($scope.blueSuggestions.length > 0) {
      $scope.status.message = "Here are " + $scope.blueSuggestions.length + " rhyming synonyms:";
    } else {
      $scope.status.message = "Sorry, couldn't find any intersections.";
    }

  }

  $scope.buttonClick = function() {
    console.info($scope.inputWord);

	/*var nodes = $scope.wordBubbles;
	var links = $scope.wordBubbles
		.map(function(v, i){
			if (i < $scope.wordBubbles.length - 1) {
				return {source: i, target: (i + 1)};
			}
		})
		.filter(function(v){
			return !!v;
		});*/
		
	nodes = [{text: $scope.inputWord.toLowerCase()}];

		getSynonyms($scope.inputWord, function(synonyms) {
			console.info("got synonyms!")
			console.info(synonyms);
			
			synonyms.map(function(v, i){
				//nodes.push({text: v});
				//links.push({source: 0, target: i + 1});
				
				getRhymes(v, function(rhymes){
					$scope.suggestions.push({word: v, rhymes: rhymes});
					console.info(v + ": ");
					console.info(rhymes);
				});
				
			});
			
			//draw();
			
		});
		
		/*getRhymes($scope.inputWord, function(rhymes) {
			console.info("got rhymes!");
			console.info(rhymes);
		});*/
	
  }

}