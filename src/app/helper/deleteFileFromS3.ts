/* eslint-disable @typescript-eslint/no-explicit-any */
// import AWS from 'aws-sdk';

// const s3 = new AWS.S3();

// export const deleteFileFromS3 = async (fileName: string) => {
//   const params = {
//     Bucket: process.env.AWS_BUCKET_NAME!,
//     Key: fileName,
//   };

//   try {
//     await s3.deleteObject(params).promise();
//     console.log(`Successfully deleted ${fileName} from S3`);
//   } catch (err) {
//     console.error('Error deleting file from S3:', err);
//   }
// };

import AWS from 'aws-sdk';

const s3 = new AWS.S3();

export const deleteFileFromS3 = async (fileName: string) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!, // Bucket name from environment
    Key: fileName, // S3 key (file name with path)
  };

  try {
    // Check if the file exists before attempting to delete
    const headParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileName,
    };

    // Check if the file exists in S3 (headObject doesn't download the file, it only checks existence)
    try {
      await s3.headObject(headParams).promise(); // This will throw an error if the file doesn't exist
    } catch (err: any) {
      if (err.code === 'NotFound') {
        console.log(`File ${fileName} does not exist in S3.`);
        return;
      }
      throw err; // Re-throw if it's another error (e.g., permissions, connection)
    }

    // If file exists, delete it
    await s3.deleteObject(params).promise();
    console.log(`Successfully deleted ${fileName} from S3`);
  } catch (err: any) {
    if (err.code === 'NotFound') {
      console.error(`File ${fileName} was not found in S3.`);
    } else {
      console.error('Error deleting file from S3:', err);
    }
  }
};

// await deleteOldImageFromS3(oldImageUrl.split('amazonaws.com/')[1]);

// for deleted file found
// app.post('/update-file', verifyToken, async (req, res) => {
//     const { userId, fileType, fileCategory } = req.body;  // fileCategory can be 'image', 'document', 'video', etc.

//     // Step 1: Get the current user's file URL from the database
//     const user = await User.findById(userId);
//     const oldFileUrl = user.profileFile;

//     // Step 2: Delete the old file from S3
//     const oldFileName = oldFileUrl.split('amazonaws.com/')[1];  // Extract the file path
//     try {
//       await deleteOldFileFromS3(oldFileName);  // Delete the old file
//     } catch (err) {
//       return res.status(500).send('Error deleting old file');
//     }

//     // Step 3: Generate presigned URL for the new file
//     const { uploadURL, fileName } = await generatePresignedUrl(fileType, fileCategory);

//     // Step 4: Upload the new file (client will handle the file upload using the presigned URL)

//     // After uploading the file, update the database with the new URL
//     const updatedUser = await User.findByIdAndUpdate(userId, {
//       profileFile: `https://candor-app-bucket.s3.eu-north-1.amazonaws.com/${fileName}`,  // Save the new S3 URL
//     }, { new: true });

//     res.status(200).json({ message: 'File updated successfully', updatedUser });
//   });
