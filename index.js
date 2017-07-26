const storage = require('@google-cloud/storage');
const BufferStream = require('bufferstream');
const crypto = require('crypto');
const fs = require('fs');
const mime = require('mime-types');
const path = require('path');

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

	this.transformers = opts.transformers || [];
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
			const newOptions = {
				// set mime-type
				metadata: {contentType: mime.contentType(path.basename(filename))},
				// add predefined ACL
				predefinedAcl: self.options.acl || 'projectPrivate',
			};

			const gcFile = self.gcsBucket.file(filename);
			const fileStream = new BufferStream({size: 'flexible'});

			file.stream.pipe(fileStream);

      for (const transformer of self.transformers) {
				file.stream = file.stream.pipe(transformer);
			}
      
			file.stream
				.pipe(gcFile.createWriteStream(newOptions))
				.on('error', (err) => {
					return cb(err);
				})
				.on('finish', (file) => {
					return cb(null, {
						path: `https://storage.googleapis.com/${self.options
							.bucket}${filename}`,
						filename: filename,
						buffer: fileStream.buffer,
					});
				});
		});
	});
};

GCStorage.prototype._removeFile = function _removeFile(req, file, cb) {
	const gcFile = self.gcsBucket.file(file.filename);
	gcFile.delete(cb);
};

module.exports = function(opts) {
	return new GCStorage(opts);
};
