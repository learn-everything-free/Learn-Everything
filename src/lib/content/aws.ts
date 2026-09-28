import type { Skill } from "../types";

export const awsSkill: Skill = {
  slug: "aws",
  title: "AWS",
  summary: "Identity, storage and compute — the AWS primitives behind everything.",
  topics: [
    {
      slug: "01-identity",
      title: "Identity & Access",
      summary: "Who are you on AWS, and what are you allowed to do?",
      tasks: [
        {
          slug: "aws-verify-identity",
          title: "Verify Your AWS Identity",
          type: "guided",
          difficulty: "beginner",
          description:
            "Before touching any AWS service, always confirm who the CLI is acting as. Misconfigured credentials are the #1 cause of 'why can't I access anything'.",
          requirements: [
            "Directory ~/report exists",
            "File ~/report/account.txt exists and contains the AWS account ID",
          ],
          env: "aws-cli (lab profile)",
          checks: [
            { kind: "directory", path: "/home/learner/report", label: "~/report" },
            { kind: "file", path: "/home/learner/report/account.txt", label: "~/report/account.txt" },
            { kind: "filecontains", path: "/home/learner/report/account.txt", value: "844399650771", label: "account.txt contains the account ID" },
          ],
          steps: [
            {
              title: "Call STS",
              detail:
                "aws sts get-caller-identity asks the Security Token Service who you are. It works with any valid credentials and costs nothing.",
              command: "aws sts get-caller-identity",
            },
            {
              title: "Read the response",
              detail:
                "Three fields: UserId, Account (844399650771 in this lab) and the Arn — which also tells you whether you're a user, a role or a federated session.",
              command: "",
            },
            {
              title: "Record the account ID",
              detail: "Write it into the report file.",
              command: "echo 'account: 844399650771' > ~/report/account.txt",
            },
            {
              title: "Verify and submit",
              detail: "cat the file, then submit. The validator compares against the lab's real account ID.",
              command: "cat ~/report/account.txt",
            },
          ],
        },
      ],
    },
    {
      slug: "02-s3",
      title: "S3 — Object Storage",
      summary: "Buckets, objects and naming rules.",
      tasks: [
        {
          slug: "aws-s3-bucket",
          title: "Create a Bucket and Upload an Object",
          type: "practice",
          difficulty: "beginner",
          description:
            "S3 is the storage everything else leans on: backups, static sites, Terraform state, ML datasets. Create a bucket, upload a file into it and list what's inside.",
          requirements: [
            "A bucket named learner-demo-bucket exists",
            "The bucket contains an uploaded object",
          ],
          env: "aws-cli (lab profile)",
          checks: [
            { kind: "awss3", value: "learner-demo-bucket", label: "bucket learner-demo-bucket exists" },
            { kind: "awss3object", value: "learner-demo-bucket/demo.txt", label: "demo.txt uploaded to the bucket" },
          ],
          steps: [
            {
              title: "Create the bucket",
              detail:
                "aws s3 mb makes a bucket. Bucket names are globally unique across all of AWS — that's why real names look like mycompany-logs-eu-west-1.",
              command: "aws s3 mb s3://learner-demo-bucket",
            },
            {
              title: "List your buckets",
              detail: "aws s3 ls with no target lists every bucket you own.",
              command: "aws s3 ls",
            },
            {
              title: "Create a file to upload",
              detail:
                "Any file works — this one stands in for a backup or a static site asset.",
              command: "mkdir ~/report",
            },
            {
              title: "Upload it",
              detail:
                "aws s3 cp copies local files to S3 (and back). The destination is s3://bucket/key — the key is the full object path.",
              command: "echo 'demo object' > ~/report/demo.txt",
            },
            {
              title: "Copy to S3",
              detail: "aws s3 cp ~/report/demo.txt s3://learner-demo-bucket/demo.txt",
              command: "aws s3 cp ~/report/demo.txt s3://learner-demo-bucket/demo.txt",
            },
            {
              title: "List the bucket contents",
              detail:
                "aws s3 ls s3://bucket lists objects in that bucket. Your demo.txt should be there.",
              command: "aws s3 ls s3://learner-demo-bucket",
            },
            {
              title: "Submit for validation",
              detail: "The validator checks the bucket exists and holds your object.",
              command: "",
            },
          ],
        },
      ],
    },
    {
      slug: "03-ec2",
      title: "EC2 — Virtual Machines",
      summary: "Launch, describe and terminate instances.",
      tasks: [
        {
          slug: "aws-launch-ec2",
          title: "Launch an EC2 Instance",
          type: "guided",
          difficulty: "beginner",
          description:
            "EC2 is AWS's virtual machine service. Launch an instance from an AMI, confirm it's running, then terminate it — the full lifecycle in one task.",
          requirements: [
            "An EC2 instance from ami-0abcdef1234567890 is running",
          ],
          env: "aws-cli (lab profile)",
          checks: [
            { kind: "awsec2", value: "ami-0abcdef1234567890", label: "instance from ami-0abcdef1234567890 running" },
          ],
          steps: [
            {
              title: "Launch an instance",
              detail:
                "aws ec2 run-instances starts a VM. --image-id picks the AMI (the machine image); in this lab, t2.micro is the default instance type — the free-tier classic.",
              command: "aws ec2 run-instances --image-id ami-0abcdef1234567890",
            },
            {
              title: "Read the response",
              detail:
                "The JSON contains InstanceId (i-...) and State: running. Note the ID — you'll need it to terminate this exact machine later.",
              command: "",
            },
            {
              title: "Describe your instances",
              detail:
                "aws ec2 describe-instances lists everything. Filtering is a big part of real AWS CLI usage: --filters 'Name=instance-state-name,Values=running'.",
              command: "aws ec2 describe-instances",
            },
            {
              title: "Submit for validation",
              detail: "The validator checks for a running instance from the AMI you launched.",
              command: "",
            },
            {
              title: "Terminate it (after the validator passes)",
              detail:
                "Termination is the bill-safety habit to build: a forgotten instance is a forgotten monthly invoice. Run this once you've submitted, and verify with describe-instances.",
              command: "aws ec2 terminate-instances --instance-ids i-0123456789abcdef0",
            },
          ],
        },
      ],
    },
  ],
};
