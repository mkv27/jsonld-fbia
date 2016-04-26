const ifembed = require('./embeds.js');

exports.html = {
	image(src,caption){
		return `
			<figure>
				<img src="${src}" />
				<figcaption>${caption}</figcaption>
			</figure>
		`;
	},
	socialembed(iframe){
		if( ifembed.eval (iframe))
			return `
				<figure class="op-social">${iframe}</figure>
			`;
		else
			return '';
	}

};