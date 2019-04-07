export interface IDailyImage {
  id?: string;

  /**
   * A valid URL string. The URL may use any scheme and may also be a local URL (Ex: <http://localhost/>).
   * URLs without schemes are considered invalid. URLs which contain double slashes are also considered invalid.
   */
  url: string;

  /**
   * a valid extended ISO 8601 Date string. In other words, this scalar type accepts date strings of the
   * form YYYY-MM-DD. This scalar type can also accept time zone offsets. For example, 1970-01-01Z, 1970-01-01-07:00 and
   * 1970-01-01+05:30 are all valid dates. The time zone offset must either be Z (representing the UTC time zone) or be
   * in the format ±hh:mm:ss. The seconds field in the timezone offset will be considered valid even though it is not
   * part of the ISO 8601 standard.
   */
  date: string;
}
