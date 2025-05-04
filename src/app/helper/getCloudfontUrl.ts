export const getCloudFrontUrl = (s3Url: string) => {
  return s3Url.replace(
    'https://candor-app-bucket.s3.eu-north-1.amazonaws.com',
    'https://d14kop5fncmaro.cloudfront.net',
  );
};
