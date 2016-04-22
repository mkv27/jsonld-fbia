/**
    * jsonld-to-fbia v1.0.0
    *
    * Copyright (c) 2016 mkv27
    * MIT Licensed
 */

var http = require("http");
var fs = require('fs');
var url = require('url');
var cheerio = require('cheerio');
var endOfLine = require('os').EOL;


var url_canonical = process.argv[2];
var url_parse = url.parse(url_canonical,true,true);


var urlPath = url_parse.pathname + '/popup';//fix only altavoz.pe
var urlPort = url_parse.port !== null ? url_parse.port : 80;

// Facebook Instant Article basic markup template
var iamarkup_template = fs.readFileSync('template.html', 'utf8');


var options = {
  host: url_parse.host,
  port: urlPort,
  path: urlPath
};

http.get(options, function (http_res) {

    var data = "";

    http_res.on("data", function (chunk) {
        data += chunk;
    });

    http_res.on("end", function () {

        /**
         * Get data from url given
         */
    	$ = cheerio.load(data);

        var jsonld = JSON.parse( $('script[type="application/ld+json"]').text() );
        
        var web_title = jsonld.headline,
        web_image_featured = jsonld.image.url,
        web_author = jsonld.author.name,
        web_kicker = jsonld.description,
        web_time = jsonld.dateModified;
    	
    	var web_time_html = $(".post-meta time").html();
    	var web_content = $(".post-full_entry p");

    	web_content.splice(0,1);
    	web_content.splice(web_content.length-1,1);

        /**
         * Write data in fbai template
         */
    	$ = cheerio.load(iamarkup_template);

    	$('link[rel="canonical"]').attr("href",url_canonical);
    	$('head title').html(web_title);
    	$('header figure img').attr("src",web_image_featured);
    	$(".op-kicker").html(web_kicker);
    	$(".op-published,.op-modified").attr("dateTime",web_time).html(web_time_html);
    	$("address").html(web_author);

    	var parray = [];
    	$(web_content).each(function(i, elem) {
            //console.log(elem.children[0].name);
            if(elem.children[0].type == 'tag' && elem.children[0].name == 'iframe'){
                parray[i] = `<figure class="op-social">${$(this).html()}</figure>`;
            }else{
                parray[i] = `<p>${$(this).html()}</p>`;
            } 
        });
		parray = endOfLine + endOfLine + parray.join(endOfLine+endOfLine);

		$("header").after(parray);

    	fs.writeFile('fbia.html', $.html(), function (err) {
			if (err) return console.log(err);
			console.log('New IA created > ia.html');
		});
        
    });
});

