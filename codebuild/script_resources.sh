#!/bin/bash
# use: sh script_resources.sh Parameter

resourcePath="$1"
S3_BUCKET="$2"
INFRA_STAGE="$3"

echo Resource path is: $resourcePath
echo S3 BUCKET is: $S3_BUCKET
echo INFRA STAGE is: $INFRA_STAGE


### Create package
pwd
echo $resourcePath
cd $resourcePath
pwd
mkdir target
ls -lah
serverless package --infraStage=${INFRA_STAGE} --stage=${INFRA_STAGE} --package ./target
cd ./target && rm -rf * && cd -
ls -lah ./target
cp  *.yml *.json ./target/ 
cd ./target

### Extract service name from path
#resourceName=${resourcePath:18}
#resourceName=$(echo -n $resourcePath | tail -c 4)
resourceName=$(echo $resourcePath | sed 's/^.\{18\}//')
echo The resource name is: $resourceName

### create archive
zip -r -qq $resourceName.zip . && cd ..
ls -lah
find ./target/* ! -name '*.zip' -delete
ls -lah

### Sync with AWS s3
echo Running S3 sync command
# echo =============================================>
aws s3 sync ./target $S3_BUCKET/$resourceName --delete --size-only --no-progress && cd -
echo Finnished S3 sync