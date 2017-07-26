# Multer-Storage-GCS

Google Cloud Storage Multer Storage Engine

Multer Storage Engine that uses Google Cloud Storage as a storage system.

Please read the `@google-cloud/storage` [documentation](https://googlecloudplatform.github.io/google-cloud-node/#/docs/storage/) for additional options.

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
	bucket: 'bucket-name', // Required: bucket name to upload
	projectId: 'dummy-project', // Required: Google project ID
	keyFilename: '/path/to/keyfile.json', // Required: JSON credentials file for Google Cloud Storage
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

## License

[MIT](LICENSE)
