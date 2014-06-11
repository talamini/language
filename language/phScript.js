function PHCtrl($scope, $http) {

	var nodes = [];
	var links = [];
	
	$scope.inputWord = 'mandate';
	$scope.suggestions = [];
	
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