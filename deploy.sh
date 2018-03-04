#!/bin/bash
bx wsk action update upload upload.js --web true --param access_key "$access_key" --param secret_key "$secret_key" --param bucket "$bucket" --param endpoint "$endpoint"
url=`bx wsk action get upload --url`
echo "$url.json"
