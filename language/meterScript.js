    function MeterCtrl($scope, $http) {

    	$scope.wordBubbles = [];

    	$scope.processPastedInText = function() {

    		

    		var split = $scope.pastedInText.split(/[^a-zA-Z']/).filter(function(v){return v != ""});
    		split.map(function(v){
    			$scope.wordBubbles.push({word: v, syllables: ""});
    		});
    		StartGettingSyllables()
    	};

		function StartGettingSyllables() {

			var wordsWithoutSyllables = $scope.wordBubbles.filter(function(v){
				return v.syllables == "";
			});

			if (wordsWithoutSyllables.length > 0) {
				console.info("There are some words without syllables");

				console.info(wordsWithoutSyllables[0].word);

				$http({method: 'GET', 
					url: 'http://localhost:8008/syllables/' + wordsWithoutSyllables[0].word,
					transformResponse: [function(data){return data;}]
					}).
				    success(function(data, status, headers, config) {
				    	console.info("Success!");
				    	console.info(data);

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
				    	console.info(data);
				    	console.info("Error!");

				    	var badword = wordsWithoutSyllables[0];
				    	var i = $scope.wordBubbles.indexOf(badword);

				    	console.info("Removing bad word");

				    	$scope.wordBubbles.splice(i, 1);

				    	StartGettingSyllables();

				    });

			} else {
				console.info("There are no words without syllables");
			}
		}

    }