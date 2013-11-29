/*
 * Mercator projection that takes into account that the Earth is not a perfect sphere.
 * Less popular than spherical mercator; used by projections like EPSG:3395.
 */

L.Projection.Mercator = {

	MAX_LATITUDE: 85.0840591556,

	R_MINOR: 6356752.314245179,
	R_MAJOR: 6378137,

	bounds: L.bounds(
		[-20037508.34279, -15496570.73972],
		[20037508.34279, 18764656.23138]),

	project: function (latlng) {
		var d = L.LatLng.DEG_TO_RAD,
		    max = this.MAX_LATITUDE,
		    r = this.R_MAJOR,
		    x = latlng.lng * d * r,
		    y = Math.max(Math.min(max, latlng.lat), -max) * d,
		    tmp = this.R_MINOR / r,
		    eccent = Math.sqrt(1.0 - tmp * tmp),
		    con = eccent * Math.sin(y);

		con = Math.pow((1 - con) / (1 + con), eccent * 0.5);

		var ts = Math.tan(0.5 * ((Math.PI * 0.5) - y)) / con;
		y = -r * Math.log(ts);

		return new L.Point(x, y);
	},

	unproject: function (point) {
		var d = L.LatLng.RAD_TO_DEG,
		    r = this.R_MAJOR,
		    lng = point.x * d / r,
		    tmp = this.R_MINOR / r,
		    eccent = Math.sqrt(1 - (tmp * tmp)),
		    ts = Math.exp(- point.y / r),
		    phi = (Math.PI / 2) - 2 * Math.atan(ts),
		    numIter = 15,
		    tol = 1e-7,
		    i = numIter,
		    dphi = 0.1,
		    con;

		while ((Math.abs(dphi) > tol) && (--i > 0)) {
			con = eccent * Math.sin(phi);
			dphi = (Math.PI / 2) - 2 * Math.atan(ts *
			            Math.pow((1.0 - con) / (1.0 + con), 0.5 * eccent)) - phi;
			phi += dphi;
		}

		return new L.LatLng(phi * d, lng);
	}
};
