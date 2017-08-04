const storage = require('@google-cloud/storage');
const crypto = require('crypto');

function getFilename(req, file, cb) {
	crypto.pseudoRandomBytes(16, (err, raw) => {
		cb(err, err ? undefined : raw.toString('hex'));
	});
}

function getDestination(req, file, cb) {
	cb(null, '');
}

function GCStorage(opts) {
	this.getFilename = opts.filename || getFilename;

	if ('string' === typeof opts.destination) {
		this.getDestination = function($0, $1, cb) {
			cb(null, opts.destination);
		};
	} else {
		this.getDestination = opts.destination || getDestination;
	}

	opts.bucket = opts.bucket || process.env.GCS_BUCKET;
	opts.projectId = opts.projectId || process.env.GCLOUD_PROJECT;
	opts.keyFilename =
		opts.keyFilename || process.env.GOOGLE_APPLICATION_CREDENTIALS;

	if (!opts.bucket) {
		throw new Error(
			'You have to specify bucket for Google Cloud Storage to work.'
		);
	}

	this.gcobj = storage(opts);
	this.gcsBucket = this.gcobj.bucket(opts.bucket);

	opts.transformers = opts.transformers || [];
	this.options = opts;
}

GCStorage.prototype._handleFile = function(req, file, cb) {
	const self = this;
	self.getDestination(req, file, (err, destination) => {
		if (err) {
			return cb(err);
		}

		self.getFilename(req, file, (err, filename) => {
			if (err) {
				return cb(err);
			}

			// set options for upload
			const uploadOptions = {
				metadata: self.options.metadata || {contentType: file.mimetype},
				predefinedAcl: self.options.acl || 'projectPrivate',
			};

			const uploadPath = destination ? `${destination}/${filename}` : filename;
			const gcFile = self.gcsBucket.file(uploadPath);

			let stream = file.stream;

			for (const transformer of self.options.transformers) {
				stream = stream.pipe(transformer()).on('error', (err) => {
					return cb(err);
				});
			}

			stream
				.pipe(gcFile.createWriteStream(uploadOptions))
				.on('error', (err) => {
					return cb(err);
				})
				.on('finish', () => {
					const urlConfig = self.options.urlConfig || {
						actions: 'read',
						expires: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
					};

					gcFile.getSignedUrl(urlConfig, (err, url) => {
						if (err) {
							return cb(err);
						}

						return cb(null, {
							destination: destination,
							path: uploadPath,
							url: url,
							filename: filename,
							mimetype: uploadOptions.metadata.contentType || file.mimetype,
						});
					});
				});
		});
	});
};

GCStorage.prototype._removeFile = function _removeFile(req, file, cb) {
	const gcFile = this.gcsBucket.file(file.path);
	gcFile.delete(cb);
};

module.exports = function(opts) {
	return new GCStorage(opts);
};
