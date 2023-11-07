// map surface water at date of interest for region of interest

// define date of interest
var doi = '2016-04-22';

// define region of interst (Moremi Game Reserve)
var roi = ee.Geometry.Point(23.201, -19.272).buffer(30000);

Map.addLayer(roi, {}, 'ROI');
Map.centerObject(roi, 10);

// load Sentinel-1 SAR collection
var S1 = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterBounds(roi)
  .filterDate(ee.Date(doi), ee.Date(doi).advance(1, 'day'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'));

print(S1);

Map.addLayer(S1.first().clip(roi), {bands: 'VV', min: -18, max: 0}, 'SAR image');

// filter speckle noise and map it across collection
var filterSpeckles = function(img) {
  var vv = img.select('VV') // select the VV polarization band
  var vv_smoothed = vv.focal_median(100, 'circle', 'meters').rename('VV_filtered') // apply a focal median filter
  return img.addBands(vv_smoothed) // add filtered VV band to original image
};

var S1_filtered = S1.map(filterSpeckles);

Map.addLayer(S1_filtered.first().clip(roi), {bands: 'VV_filtered', min: -18, max: 0}, 'Filtered SAR image');

// classify water pixels using a set threshhold 
var classifyWater = function(image) {
  var vv_filtered = image.select('VV_filtered')
  var water = vv_filtered.lt(-16).rename('water') // identify all pixels below threshold and set them equal to 1
  water = water.updateMask(water) // remove all pixels equal to 0
  return image.addBands(water)  // return image with added classified water band
};

// apply classification
var S1_classified = S1_filtered
  .map(classifyWater)
  .select('water')
  .first()
  .clip(roi);
    
Map.addLayer(S1_classified, {min: 0, max: 1, palette: ['#FFFFFF','#0000FF']}, 'Water');

// create date label on map
var date_label = ui.Label(doi);
Map.add(date_label);

// export classification
var file_name = 'surface_water_mapping_' + doi.replace('-', '_').replace('-', '_');

Export.image.toDrive({
	image: S1_classified,
	description: file_name,
	folder: 'surface_water_mapping',
	region: roi,
	scale: 10,
	maxPixels: 1e13,
	fileFormat: 'GeoTIFF',
	crs: 'EPSG:4326'
});
