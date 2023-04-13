#!/bin/bash
# use: sh script_layers.sh Parameter

layerPath="$1"
# layerName1=$2
# layerName2=$3

S3_BUCKET="$2"

### Create package
cd $layerPath
pwd
# mkdir target
# ls -lah
# serverless package --package ./target

# cd ./target


# mkdir tmp
# ls -la
# mv $layerName1.zip ./tmp/
# cd ./tmp
# unzip -qq $layerName1.zip -d .
# rm -rf $layerName1.zip ##Zip sizes differ error
# zip -r -0 -qq $layerName1.zip .
# ls -la
# cd .. ##Zip sizes differ error and zip again with no compression

# mkdir tmp2 
# ls -la
# mv $layerName2.zip ./tmp2/
# cd ./tmp2
# unzip -qq $layerName2.zip -d .
# pwd
# ls -la
# rm -rf $layerName2.zip ##Zip sizes differ error
# zip -r -0 -qq $layerName2.zip .
# pwd
# ls -la
# cd .. ##Zip sizes differ error and zip again with no compression

# cp ./tmp/$layerName1.zip .
# cp ./tmp2/$layerName2.zip .

# rm -rf tmp tmp2
# find . ! -name '*.zip' -delete
# cd ..

# cp  *.yml *.json ./target/ 
# cd ./target


### Extract service name from path
#layerName=${layerPath:8}
layerName=$(echo $layerPath | sed 's/^.\{8\}//')
echo The resource name is: $layerName
ls -la
### create archive
zip -r -qq -Z store $layerName.zip .
#find ./target/* ! -name '*.zip' -delete
find ./* ! -name '*.zip' -delete
ls -la
### Sync with AWS s3
echo Running S3 sync command
# echo =============================================>
aws s3 sync . $S3_BUCKET/$layerName --delete --size-only --no-progress && cd -
echo Finnished S3 sync