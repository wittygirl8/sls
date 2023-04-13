#!/bin/bash
# use: sh script_services.sh

servicePath="$1"
S3_BUCKET="$2"

### Create package
cd $servicePath

### Extract service name from path
#serviceName=${servicePath:17}
serviceName=$(echo $servicePath | sed 's/^.\{17\}//')
echo The service name is: $serviceName

ls -la
### create archive
zip -r -qq -Z store $serviceName.zip .
ls -la
find ./* ! -name $serviceName.zip -delete
ls -la 

### Sync with AWS s3
echo Running S3 sync command
# echo =============================================>
aws s3 sync . $S3_BUCKET/$serviceName --delete --size-only --no-progress
echo Finnished S3 sync