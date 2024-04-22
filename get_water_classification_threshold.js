// use Otsu's method to get water classification threshold
// following https://gis.stackexchange.com/questions/348217/calculating-water-occurrence-of-sentinel-1-images-in-google-earth-engine

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
print(s1);

// compute median image for roi
var s1_median = ee.Image(s1.median().clip(roi)); 
print(s1_median);

// select VV band
var s1_vv_band = 'VV';

// compute histogram of VV band (mean and variance are only FYI)
var histogram = s1_median.select(s1_vv_band).reduceRegion({
  reducer: ee.Reducer.histogram()
      .combine('mean', null, true)
      .combine('variance', null, true),
  geometry: roi,
  scale: 10,
  bestEffort: true
});
print(histogram);

// chart histogram
print(
  Chart.image.histogram({
    image: s1_median.select(s1_vv_band),
    region: roi,
    scale: 10,
    maxPixels: 1e13
  })
);

// return DN that maximizes interclass variance in VV band (in the region)
var otsu = function(histogram) {
  var counts = ee.Array(ee.Dictionary(histogram).get('histogram'));
  var means = ee.Array(ee.Dictionary(histogram).get('bucketMeans'));
  var size = means.length().get([0]);
  var total = counts.reduce(ee.Reducer.sum(), [0]).get([0]);
  var sum = means.multiply(counts).reduce(ee.Reducer.sum(), [0]).get([0]);
  var mean = sum.divide(total);
  
  var indices = ee.List.sequence(1, size);
  
  // compute between sum of squares where each mean partitions data
  var bss = indices.map(function(i) {
    var aCounts = counts.slice(0, 0, i);
    var aCount = aCounts.reduce(ee.Reducer.sum(), [0]).get([0]);
    var aMeans = means.slice(0, 0, i);
    var aMean = aMeans.multiply(aCounts)
        .reduce(ee.Reducer.sum(), [0]).get([0])
        .divide(aCount);
    var bCount = total.subtract(aCount);
    var bMean = sum.subtract(aCount.multiply(aMean)).divide(bCount);
    return aCount.multiply(aMean.subtract(mean).pow(2)).add(
           bCount.multiply(bMean.subtract(mean).pow(2)));
  });
  
  print(ui.Chart.array.values(ee.Array(bss), 0, means));
  
  // return mean value corresponding to maximum BSS
  return means.sort(bss).get([-1]);
};

// get threshold
var threshold = otsu(histogram.get(s1_vv_band+'_histogram'));
print('Water classification threshold:', threshold);

// get water mask
var water_mask = s1_median.select(s1_vv_band).lt(threshold);

// define visualization parameters for median image
var vizParams = {
  bands: [s1_vv_band, s1_vv_band, s1_vv_band],
  min: -20,
  max: 0,
};

// add layers to map
Map.addLayer(s1_median, vizParams, 'S1 median image');
Map.addLayer(water_mask.mask(water_mask), {palette: 'blue'}, 'Water');
Map.addLayer(roi, {}, 'ROI');
Map.centerObject(roi);