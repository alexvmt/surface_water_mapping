// map surface water for date range and region of interest

// define date range of interest
var start_date = '2016-11-01';
var end_date = '2017-04-30';

// define region of interest (Makgadikgadi Pan)
var long_min = 24.51122;
var long_max = 25.41764;
var lat_min = -20.7972;
var lat_max = -20.40985;
var roi = ee.Geometry.Polygon(
        [[[long_min, lat_max],
          [long_min, lat_min],
          [long_max, lat_min],
          [long_max, lat_max]]], null, false);

// load Sentinel-1 collection
var s1 = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterDate(ee.Date(start_date), ee.Date(end_date))
  .filterBounds(roi)
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.eq('orbitProperties_pass', 'ASCENDING'))
  .filter(ee.Filter.eq('resolution_meters', 10))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'));

// filter speckle noise and map it across collection
var filterSpeckles = function(image) {
  var vv = image.select('VV') // select the VV polarization band
  var vv_smoothed = vv.focal_median(50, 'circle', 'meters').rename('VV_smoothed') // apply a focal median filter
  return image.addBands(vv_smoothed) // add smoothed VV band to original image
};

var s1_filtered = s1.map(filterSpeckles);

// classify water pixels using a set threshhold 
var classifyWater = function(image) {
  var vv_smoothed = image.select('VV_smoothed')
  var water = vv_smoothed.lt(-16.5616).rename('water') // identify all pixels below threshold and set them equal to 1
  water = water.updateMask(water) // remove all pixels equal to 0
  return image.addBands(water) // return image with added classified water band
};

// apply classification
var s1_classified = s1_filtered.map(classifyWater);

// create list of images to check out available dates
var list_of_images = s1.toList(s1.size());
var list_of_filtered_images = s1_filtered.toList(s1_filtered.size());
var list_of_classified_images = s1_classified.toList(s1_classified.size());
print('Images:', list_of_images);
var image_index = 0;

// add layers to map
Map.addLayer(ee.Image(list_of_images.get(image_index)).clip(roi), {bands: 'VV', min: -20, max: 0}, 'S1 image');
Map.addLayer(ee.Image(list_of_filtered_images.get(image_index)).clip(roi), {bands: 'VV_smoothed', min: -20, max: 0}, 'Filtered S1 image');
Map.addLayer(ee.Image(list_of_classified_images.get(image_index)).clip(roi), {bands: 'water', min: 0, max: 1, palette: ['#FFFFFF', '#0000FF']}, 'Water');
Map.addLayer(roi, {}, 'ROI');
Map.centerObject(roi, 10);