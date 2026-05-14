// backend/src/utils/generateLink.ts

export const generateShareableLink = (): string => {
  const prefix = 'poll';
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${randomStr}_${timestamp}`;
};

export const isValidPollLink = (link: string): boolean => {
  const pattern = /^poll_[a-z0-9]{8,}_\d+$/;
  return pattern.test(link);
};