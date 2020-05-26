export class GoogleParse {
  public static parseResponse = (data: any) => {
    return {
      name: data.names.length ? data.names[0].displayName : '습관이',
      email: data.emailAddresses.length ? data.emailAddresses[0].value : 'example@mail.com',
      imageUrl: data.photos.length ? data.photos[0].url : null,
    };
  };
}
