# Surface water mapping using Sentinel-1 and Google Earth Engine

## Workflow using the Google Earth Engine Code Editor

1. Check data availability for date range and region of interest using `check_data_availability.js`
2. Get water classification threshold (Otsu's method) using `get_water_classification_threshold.js` 
3. Map surface water (using previously found threshold) using `map_surface_water.js`

## Workflow using the Google Earth Engine Python API

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/alexvmt/surface_water_mapping/blob/main/surface_water_mapping.ipynb)

1. Open `surface_water_mapping.ipynb` in Google Colab
2. Define date range and region of interest (set other parameters, too)
3. Use water classification threshold from above
4. Explore water classification
5. Export polygons in shapefile format to Google Drive
6. Once export is finished, combine shapefiles into one final shapefile (also repair invalid geometries)

## Notes

- Sentinel-1A was launched in April 2014 but Sentinel-1B only in April 2016.
- In general, each satellite has a 12-day revisit orbit, which makes a 6-day revisit orbit when they're combined.
- Sentinel-1B has been broken since December 2021 - as a consequence, there's not only less coverage since then but the observation plan has also been changed.
- [This](https://developers.google.com/earth-engine/tutorials/community/sar-basics) tutorial includes a very useful script to be used in the Google Earth Engine Code Editor
to check the availability of data for specific countries and regions according to the actual and planned operations in the observation scenario plan.

## Example (Moremi Game Reserve, Botswana, 2016-04-22)

![moremi game reserve 2016-04-22](moremi_game_reserve_2016_04_22.gif 'moremi game reserve 2016-04-22')

## Backlog

- improve speckle noise filtering
- improve water classification method
- validate water classification
- explore artifacts

## Inspiration and references

- https://omcs.atlassian.net/wiki/spaces/CSWK/pages/408616961/Sentinel-1
- https://sentinel.esa.int/web/sentinel/user-guides/sentinel-1-sar
- https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S1_GRD
- https://developers.google.com/earth-engine/guides/sentinel1
- https://developers.google.com/earth-engine/tutorials/community/sar-basics
- https://developers.google.com/earth-engine/tutorials/community/detecting-changes-in-sentinel-1-imagery-pt-1
- https://mbonnema.github.io/GoogleEarthEngine/07-SAR-Water-Classification/
- https://krstn.eu/analyze-Sentinel-1-time-series-in-Google-Earth-Engine/
- https://forum.step.esa.int/t/how-to-determine-appropriate-threshold-for-flood-detection-sentinel-1/6936
- https://gis.stackexchange.com/questions/348217/calculating-water-occurrence-of-sentinel-1-images-in-google-earth-engine
- https://www.nature.com/articles/nature20584.epdf?author_access_token=C5JSvooRop4jWxy[…]cbm_xTiPLlZMl7XrUhadm6EiT9cGdDNgn1s6EWrPWH3IeadLUjApplBoaS6xH
- https://www.sciencedirect.com/science/article/pii/S1569843222001911
- https://www.mdpi.com/2073-4441/12/3/872
- https://www.mdpi.com/2073-4441/14/24/4030
- https://ntrs.nasa.gov/api/citations/20200002548/downloads/20200002548.pdf
