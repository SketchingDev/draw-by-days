export const getDailyImage = `
  query getDailyImage($date: AWSDate!){
    getDailyImage(date: $date){
      id
      url
      date
    }
  }
`;
