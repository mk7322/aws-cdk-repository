import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ec2 from 'aws-cdk-lib/aws-ec2';


export interface S3Props {
    vpc: ec2.Vpc;
}

export class S3 extends Construct {
    public readonly albLogBucket: s3.Bucket;

    constructor(scope: Construct, id: string, props: S3Props) {
        super(scope, id);

        // ALBアクセスログ用バケットを作成
        const albLogBucket = new s3.Bucket(this, "ALBLogBucket", {
            removalPolicy: RemovalPolicy.DESTROY,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            enforceSSL: true,
        });
        this.albLogBucket = albLogBucket;

    }
}