// check for which dates images are available for region of interest

// define date range of interest
var start_date = '2015-11-01';
var end_date = '2016-04-30';

// define region of interst (Moremi Game Reserve)
var roi = ee.Geometry.Point(23.201, -19.272).buffer(30000);

Map.addLayer(roi, {}, 'ROI');
Map.centerObject(roi, 10);

// load Sentinel-1 SAR collection
var S1 = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterBounds(roi)
  .filterDate(ee.Date(start_date), ee.Date(end_date))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'));

// print list of images to check out available dates
var list_of_images = S1.toList(S1.size());
print('Images:', list_of_images);

// add selected image from list to map
var image_index = 0;
Map.addLayer(ee.Image(list_of_images.get(image_index)).clip(roi), {bands: 'VV', min: -18, max: 0}, 'SAR image');
