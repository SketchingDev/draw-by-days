export interface IRecords<T> {
  Records: Array<IRecord<T>>;
}

export interface IRecord<T> {
  // EventSource: string;
  // EventVersion: string;
  Sns: ISnsEvent<T>;
}

interface ISnsEvent<T> {
  // Subject: string;
  Message: T;
  // MessageAttributes: { [s: string]: ISnsMessageAttribute; };
}

// interface ISnsMessageAttribute {
//     Type: string;
//     Value: string;
// }
