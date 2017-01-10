app
	.run(["$templateCache", function($templateCache) {
  	$templateCache.put("template-popover.htmls","<h2>Teste {{popover.id}}</h2>");
  }]);
