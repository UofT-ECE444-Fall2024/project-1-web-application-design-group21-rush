#!/bin/bash

for service in authentication_service listings_service rating_service recommendations_service search_engine user_profile_service; do
  echo "Installing dependencies for $service"
  pip install -r $service/requirements.txt
done
