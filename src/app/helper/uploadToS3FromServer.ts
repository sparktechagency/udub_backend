/* eslint-disable @typescript-eslint/no-explicit-any */
import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import fs from 'fs';
import mime from 'mime-types';
dotenv.config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  region: process.env.AWS_REGION!,
});

const s3 = new AWS.S3();

export const uploadToS3FromServer = async (
  filePath: string,
  //   fileName: string,
): Promise<string> => {
  const fileContent = fs.readFileSync(filePath);
  const mimeType = mime.lookup(filePath);

  if (!mimeType) {
    throw new Error('Unable to determine MIME type for file');
  }
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filePath,
    Body: fileContent,
    ContentType: 'image/jpeg',
  };

  try {
    // Upload the file to S3
    const uploadResult = await s3.upload(params as any).promise();

    // Return the file URL from the S3 response
    return uploadResult.Location;
  } catch (error: any) {
    throw new Error(`Error uploading file to S3: ${error.message}`);
  }
};
