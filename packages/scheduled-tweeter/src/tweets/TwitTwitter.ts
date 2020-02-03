import Twit from "twit";

export interface Tweet {
  id: string;
}

export interface ImageTweeter {
  tweetImage(text:string, imagePath: string) : Promise<Tweet>;
}

interface PostMediaChunkedResponse {
  media_id: number;
  media_id_string: string;
  media_key: string;
  size: number;
  expires_after_secs: number;
  image: { image_type: string, w: number; h: number; }
}

interface PostResponse {
  data: {
    id_str: string;
    entities: {
      media: {id_str: string}[]
    }
  }
}

export class TwitTwitter implements ImageTweeter {

  constructor(private readonly twit: Twit){}

  public async tweetImage(text:string, imagePath: string) : Promise<Tweet> {
    const response = await new Promise<PostMediaChunkedResponse>(
      (resolve, reject) => this.twit.postMediaChunked({ file_path:imagePath },
        (err: Error, r: {}) => {
          if (err) {
            return reject(err);
          }

          resolve(r as PostMediaChunkedResponse);
        }
    ));

    const postResponse = await this.twit.post(
      "statuses/update",
      { status: text, media_ids:[response.media_id_string] }
      ) as PostResponse;

    return {id: postResponse.data.id_str};
  }
}
