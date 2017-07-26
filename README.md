# Multer-Storage-GCS

Google Cloud Storage Multer Storage Engine

Multer Storage Engine that uses Google Cloud Storage as a storage system.

Please read the official `@google-cloud/storage` [documentation](https://googlecloudplatform.github.io/google-cloud-node/#/docs/storage/) for additional options.

## Installation

	npm install multer-gcs

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
	acl: 'publicRead', // Optional : Defaults to projectPrivate. See: https://cloud.google.com/storage/docs/access-control/lists
});

const gcsUpload = multer({storage: storage});

app.post('/upload', gcsUpload.single('file'), function(req, res, next) {
	res.send('File was uploaded successfully!');
});
```

You can also use environment variables for multer-gcs parameters.
```
GCS_BUCKET='bucket-name'
GCLOUD_PROJECT='dummy-project'
GCS_KEYFILE='/path/to/keyfile.json'
```

All the official `@google-cloud/storage` authentication options should be supported by the `gcs` method. For more information, read the [documentation](https://googlecloudplatform.github.io/google-cloud-node/#/docs/storage/guides/authentication).

## License

[MIT](LICENSE)
