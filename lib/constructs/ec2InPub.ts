import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Network } from './vpcWithCidr';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export interface Ec2Props {
    vpc: ec2.Vpc;
    pubSub01: ec2.PublicSubnet;
    pubSub02: ec2.PublicSubnet;
    // instanceCount: number;
    ec2Sg: ec2.SecurityGroup;
}

export class Ec2 extends Construct {
    constructor(scope: Construct, id: string, props: Ec2Props) {
        super(scope, id);

        // PHP 8.2をインストールするユーザデータ例
        // const userData = ec2.UserData.forLinux({ shebang: '#!/bin/bash' });
        // userData.addCommands(
        //     'sudo yum update -y',
        //     'sudo yum localinstall -y https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm',
        //     'sudo yum-config-manager --disable mysql57-community',
        //     'sudo yum-config-manager --enable mysql80-community',
        //     'sudo rpm --import https://repo.mysql.com/RPM-GPG-KEY-mysql-2022',
        //     'sudo yum install -y mysql-community-client',
        //     'sudo yum install -y git',
        //     'sudo amazon-linux-extras install -y php8.2',
        //     'sudo yum install -y php-cli php-fpm php-json php-pdo php-mysqlnd php-zip php-gd php-mbstring php-curl php-xml php-pear php-bcmath'
        // );

        // パブリックサブネット内の踏み台EC2インスタンス01の作成
        const instance01 = new ec2.Instance(this, 'EC2-01', {
            vpc: props.vpc,
            instanceType: new ec2.InstanceType('t2.micro'),
            machineImage: ec2.MachineImage.lookup({
                name: 'amzn2-ami-hvm-*',
                owners: ['amazon'],
            }),
            vpcSubnets: {
                subnets: [props.pubSub01]
            },
            ssmSessionPermissions: true,
            // role: role,
            securityGroup: props.ec2Sg,
            // userData: userData,
        });

        // EC2インスタンスへEIPを付与
        const eip01 = new ec2.CfnEIP(this, 'EIP01', {
            instanceId: instance01.instanceId,
        });

        // パブリックサブネット内の踏み台EC2インスタンス02の作成
        const instance02 = new ec2.Instance(this, 'EC2-02', {
            vpc: props.vpc,
            instanceType: new ec2.InstanceType('t2.micro'),
            machineImage: ec2.MachineImage.lookup({
                name: 'amzn2-ami-hvm-*',
                owners: ['amazon'],
            }),
            vpcSubnets: {
                subnets: [props.pubSub02]
            },
            ssmSessionPermissions: true,
            // role: role,
            // securityGroup: ,
            // userData: userData,
        });

        // EC2インスタンスへEIPを付与
        const eip02 = new ec2.CfnEIP(this, 'EIP02', {
            instanceId: instance02.instanceId,
        });




        // n個のインスタンスを作成
        // const subnets = [props.pubSub01, props.pubSub02]

        // for (let i = 0; i < props.instanceCount; i++) {
        //     new ec2.Instance(this, `EC2-${i + 1}`, {
        //         vpc: props.vpc,
        //         instanceType: new ec2.InstanceType('t2.micro'),
        //         machineImage: ec2.MachineImage.lookup({
        //             name: 'amzn2-ami-hvm-*',
        //             owners: ['amazon'],
        //         }),
        //         vpcSubnets: {
        //             subnets: [subnets[i % subnets.length]]
        //         },
        //         ssmSessionPermissions: true,
        //         // role: role,
        //         // securityGroup: ,
        //         // userData: userData,
        //     });

    }
}

