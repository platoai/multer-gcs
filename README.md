# multer-gcs

> [Multer](https://github.com/expressjs/multer) [storage engine](https://github.com/expressjs/multer/blob/master/StorageEngine.md) for [Google Cloud Storage](https://cloud.google.com/storage/).

Please read the official `@google-cloud/storage` [documentation](https://googlecloudplatform.github.io/google-cloud-node/#/docs/storage/) for additional options.

## Installation

```
npm install @voxjar/multer-gcs
```

## Usage

```javascript
const multer = require('multer');
const gcs = require('@voxjar/multer-gcs');

const storage = gcs({
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  },
  bucket: 'bucket-name',
  credentials: require('/path/to/keyfile.json'),
  // optional metadata to add to the file
  metadata: {
    contentType: 'audio/wav'
  },
  // optional, passed to the @google-cloudg/storage `getSignedUrl` method
  // defaults to:
  urlConfig: {
    action: 'read',
    expires: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
  },
  // optional, see: https://cloud.google.com/storage/docs/access-control/lists
  // defaults to:
  acl: 'publicRead',
});

const gcsUpload = multer({storage: storage});

app.post('/upload', gcsUpload.single('file'), function(req, res, next) {
  res.send('File was uploaded successfully!');
});
```

#### configuration

You can also use environment variables for `@voxjar/multer-gcs` parameters.

```bash
GCS_BUCKET='bucket-name'
GCLOUD_PROJECT='dummy-project'
GOOGLE_APPLICATION_CREDENTIALS='/path/to/keyfile.json'
```

All the official `@google-cloud/storage` authentication options should be
supported by the `gcs` method. For more information, read their
[documentation](https://googlecloudplatform.github.io/google-cloud-node/#/docs/storage/guides/authentication).

#### transformers

You can also pass an array of functions that return anything that implements the
[streaming interface](https://nodejs.org/api/stream.html) and they will be
applied before uploading the file to Google Cloud Storage.

```javascript
const gcs = require('@voxjar/multer-gcs');
const sox = require('sox-stream');

const storage = gcs({
  bucket: 'bucket-name',
  transformers: [
    () => sox({output: {type: 'wav'}})
  ],
});
```

## License

[MIT](LICENSE)
