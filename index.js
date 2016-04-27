/**
    * jsonld-to-fbia v1.1.1
    *
    * Copyright (c) 2016 mkv27
    * MIT Licensed
 */

const request = require('request');
const fs = require('fs');
const cheerio = require('cheerio');
const endOfLine = require('os').EOL;
const moment = require('moment');

const elements = require('./Elements');


moment.updateLocale('es',{
    months: ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
});

var url_user = process.argv[2];
//url_canonical without trailing slash
var url_canonical = url_user.replace(/\/$/, "");

// Facebook Instant Article basic markup template
var iamarkup_template = fs.readFileSync('template.html', 'utf8');


request(url_user, function(error, response, body){
    if(!error && response.statusCode == 200){

        var data = body;

        /**
         * Get data from url given
         */
    	$ = cheerio.load(data);

        var jsonld = JSON.parse( $('script[type="application/ld+json"]').text() );

        var jsoniafb = JSON.parse( $('script[type="application/ia+fb"]').text() );
        
        var web_title = jsonld.headline,
        web_image_featured = jsonld.image.url,
        web_author = jsonld.author.name,
        web_kicker = jsonld.description,
        web_time = jsonld.dateModified;

        var web_time_format = moment(web_time).format('MMMM D[,] Y hh[:]mm a');
        $ = cheerio.load(jsoniafb.content);
    	var web_content = $('p');

        /**
         * Write data in fbai template
         */
    	$ = cheerio.load(iamarkup_template);

    	$('link[rel="canonical"]').attr("href",url_canonical);
    	$('head title').html(web_title);
    	$('header figure img').attr("src",web_image_featured);
    	$(".op-kicker").html(web_kicker);
    	$(".op-published,.op-modified").attr("dateTime",web_time).html(web_time_format);
    	$("address").html(web_author);

    	var parray = [];
    	$(web_content).each(function(i, elem) {
            //console.log(elem.children[0].name);
            if(elem.children[0].type == 'tag' && elem.children[0].name == 'iframe'){
                parray[i] = elements.html.socialembed($(this).html());
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

    }
});