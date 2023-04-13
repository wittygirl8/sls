#!/bin/bash
# use: sh script_services.sh

servicePath="$1"
packageName="$2"
S3_BUCKET="$3"
INFRA_STAGE="$4"

echo servicePath is: $servicePath
echo packageName is: $packageName
echo S3 BUCKET is: $S3_BUCKET
echo INFRA_STAGE: $INFRA_STAGE
### Create package
pwd
cd $servicePath
ls -la
mkdir target
serverless package --infraStage=${INFRA_STAGE} --stage=${INFRA_STAGE} --package ./target
cd ./target
ls -la
unzip -qq $packageName.zip -d tmp ##Zip sizes differ error
cd ./tmp
zip -r -qq -Z store ../handlers.zip . && cd ../.. ##Zip sizes differ error and zip again with no compression
ls -la
find ./target/* ! -name 'handlers.zip' -delete
echo target content before
ls -la ./target
cp  -r *.yml *.json ./validators ./target/
cd ./target
sed -i '/serverless-bundle/d' *.yml

### Extract service name from path
#serviceName=${servicePath:17}
serviceName=$(echo $servicePath | sed 's/^.\{17\}//')
echo The service name is: $serviceName

echo target content before with yml
ls -la
### create archive
zip -r -qq $serviceName.zip . && cd ..
echo target content after
ls -la
find ./target/* ! -name $serviceName.zip -delete
echo target content after with content
ls -la ./target

### Sync with AWS s3
echo Running S3 sync command
# echo =============================================>
aws s3 sync ./target $S3_BUCKET/$serviceName --delete --size-only --no-progress && cd -
echo Finnished S3 sync