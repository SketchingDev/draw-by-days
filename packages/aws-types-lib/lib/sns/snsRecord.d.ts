export interface ISnsRecord {
  EventSource: string;
  Sns: ISnsEvent;
}

interface ISnsEvent {
  Message: string;
}
