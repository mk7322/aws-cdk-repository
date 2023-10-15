import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfront_origins from 'aws-cdk-lib/aws-cloudfront-origins';

export class S3CFntStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// 静的webサイトホスティング用バケットの作成
		const webHostingBucket = new s3.Bucket(this, 'WebHostingBucket', {
			// bucketName: XXXXX,
			removalPolicy: RemovalPolicy.DESTROY, // テストや開発目的の場合のみ使用する
			autoDeleteObjects: true, // デフォルトはfalse
			websiteIndexDocument: 'index.html',
			websiteErrorDocument: 'error.html',
			publicReadAccess: false,
			blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS, // public access時に設定
			// versioned: true,
			// encryption: , // デフォルトはKMS
			// encryptionKey: ,
			// cors: [],
			// intelligentTieringConfigurations: [],
			// lifecycleRules: [],
			// enforceSSL: true,
			// minimumTLSVersion: ,
		});

		// CloudFront Distributionのログ用バケットの作成
		const CFntLogBucket = new s3.Bucket(this, "CFntLogBucket", {
			removalPolicy: RemovalPolicy.DESTROY,
			autoDeleteObjects: true,
			publicReadAccess: false,
			blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
			accessControl: s3.BucketAccessControl.LOG_DELIVERY_WRITE,
		});

		// Origin Access Identityを作成
		const oai = new cloudfront.OriginAccessIdentity(this, "OAI");

		// CloudFront ディストリビューションを作成
		// const distribution = new cloudfront.Distribution(this, "distribution", {
		// 	enabled: true,
		// 	defaultRootObject: 'index.html',
		// 	defaultBehavior: {
		// 		origin: new cloudfront_origins.S3Origin(webHostingBucket, {
		// 			originAccessIdentity: oai,
		// 		}),
		// 		// origin: new cloudfront_origin.LoadBalancerV2Origin(MyLB), // オリジンをLBに設定
		// 		allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
		// 		cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
		// 		cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
		// 		viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.ALLOW_ALL, // REDIRECT_TO_HTTPS
		// 	},
		// 	errorResponses: [
		// 		{
		// 			ttl: Duration.seconds(300),
		// 			httpStatus: 403,
		// 			responseHttpStatus: 403,
		// 			responsePagePath: '/error.html',
		// 		},
		// 		{
		// 			ttl: Duration.seconds(300),
		// 			httpStatus: 404,
		// 			responseHttpStatus: 404,
		// 			responsePagePath: '/error.html',
		// 		}
		// 	],
		// 	priceClass: cloudfront.PriceClass.PRICE_CLASS_200, // 使用するエッジロケーションの数（100/200/ALL）
		// 	httpVersion: cloudfront.HttpVersion.HTTP1_1, // 使用するhttpバージョン（HTTP1_1/HTTP2/HTTP2_AND_3/HTTP3)
		// 	minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2018,
		// 	enableLogging: true,
		// 	logBucket: CFntLogBucket,
		// 	logFilePrefix: 'distribution-access-log/',
		// 	logIncludesCookies: true,
		// 	// certificate: ,
		// 	// domainNames: ,
		// });

		// CloudFront ディストリビューションを作成
		const distribution = new cloudfront.CloudFrontWebDistribution(this, "distribution",
			{
				enabled: true,
				defaultRootObject: 'index.html',
				errorConfigurations: [
					{
						errorCachingMinTtl: 300,
						errorCode: 403,
						responseCode: 200,
						responsePagePath: "/error.html",
					},
					{
						errorCachingMinTtl: 300,
						errorCode: 404,
						responseCode: 200,
						responsePagePath: "/error.html",
					},
				],
				originConfigs: [
					{
						s3OriginSource: {
							s3BucketSource: webHostingBucket,
							originAccessIdentity: oai,
						},
						behaviors: [
							{
								isDefaultBehavior: true,
							},
						],
					},
				],
				priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
				// 	httpVersion: cloudfront.HttpVersion.HTTP1_1, // 使用するhttpバージョン（HTTP1_1/HTTP2/HTTP2_AND_3/HTTP3)
				loggingConfig: {
					bucket: CFntLogBucket,
					prefix: 'distribution-access-log/',
					includeCookies: true,
				},
				viewerCertificate: cloudfront.ViewerCertificate.fromCloudFrontDefaultCertificate(),
				viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.ALLOW_ALL,
			}
		);

		// 公開リードアクセスのためのバケットポリシーを追加
		const webSiteBucketPolicy = new iam.PolicyStatement({
			actions: ['s3:GetObject'],
			resources: [`${webHostingBucket.bucketArn}/*`],
			effect: iam.Effect.ALLOW,
			principals: [new iam.CanonicalUserPrincipal(oai.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
		});
		webHostingBucket.addToResourcePolicy(webSiteBucketPolicy);

		// S3バケットに静的なウェブサイトコンテンツをデプロイ
		new s3deploy.BucketDeployment(this, 'DeployWebsite', {
			sources: [s3deploy.Source.asset('./website')],
			destinationBucket: webHostingBucket,
			distribution: distribution,
			distributionPaths: ['/*'],
		});

	}
}