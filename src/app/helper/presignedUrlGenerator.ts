// import AWS from 'aws-sdk';
// import dotenv from 'dotenv';
// import AppError from '../error/appError';
// import httpStatus from 'http-status';

// dotenv.config();

// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   region: process.env.AWS_REGION!,
// });

// const s3 = new AWS.S3();

// interface GeneratePresignedUrlRequest {
//   fileType: string;
//   fileCategory: string;
// }

// export const generatePresignedUrl = async ({
//   fileType,
//   fileCategory,
// }: GeneratePresignedUrlRequest) => {
//   const timestamp = Date.now();

//   let folder = '';
//   if (fileCategory === 'profile_image') {
//     folder = 'profile_images/';
//   } else if (fileCategory === 'product_image') {
//     folder = 'product_images/';
//   } else if (fileCategory === 'video') {
//     folder = 'videos/';
//   } else if (fileCategory === 'pdf') {
//     folder = 'documents/';
//   }

//   const fileName = `${folder}${timestamp}-${Math.random()
//     .toString(36)
//     .substring(2, 15)}.${fileType.split('/')[1]}`;

//   const s3Params = {
//     Bucket: process.env.AWS_BUCKET_NAME!,
//     Key: fileName,
//     Expires: 60, // URL expiration time in seconds
//     ContentType: fileType,
//     // ACL: 'public-read', // Make it publicly accessible
//   };

//   try {
//     const url = await s3.getSignedUrlPromise('putObject', s3Params);
//     return { uploadURL: url, fileName };
//   } catch (err) {
//     console.error('Error generating presigned URL:', err);
//     throw new AppError(
//       httpStatus.SERVICE_UNAVAILABLE,
//       'Error generating multiple presigned URLs',
//     );
//   }
// };

// with verser 3
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import AppError from '../error/appError';
import httpStatus from 'http-status';

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

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
    folder = 'uploads/profile_images/';
  } else if (fileCategory === 'project_image') {
    folder = 'uploads/project_image/';
  } else if (fileCategory === 'video') {
    folder = 'uploads/videos/';
  } else if (fileCategory === 'audio') {
    folder = 'uploads/audios/';
  } else if (fileCategory === 'material_image') {
    folder = 'uploads/project_material_image/';
  }

  const fileName = `${folder}${timestamp}-${Math.random()
    .toString(36)
    .substring(2, 15)}.${fileType.split('/')[1]}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileName,
    ContentType: fileType,
    // ACL: 'public-read', // You can add this if needed and your bucket allows it
  });

  try {
    const uploadURL = await getSignedUrl(s3, command, { expiresIn: 60 }); // URL valid for 60 seconds
    return { uploadURL, fileName };
  } catch (err) {
    console.error('Error generating presigned URL:', err);
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'Error generating presigned URL',
    );
  }
};

export const generateMultiplePresignedUrls = async (
  files: Array<{ fileType: string; fileCategory: string }>,
) => {
  try {
    const presignedUrls = await Promise.all(
      files.map(async (file) => {
        return await generatePresignedUrl(file);
      }),
    );
    return presignedUrls;
  } catch (err) {
    console.error('Error generating multiple presigned URLs:', err);
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'Error generating multiple presigned URLs',
    );
  }
};
