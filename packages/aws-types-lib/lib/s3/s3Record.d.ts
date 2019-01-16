export interface IS3Record {
  eventSource: string;
  s3: IS3Event;
}

interface IS3Event {
  bucket: {
    name: string;
    arn: string;
  };
  object: {
    key: string;
    size: number;
    eTag: string;
  };
}
