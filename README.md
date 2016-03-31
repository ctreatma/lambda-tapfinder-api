lambda-tapfinder-api
====================

An API that searches [PhillyTapFinder](http://phillytapfinder.com) and returns results as JSON.

This API is implemented as an [AWS Lambda](https://aws.amazon.com/lambda) function.  It was
initially based heavily on the [Express implementation](https://github.com/ctreatma/express-tapfinder-api).

Installing dependencies:

    npm install

Packaging for deploy:

    zip -r lambda-tapfinder-api . -i index.js "lib/*" "node_modules/*"

Configure AWS for API creation & deployment:

    aws configure # Specify access key ID, access key secret, AWS region

Deploying:

    aws lambda update-function-code --function-name lambda-tapfinder-api --zip-file fileb://lambda-tapfinder-api.zip