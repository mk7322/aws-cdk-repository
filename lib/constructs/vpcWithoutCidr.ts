import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class Network extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        // Internet Gatewayの作成
        const igw = new ec2.CfnInternetGateway(this, 'InternetGateway');

        // VPCの作成
        const vpc = new ec2.Vpc(this, "VPC", {
            ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/16"), // cidr: '10.0.0.0/16'はdeprecated
            // vpcName: best practiceはつけない？？
            maxAzs: 2,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    subnetType: ec2.SubnetType.PUBLIC,
                    name: "Public"
                },
                {
                    cidrMask: 24,
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                    name: "Private"
                },
                {
                    cidrMask: 24,
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                    name: "Private"
                },
            ],
            natGateways: 0,
            createInternetGateway: true,
            enableDnsHostnames: true,
            enableDnsSupport: true,
        });
    }
}