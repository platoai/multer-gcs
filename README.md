# multer-storage-gcs

> Multer Storage Engine for Google Cloud Storage.

Please read the official `@google-cloud/storage` [documentation](https://googlecloudplatform.github.io/google-cloud-node/#/docs/storage/) for additional options.

## Installation

```
npm install @platoai/multer-gcs
```

## Usage

```javascript
const multer = require('multer');
const gcs = require('multer-gcs');

const storage = gcs({
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  },
  bucket: 'bucket-name',
  credentials: require('/path/to/keyfile.json'),
  // optional: Defaults to `projectPrivate`.
  // see: https://cloud.google.com/storage/docs/access-control/lists
  acl: 'publicRead',
});

const gcsUpload = multer({storage: storage});

app.post('/upload', gcsUpload.single('file'), function(req, res, next) {
  res.send('File was uploaded successfully!');
});
```

#### configuration

You can also use environment variables for `multer-gcs` parameters.

```
GCS_BUCKET='bucket-name'
GCLOUD_PROJECT='dummy-project'
GOOGLE_APPLICATION_CREDENTIALS='/path/to/keyfile.json'
```

All the official `@google-cloud/storage` authentication options should be
supported by the `gcs` method. For more information, read their
[documentation](https://googlecloudplatform.github.io/google-cloud-node/#/docs/storage/guides/authentication).

#### transformers

You can also pass an array of anything that implements the [streaming
interface](https://nodejs.org/api/stream.html) and they will be applied before
uploading the file to Google Cloud Storage.

```javascript
const gcs = require('multer-gcs');
const sox = require('sox-stream');

const storage = gcs({
  bucket: 'bucket-name',
  transformers: [
    sox({output: {type: 'wav'}})
  ],
});
```

## License

[MIT](LICENSE)
