// check for which dates images are available for region of interest

// define date range of interest
var start_date = '2016-11-01';
var end_date = '2017-04-30';

// define region of interst (Makgadikgadi Pan)
var long_min = 24.51122;
var long_max = 25.41764;
var lat_min = -20.7972;
var lat_max = -20.29362;
var roi = ee.Geometry.Polygon(
        [[[long_min, lat_max],
          [long_min, lat_min],
          [long_max, lat_min],
          [long_max, lat_max]]], null, false);

// load Sentinel-1 SAR collection
var S1 = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterBounds(roi)
  .filterDate(ee.Date(start_date), ee.Date(end_date))
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.eq('orbitProperties_pass', 'ASCENDING'))
  .filter(ee.Filter.eq('resolution_meters', 10))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'));

// create list of images to check out available dates
var list_of_images = S1.toList(S1.size());
print('Images:', list_of_images);
var image_index = 0;

// add layers to map
Map.addLayer(ee.Image(list_of_images.get(image_index)).clip(roi), {bands: 'VV', min: -18, max: 0}, 'SAR image');
Map.addLayer(roi, {}, 'ROI');
Map.centerObject(roi, 10);