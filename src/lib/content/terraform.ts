import type { Skill } from "../types";

export const terraformSkill: Skill = {
  slug: "terraform",
  title: "Terraform",
  summary: "Infrastructure as code: write it, plan it, apply it, destroy it.",
  topics: [
    {
      slug: "01-basics",
      title: "Init & Plan",
      summary: "HCL, providers and the plan that predicts every change.",
      tasks: [
        {
          slug: "tf-init-plan",
          title: "Write Your First Configuration",
          type: "guided",
          difficulty: "beginner",
          description:
            "Terraform turns .tf files into real infrastructure. Write a configuration that declares an S3 bucket, initialize the provider and generate a plan — the read-only preview every change should start with.",
          requirements: [
            "Directory ~/infra contains main.tf with an aws_s3_bucket resource",
            "terraform init has been run in ~/infra",
            "A plan was generated successfully",
          ],
          env: "terraform 1.7",
          checks: [
            { kind: "filecontains", path: "/home/learner/infra/main.tf", value: "aws_s3_bucket", label: "main.tf declares an aws_s3_bucket" },
            { kind: "tfinit", path: "/home/learner/infra", label: "terraform init completed in ~/infra" },
          ],
          steps: [
            {
              title: "Create the project directory",
              detail:
                "One directory = one Terraform root module. Keep it isolated from everything else.",
              command: "mkdir ~/infra",
            },
            {
              title: "Enter it and declare the resource",
              detail:
                "The next command writes main.tf. resource \"aws_s3_bucket\" \"demo\" is HCL: TYPE NAME. The block body is empty here — defaults only.",
              command: "cd ~/infra",
            },
            {
              title: "Write main.tf",
              detail:
                "echo 'resource \"aws_s3_bucket\" \"demo\" {}' > main.tf — this is your entire infrastructure definition. Terraform figures out the rest.",
              command: "echo 'resource \"aws_s3_bucket\" \"demo\" {}' > main.tf",
            },
            {
              title: "Initialize",
              detail:
                "terraform init downloads the provider plugins your configuration needs (hashicorp/aws here) and sets up the backend. Run it once per module, and after every provider change.",
              command: "terraform init",
            },
            {
              title: "Plan",
              detail:
                "terraform plan compares the code with reality and prints the diff: + means will be created. Read the plan before every apply — it's your last line of defense.",
              command: "terraform plan",
            },
            {
              title: "Submit for validation",
              detail:
                "The validator checks main.tf declares the bucket and that init ran in this directory.",
              command: "",
            },
          ],
        },
      ],
    },
    {
      slug: "02-apply",
      title: "Apply & State",
      summary: "Turning plans into real resources — and tracking them in state.",
      tasks: [
        {
          slug: "tf-apply-bucket",
          title: "Apply the Configuration",
          type: "practice",
          difficulty: "beginner",
          description:
            "terraform apply executes the plan and writes what it created into terraform.tfstate — the file Terraform uses to remember what belongs to it.",
          requirements: [
            "aws_s3_bucket.demo exists in the Terraform state",
          ],
          env: "terraform 1.7",
          checks: [
            { kind: "tfresource", path: "/home/learner/infra", value: "aws_s3_bucket.demo", label: "state contains aws_s3_bucket.demo" },
          ],
          steps: [
            {
              title: "Enter the module",
              detail: "State is stored per directory — always work from the module root.",
              command: "cd ~/infra",
            },
            {
              title: "Apply with auto-approve",
              detail:
                "terraform apply normally asks for confirmation; -auto-approve skips the prompt (in CI you'd guard this with plan reviews instead).",
              command: "terraform apply -auto-approve",
            },
            {
              title: "Inspect the state",
              detail:
                "terraform state list prints every resource Terraform manages. It should show aws_s3_bucket.demo — this is the source of truth Terraform reconciles against.",
              command: "terraform state list",
            },
            {
              title: "Submit for validation",
              detail: "The validator reads the same state file Terraform wrote.",
              command: "",
            },
          ],
        },
      ],
    },
    {
      slug: "03-destroy",
      title: "Destroy",
      summary: "Infrastructure as code cuts both ways.",
      tasks: [
        {
          slug: "tf-destroy",
          title: "Destroy It All",
          type: "practice",
          difficulty: "beginner",
          description:
            "The most underrated Terraform command. Destroy everything the module created and confirm the state is empty — the same reflex that keeps cloud bills at zero.",
          requirements: [
            "Terraform state in ~/infra is empty",
          ],
          env: "terraform 1.7",
          checks: [
            { kind: "tfempty", path: "/home/learner/infra", label: "state in ~/infra is empty" },
          ],
          steps: [
            {
              title: "Enter the module",
              detail: "Destroy, like apply, acts on the current directory's state.",
              command: "cd ~/infra",
            },
            {
              title: "Destroy",
              detail:
                "terraform destroy -auto-approve reverses the apply: every resource in state is deleted. In production you'd run a destroy plan first and read every line.",
              command: "terraform destroy -auto-approve",
            },
            {
              title: "Confirm the state is empty",
              detail:
                "terraform state list should print nothing. The infrastructure no longer exists, and neither does the bill.",
              command: "terraform state list",
            },
            {
              title: "Submit for validation",
              detail: "The validator confirms the state in ~/infra holds no resources.",
              command: "",
            },
          ],
        },
      ],
    },
  ],
};
