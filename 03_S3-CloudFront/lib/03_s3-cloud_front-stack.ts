import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';

export class S3CFntStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const webHostingBucket = new s3.Bucket(this, 'WebHostingBucket', {
      // bucketName: XXXXX,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // テストや開発目的の場合のみ使用する
      autoDeleteObjects: true, // デフォルトはfalse
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS, // public access時に設定
      // versioned: true,
      // encryption: , // デフォルトはKMS
      // encryptionKey: ,
      // cors: [],
      // intelligentTieringConfigurations: []
      // lifecycleRules: [],
      // enforceSSL: true,
      // minimumTLSVersion: ,
    });

    // 公開リードアクセスのためのバケットポリシーを追加
    const webSiteBucketPolicy = new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [`${webHostingBucket.bucketArn}/*`],
      effect: iam.Effect.ALLOW,
      principals: [new iam.ArnPrincipal('*')],
    });
    webHostingBucket.addToResourcePolicy(webSiteBucketPolicy);

    // S3バケットに静的なウェブサイトコンテンツをデプロイ
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('./website')],
      destinationBucket: webHostingBucket,
    });

    // 
    // const distribution = new cloudfront.Distribution(this, "distribution", {
    //   defaultRootObject: 'index.html',
    // })

  }
}