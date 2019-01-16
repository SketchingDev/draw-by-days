import { IS3Record } from "./s3/s3Record";
import { ISnsRecord } from "./sns/snsRecord";

export interface IRecords {
  Records: Array<ISnsRecord | IS3Record>;
}
