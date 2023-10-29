import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

export class Ec2AutoScalingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ネットワークの作成
    const vpc = new ec2.Vpc(this, 'MyVPC', {
      maxAzs: 2, // 2つのAZにリソースを展開
    });

    // Auto Scalingグループの作成
    const asg = new autoscaling.AutoScalingGroup(this, 'MyASG', {
      vpc,
      instanceType: new ec2.InstanceType('t2.micro'),
      machineImage: new ec2.AmazonLinuxImage(),
      minCapacity: 2,
      maxCapacity: 6,
    });

    // Auto Scalingグループに対するAuto Scalingポリシーを追加
     asg.scaleOnCpuUtilization('MyCpuScaling', {
     targetUtilizationPercent: 30,
    });

    // ALBの作成
    const alb = new elbv2.ApplicationLoadBalancer(this, 'MyALB', {
      vpc,
      internetFacing: true, // インターネットに向けて公開
    });

    const listener = alb.addListener('Listener', {
      port: 80,
      open: true,
    });


    // ターゲットグループの作成
    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'MyTargetGroup', {
      port: 80,
      vpc,
    });

    // ロードバランサーにターゲットグループを接続
    listener.addTargetGroups('MyTargetGroup', {
      targetGroups: [targetGroup],
    });

    // Auto Scalingグループにターゲットグループを接続
    asg.attachToApplicationTargetGroup(targetGroup);

    
    // Auto Scalingグループを起動
    asg.scaleOnRequestCount('MyRequestCountScaling', {
      targetRequestsPerMinute: 1000,
    });
  }
}
