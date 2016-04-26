/*
 * If supported embed exist
 */
const embedsupport = ['instagram.com','facebook.com','twitter.com','vine.co','youtube.com'];

exports.eval = s => {
	for (var value of embedsupport) {
		var r = s.search(value);
		if( r !== -1 )
			return true
    }
	return false;
};
