import { S3 } from 'aws-sdk';

export class AwsApi {

  private s3: S3;

  constructor() {
    this.s3 = new S3();
  }

  public async uploadImage(data: Buffer, filename: string): Promise<string> {
    console.log('Uploading to S3:', filename);

    await this.s3.putObject({
      Bucket: 'citypantry-bug-screenshots',
      Key: filename,
      Body: data,
      ContentEncoding: 'base64',
      ContentType: 'image/png'
    }).promise();
    return 'https://s3.eu-west-2.amazonaws.com/citypantry-bug-screenshots/' + filename;
  }

  public async uploadText(data: string, filename: string): Promise<string> {
    console.log('Uploading to S3:', filename);

    await this.s3.putObject({
      Bucket: 'citypantry-bug-screenshots',
      Key: filename,
      Body: Buffer.from(data)
    }).promise();
    return 'https://s3.eu-west-2.amazonaws.com/citypantry-bug-screenshots/' + filename;
  }
}

export const awsApi = new AwsApi();
