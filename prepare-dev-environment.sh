#!/bin/sh

# Before running this script, Verify backend/services/migrations/config.json
# It should have proper db credentials

# Run this script by typing the following in terminal : sh prepare-dev-environment.sh 

REPO_DIR_LOCATION=$(pwd);
LAYERS_DIR_LOCATION=$REPO_DIR_LOCATION/backend/layers
SERVICES_DIR_LOCATION=$REPO_DIR_LOCATION/backend/services

echo "\n You have provided the dir location : $REPO_DIR_LOCATION"

echo "\n ROOT : Installing npm packages \n"
(cd $REPO_DIR_LOCATION && npm install)


echo "\n Backend : Installing npm packages \n"
(cd $REPO_DIR_LOCATION/backend && npm install)


echo "\n Helper lib : Installing npm packages \n"
(cd $LAYERS_DIR_LOCATION/helper_lib && npm install)


echo "\n Helper lib : Compiling npm packages \n"
(cd $LAYERS_DIR_LOCATION/helper_lib && npm run compile)


echo "\n Models lib : Installing npm packages \n"
(cd $LAYERS_DIR_LOCATION/models_lib && npm install)


echo "\n Models lib : Compiling npm packages \n"
(cd $LAYERS_DIR_LOCATION/models_lib && npm run compile)


echo "\n libs : Installing npm packages \n"
(cd $REPO_DIR_LOCATION/backend/libs && npm install)



echo "\n Service :: Admin Merchants : Installing npm packages \n"
(cd $SERVICES_DIR_LOCATION/admin-merchants && npm install)


echo "\n Service :: Auth : Installing npm packages \n"
(cd $SERVICES_DIR_LOCATION/auth && npm install)


echo "\n Service :: Auth Cognito : Installing npm packages \n"
(cd $SERVICES_DIR_LOCATION/auth-cognito && npm install)


echo "\n Service :: Customers : Installing npm packages \n"
(cd $SERVICES_DIR_LOCATION/customers && npm install)


echo "\n Service :: Documents : Installing npm packages \n"
(cd $SERVICES_DIR_LOCATION/documents && npm install)


echo "\n Service :: Merchants: Installing npm packages \n"
(cd $SERVICES_DIR_LOCATION/merchants && npm install)


echo "\n Service :: Migrations : Installing npm packages \n"
(cd $SERVICES_DIR_LOCATION/migrations && npm install)


echo "\n Service :: Notifications : Installing npm packages \n"
(cd $SERVICES_DIR_LOCATION/notifications && npm install)


echo "\n Service :: Payments : Installing npm packages \n"
(cd $SERVICES_DIR_LOCATION/payments && npm install)


echo "\n Service :: Settings : Installing npm packages \n"
(cd $SERVICES_DIR_LOCATION/settings && npm install)


echo "\n Service :: Taxonomies : Installing npm packages \n"
(cd $SERVICES_DIR_LOCATION/taxonomies && npm install)


echo "\n Service :: Users : Installing npm packages \n"
(cd $SERVICES_DIR_LOCATION/users && npm install)


echo "\n Service :: Vitual Terminal : Installing npm packages \n"
(cd $SERVICES_DIR_LOCATION/virtual_terminal && npm install)

echo "\n Service :: Reseller : Installing npm packages \n"
(cd $SERVICES_DIR_LOCATION/reseller && npm install)

echo "\n Service :: Bifrost : Installing npm packages \n"
(cd $SERVICES_DIR_LOCATION/bifrost && npm install)

echo "\n NPM installations and compilations are over. \n"

echo "\n Running migrations..... \n"
(cd $SERVICES_DIR_LOCATION/migrations && sequelize db:migrate)

echo "\n Done. Have a great day. \n"