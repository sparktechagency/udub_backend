import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  region: process.env.AWS_REGION!,
});

const s3 = new AWS.S3();

interface GeneratePresignedUrlRequest {
  fileType: string;
  fileCategory: string;
}

export const generatePresignedUrl = async ({
  fileType,
  fileCategory,
}: GeneratePresignedUrlRequest) => {
  const timestamp = Date.now();

  let folder = '';
  if (fileCategory === 'profile_image') {
    folder = 'profile_images/';
  } else if (fileCategory === 'product_image') {
    folder = 'product_images/';
  } else if (fileCategory === 'video') {
    folder = 'videos/';
  } else if (fileCategory === 'pdf') {
    folder = 'documents/';
  }

  const fileName = `${folder}${timestamp}-${Math.random()
    .toString(36)
    .substring(2, 15)}.${fileType.split('/')[1]}`;

  const s3Params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileName,
    Expires: 60, // URL expiration time in seconds
    ContentType: fileType,
    // ACL: 'public-read', // Make it publicly accessible
  };

  try {
    const url = await s3.getSignedUrlPromise('putObject', s3Params);
    return { uploadURL: url, fileName };
  } catch (err) {
    console.error('Error generating presigned URL:', err);
    throw new Error('Error generating presigned URL');
  }
};
