export const extractS3Key = (url: string): string => {
  const parts = url.split('cloudfront.net/');
  return parts[1] ?? '';
};
