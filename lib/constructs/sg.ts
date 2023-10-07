import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export interface SgProps {
    vpc: ec2.Vpc;
}

export class Sg extends Construct {
    public readonly albSg: ec2.SecurityGroup;
    public readonly ec2Sg: ec2.SecurityGroup;

    constructor(scope: Construct, id: string, props: SgProps) {
        super(scope, id);

        // ALB 用 SG の作成
        const albSg = new ec2.SecurityGroup(this, "ALBSG", {
            vpc: props.vpc,
            description: 'Allow traffic from HTTP/HTTPS access',
            allowAllOutbound: true,
        });
        this.albSg = albSg;


        // EC2 用 SG の作成
        const ec2Sg = new ec2.SecurityGroup(this, "EC2SG", {
            vpc: props.vpc,
            description: 'Allow traffic from ALB and HTTP/HTTPS access',
            allowAllOutbound: true,
        });
        this.ec2Sg = ec2Sg;
        ec2Sg.addIngressRule(albSg, ec2.Port.tcp(80), 'Allow HTTP traffic from ALB');
        ec2Sg.addIngressRule(albSg, ec2.Port.tcp(443), 'Allow HTTPS traffic from ALB');
    }
}