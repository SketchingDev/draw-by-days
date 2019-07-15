export interface IAddDailyImageCommand {
  id?: string;
  url?: string;
  date?: string; // TODO Remove date. This is decided on by the Daily Image API
}
