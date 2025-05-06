/* eslint-disable @typescript-eslint/no-explicit-any */
// import AWS from 'aws-sdk';

// import AWS from 'aws-sdk';

// const s3 = new AWS.S3();

// export const deleteFileFromS3 = async (fileName: string) => {
//   // Decode the file name (URL-decoding any encoded characters like %20, %2F, etc.)
//   const decodedFileName = decodeURIComponent(fileName);

//   const params = {
//     Bucket: process.env.AWS_BUCKET_NAME!, // Bucket name from environment
//     Key: decodedFileName, // S3 key (file name with path)
//   };

//   try {
//     // Check if the file exists before attempting to delete
//     const headParams = {
//       Bucket: process.env.AWS_BUCKET_NAME!,
//       Key: decodedFileName,
//     };

//     // Check if the file exists in S3 (headObject doesn't download the file, it only checks existence)
//     try {
//       await s3.headObject(headParams).promise(); // This will throw an error if the file doesn't exist
//     } catch (err: any) {
//       if (err.code === 'NotFound') {
//         console.log(`File ${decodedFileName} does not exist in S3.`);
//         return;
//       }
//       throw err; // Re-throw if it's another error (e.g., permissions, connection)
//     }

//     // If file exists, delete it
//     await s3.deleteObject(params).promise();
//     console.log(`Successfully deleted ${decodedFileName} from S3`);
//   } catch (err: any) {
//     if (err.code === 'NotFound') {
//       console.error(`File ${decodedFileName} was not found in S3.`);
//     } else {
//       console.error('Error deleting file from S3:', err);
//     }
//   }
// };

// with version 3
import {
  S3Client,
  HeadObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

// Initialize the S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const deleteFileFromS3 = async (fileName: string) => {
  const decodedFileName = decodeURIComponent(fileName);

  const bucket = process.env.AWS_BUCKET_NAME!;

  try {
    // 1. Check if the file exists in S3
    const headCommand = new HeadObjectCommand({
      Bucket: bucket,
      Key: decodedFileName,
    });

    try {
      await s3.send(headCommand);
    } catch (err: any) {
      if (err.name === 'NotFound') {
        console.log(`File ${decodedFileName} does not exist in S3.`);
        return;
      }
      throw err;
    }

    // 2. Delete the file
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucket,
      Key: decodedFileName,
    });

    await s3.send(deleteCommand);
    console.log(`Successfully deleted ${decodedFileName} from S3`);
  } catch (err: any) {
    if (err.name === 'NotFound') {
      console.error(`File ${decodedFileName} was not found in S3.`);
    } else {
      console.error('Error deleting file from S3:', err);
    }
  }
};
