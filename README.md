# Draw by Days

Draw by Days provides artists (amateur or professional) with an image a day to reproduce in their particular medium. The
more days you complete the better you'll get!

You can find the image each day [@DrawByDays on Twitter](https://twitter.com/DrawByDays), where you can reply with
your reproduction.

## Architecture

<p align="center">
  <img src="docs/architecture.png">
</p>

1. Scans a DynamoDB table for the first image that hasn't been tweeted i.e one without a Tweet ID
    * *Scanning the data isn't efficient, but I won't have many items and speed isn't important, so it is cheaper than defining an index*
2. Retrieves the image's data from the S3 Bucket
3. Tweets the image then updates the item in DynamoDB with the Tweet ID
    * *CloudWatch triggers the Lambda once every 24 hours, so I don't have to worry about any race conditions resulting from DynamoDB being eventually consistent*

## Iterations

This project is going to be done in iterations as I want to start using it as soon as possible

### Iteration 1 - Tweet photos from an S3 bucket

This iteration will allow me to choose a collection of photos that I want Tweeted at the same time each day - one per day.

1. I will hand-pick the images and store them in an S3 bucket with the date to Tweet and attribution stored in the filename.
2. Each day a scheduled Lambda will:
    1. Find the day's photo
    2. Store the date, filename and attribution to a database
    3. Tweet the image with the attribution
    4. Log the ID of the Tweet into the database
