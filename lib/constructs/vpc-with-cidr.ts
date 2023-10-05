import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class Network extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        const vpc = new ec2.Vpc(this, "VPC", {
            ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
            // vpcName: best practiceはつけない？？
            maxAzs: 2,
            subnetConfiguration: [],
            natGateways: 0,
            createInternetGateway: true,
            enableDnsHostnames: true,
            enableDnsSupport: true,
        });

        // PublicSubnet01の作成
        const publicSubnet01 = new ec2.PublicSubnet(this, `publicSubnet01`, {
            vpcId: vpc.vpcId,
            availabilityZone: "ap-northeast-1a",
            cidrBlock: "10.0.1.0/24",
            mapPublicIpOnLaunch: true,
        });

        // PrivateSubnet01の作成
        const privateSubnet01 = new ec2.PrivateSubnet(this, `privateSubnet01`, {
            vpcId: vpc.vpcId,
            availabilityZone: "ap-northeast-1a",
            cidrBlock: "10.0.2.0/24",
            mapPublicIpOnLaunch: false,
        });

        // PrivateSubnet01の作成
        const privateSubnet02 = new ec2.PrivateSubnet(this, `privateSubnet02`, {
            vpcId: vpc.vpcId,
            availabilityZone: "ap-northeast-1c",
            cidrBlock: "10.0.3.0/24",
            mapPublicIpOnLaunch: false,
        });
    }
}