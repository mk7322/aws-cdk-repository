import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as elbv2_targets from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as s3 from 'aws-cdk-lib/aws-s3';

export interface AlbProps {
    vpc: ec2.Vpc;
    pubSub01: ec2.PublicSubnet;
    pubSub02: ec2.PublicSubnet;
    // instanceCount: number;
    instance01: ec2.Instance;
    instance02: ec2.Instance;
    albSg: ec2.SecurityGroup;
    albLogBucket: s3.Bucket;
}

export class Alb extends Construct {
    public readonly securityGroup: ec2.SecurityGroup;

    constructor(scope: Construct, id: string, props: AlbProps) {
        super(scope, id);

        // ALBの作成
        const alb = new elbv2.ApplicationLoadBalancer(this, "ALB", {
            vpc: props.vpc,
            internetFacing: true,
            securityGroup: props.albSg,
            vpcSubnets: {
                subnets: [props.pubSub01, props.pubSub02]
            },
        });

        // ALBターゲットグループの作成
        const instanceTarget1 = new elbv2_targets.InstanceTarget(props.instance01);
        const instanceTarget2 = new elbv2_targets.InstanceTarget(props.instance02);

        const targetGroup = new elbv2.ApplicationTargetGroup(this, 'ALBTargetGroup', {
            vpc: props.vpc,
            port: 80, // 443
            protocol: elbv2.ApplicationProtocol.HTTP, // HTTPS
            targetType: elbv2.TargetType.INSTANCE, // IP or INSTANCE
            protocolVersion: elbv2.ApplicationProtocolVersion.HTTP1, // HTTP2は443のみ対応
            targets: [instanceTarget1, instanceTarget2],
            healthCheck: {
                path: '/',
                interval: Duration.seconds(10),
                healthyHttpCodes: '200',
                healthyThresholdCount: 5,
                unhealthyThresholdCount: 2,
                timeout: Duration.seconds(5),
            },
        });
        // ALBアクセスログ設定
        alb.logAccessLogs(props.albLogBucket);

        // ALBリスナーの作成
        const albListener = alb.addListener("AlbHttpListener", {
            port: 80,
            protocol: elbv2.ApplicationProtocol.HTTP,
            open: true,
        });
        albListener.addTargetGroups('TargetGroup', {
            targetGroups: [targetGroup],
        });
    }
}