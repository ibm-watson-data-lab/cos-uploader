# cos-uploader

If you want to upload files to IBM's Cloud Object Storage from a web browser, but you don't want to hard code your service credentials in a client side app (for good reason) then this is one solution:

![schematic](img/cosupload.png)

1. The web app makes an API call to an IBM Cloud Functions action to indicate that it wishes to upload an image
2. The serverless action calculates a time-limited URL that allows the upload of a single object
3. The website makes a second API call to write the image directly to the Object Storage service itself, using the URL it got from the Cloud Functions action.

## Sign up for IBM Cloud Object Storage

We're going to need an IBM Cloud Object storage service or an Amazon S3 account. IBM’s service supports a subset of the S3 API for easy migration. With a couple simple steps, we can use the same code on IBM Cloud Object Storage or Amazon S3.

Sign up for an IBM Cloud account. Once registered, you can add an [IBM Cloud Object Storage service](https://console.bluemix.net/catalog/services/cloud-object-storage) - the Lite plan gives you a generous free allocation to play with. 

In the IBM Cloud Object Storage UI, you can

- create a bucket - this is the "folder" where your uploaded files will be kept
- create a set of credentials that we are going to use in our serverless script. When creating these credentials, you’ll need to pass in a flag to enable S3-style authentication: `{"HMAC":true}` to enable Amazon compatibility. 

Make a note of the bucket name, the API endpoint and your keys for the next step.

## Enable CORS

Enabling CORS on an object storage bucket enables it to be accessed directly from a web page without hitting any security restrictions.

Install the [aws](https://aws.amazon.com/cli/) command-line tool and create a `~/.aws/credentials` file containing your object storage service's key and secret:

```
[default]
aws_access_key_id=MY_PUBLIC_KEY
aws_secret_access_key=MY_PRIVATE_KEY
```

You should then be able to see the contents of your bucket:

```sh
aws --endpoint-url=https://s3-api.us-geo.objectstorage.softlayer.net/ s3 ls s3://mybucket
```

Create a file called `cors.json` that contains the same data as contained in the cors.json in this repository.

Then we can enable CORS with:

```sh
aws --endpoint-url=https://s3-api.us-geo.objectstorage.softlayer.net/ \
  s3api \
  put-bucket-cors \
  --bucket mybucket \
  --cors-configuration file://cors.json
```

## Install the bx wsk tool

To deploy code to IBM Cloud Functions we need the `bx wsk` tool installed and configured on your machine. Follow the [instuctions here](https://console.bluemix.net/openwhisk/learn/cli)

## Deploy to Cloud Functions

Set some environment variables with your object storage credentials and endpoint:

```sh
export access_key='xxx'
export secret_key='yyy'
export bucket='mybucket'
export endpoint='https://s3-api.us-geo.objectstorage.softlayer.net'
```

and run the deployment script:

```sh
./deploy.sh
```

The `deploy.sh` script should output the URL of your serverless action. It will be something like:

    https://openwhisk.ng.bluemix.net/api/v1/web/ORG_SPACE/default/upload.json

You can call the API from curl to test it:

```sh
curl 'https://openwhisk.ng.bluemix.net/api/v1/web/ORG_SPACE/default/upload.json?content_type=image/jpg'
{
  "url": "https://s3-api.us-geo.objectstorage.softlayer.net/mybucket/N9n4YnJcyGlbEnwIXD49.jpg?AWSAccessKeyId=xxx&Signature=yyy&Expires=1519910332"
}
```

and upload a file to the URL *it* returns:

```sh
curl -T ./trump.jpg -H 'Content-type: image/jpg' 'https://s3-api.us-geo.objectstorage.softlayer.net/mybucket/N9n4YnJcyGlbEnwIXD49.jpg?AWSAccessKeyId=xxx&Signature=yyy&Expires=1519910332'
```

## Uploading from a web page

This repo contains an `upload.html` file. Edit it to replace `YOUR_SERVERLESS_URL` with the URL of your IBM Cloud Functions API call that we created in the latest step. If you open the web page in a browser, any file you drag and drop into the drop zone will be automatically uploaded to your Object Storage bucket!

![screenshot](img/screenshot.png)

## Links

If you need to download files from Object Storage to your browser then [this repostory](https://github.com/ibm-watson-data-lab/cos-downloader) can help.