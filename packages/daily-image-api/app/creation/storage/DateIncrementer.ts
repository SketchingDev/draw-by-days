export interface DateIncrementer {
  getDate(defaultDate?: Date): Promise<Date>;
  increaseDate(date: Date): Promise<void>;
}
