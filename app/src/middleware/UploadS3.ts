import * as AWS from 'aws-sdk';
import { S3 } from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import env from '../configs/index';

const s3: S3 = new AWS.S3(env.AWS);
const storage: multer.StorageEngine = multerS3({
  s3: s3,
  bucket: 'habitbread',
  acl: 'public-read',
  key: function (req, file, cb) {
    cb(null, `user/${Date.now()}_${file.originalname}`);
  },
});

export const upload = multer({ storage });

console.log(env.AWS);
