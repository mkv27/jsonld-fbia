/*
 * If supported embed exist
 */
const embedsupport = ['instagram.com','facebook.com','twitter.com','vine.co','youtube.com'];

embeds = s => {
	for (var value of embedsupport) {
		var r = s.search(value);
		if( r !== -1 )
			return true
    }
	return false;
};

module.exports = embeds;