import type { Skill } from "../types";

export const dockerSkill: Skill = {
  slug: "docker",
  title: "Docker",
  summary: "Build, run, inspect and debug containers.",
  topics: [
    {
      slug: "01-basics",
      title: "Containers & Images",
      summary: "Images, layers, running containers and inspecting what they do.",
      tasks: [
        {
          slug: "docker-run-app",
          title: "Deploy the Application as a Container",
          type: "challenge",
          difficulty: "intermediate",
          description:
            "A simple HTTP application image (app:latest) is already pulled on this machine. Deploy it as a container so it is reachable on port 8080. The walkthrough shows the exact commands and what every flag does.",
          requirements: [
            "A container built from app:latest is running",
            "Port 8080 is exposed and mapped",
            "The application answers with HTTP 200",
          ],
          env: "docker:24",
          checks: [
            { kind: "container", path: "app:latest", label: "container from app:latest running" },
            { kind: "port", port: 8080, label: "port 8080 mapped" },
          ],
          steps: [
            {
              title: "Confirm the image is available",
              detail:
                "docker images lists every image stored locally. You should see app with the tag latest — that's the application you need to deploy.",
              command: "docker images",
            },
            {
              title: "Run the container",
              detail:
                "docker run starts a container from an image. -d runs it detached (in the background) and prints the container ID. -p 8080:80 publishes ports: host 8080 forwards to the container's port 80, where the app listens. The order is host:container.",
              command: "docker run -d -p 8080:80 app:latest",
            },
            {
              title: "Verify the container is running",
              detail:
                "docker ps lists running containers. Check STATUS is Up and PORTS shows 0.0.0.0:8080->80/tcp. If your container is missing, run docker ps -a — it lists stopped ones too, which usually means the app crashed on start.",
              command: "docker ps",
            },
            {
              title: "Inspect the application logs",
              detail:
                "docker logs prints everything the process wrote to stdout — with no argument it uses the latest container (in a real shell you pass the container ID). You should see 'listening on 0.0.0.0:80'.",
              command: "docker logs",
            },
            {
              title: "Submit for validation",
              detail:
                "The validator inspects container state and port mappings: a running container from app:latest with port 8080 mapped.",
              command: "",
            },
          ],
        },
      ],
    },
    {
      slug: "02-images",
      title: "Building Images",
      summary: "Dockerfiles, build contexts and tagging.",
      tasks: [
        {
          slug: "docker-build-image",
          title: "Build Your Own Image",
          type: "guided",
          difficulty: "beginner",
          description:
            "Instead of consuming images, make one. Write a Dockerfile, build it with a tag and run a container from your own image.",
          requirements: [
            "Directory ~/build exists with a Dockerfile",
            "Image myapp:1.0 exists locally",
            "A container from myapp:1.0 is running",
          ],
          env: "docker:24",
          checks: [
            { kind: "file", path: "/home/learner/build/Dockerfile", label: "~/build/Dockerfile exists" },
            { kind: "container", path: "myapp:1.0", label: "container from myapp:1.0 running" },
          ],
          steps: [
            {
              title: "Create a build directory",
              detail:
                "docker build sends a directory (the build context) to the daemon. Keeping builds in their own folder keeps contexts small.",
              command: "mkdir ~/build",
            },
            {
              title: "Write a Dockerfile",
              detail:
                "FROM scratch starts from nothing; COPY adds a file into the image; CMD is what runs when a container starts. One echo per line builds the file up.",
              command: "echo 'FROM scratch' > ~/build/Dockerfile",
            },
            {
              title: "Add the copy instruction",
              detail: "This appends the COPY line to the Dockerfile with >>.",
              command: "echo 'COPY app /app' >> ~/build/Dockerfile",
            },
            {
              title: "Add the start command",
              detail: "The final line. cat the Dockerfile to see all three instructions.",
              command: "echo 'CMD [\"/app\"]' >> ~/build/Dockerfile",
            },
            {
              title: "Enter the build directory",
              detail:
                "docker build is always run from the directory containing the Dockerfile — the build context.",
              command: "cd ~/build",
            },
            {
              title: "Build the image",
              detail:
                "docker build reads the Dockerfile and produces an image. -t myapp:1.0 tags it with a name and version. The . means 'use the current directory as context'. Then verify with docker images.",
              command: "docker build -t myapp:1.0 .",
            },
            {
              title: "Run a container from your image",
              detail:
                "Now your image is first-class: run it detached with a port mapping, exactly like the official one.",
              command: "docker run -d -p 8081:80 myapp:1.0",
            },
            {
              title: "Submit for validation",
              detail:
                "The validator checks the Dockerfile exists and a container from myapp:1.0 is running.",
              command: "",
            },
          ],
        },
      ],
    },
    {
      slug: "03-logs-inspect",
      title: "Logs & Inspection",
      summary: "Containers are black boxes until you read their output.",
      tasks: [
        {
          slug: "docker-capture-logs",
          title: "Capture Container Output",
          type: "practice",
          difficulty: "beginner",
          description:
            "Run the app, capture its logs into a file with shell redirection and verify the port it listens on. Reading container output is the first step of debugging any container.",
          requirements: [
            "A container from app:latest is running",
            "File ~/report/container.log exists containing the container's output",
          ],
          env: "docker:24",
          checks: [
            { kind: "container", path: "app:latest", label: "container from app:latest running" },
            { kind: "filecontains", path: "/home/learner/report/container.log", value: "listening on 0.0.0.0:80", label: "container.log has the app's output" },
          ],
          steps: [
            {
              title: "Start the app container",
              detail: "Detached with no port mapping — logs are the focus here, not networking.",
              command: "docker run -d app:latest",
            },
            {
              title: "Read its logs",
              detail:
                "docker logs with no argument shows the most recent container's output. You should see 'listening on 0.0.0.0:80'.",
              command: "docker logs",
            },
            {
              title: "Capture the logs to a file",
              detail:
                "Redirection works on any command: > writes the command's output into a file. Create the report directory first if you haven't yet.",
              command: "mkdir ~/report",
            },
            {
              title: "Redirect the logs",
              detail:
                "docker logs > ~/report/container.log — then cat the file to confirm the capture.",
              command: "docker logs > ~/report/container.log",
            },
            {
              title: "Verify and submit",
              detail: "The validator checks the file contains the real container output.",
              command: "cat ~/report/container.log",
            },
          ],
        },
      ],
    },
    {
      slug: "04-cleanup",
      title: "Cleanup & Lifecycle",
      summary: "Stop, remove and keep the machine tidy.",
      tasks: [
        {
          slug: "docker-cleanup",
          title: "Clean Up Containers and Images",
          type: "practice",
          difficulty: "beginner",
          description:
            "Leftover containers and images eat disk on every real machine. Stop the running app, remove its container, then remove the image itself — and prove it's gone.",
          requirements: [
            "No container from app:latest is running",
            "Image app:latest has been removed locally",
          ],
          env: "docker:24",
          checks: [
            { kind: "nocontainer", path: "app:latest", label: "no running container from app:latest" },
            { kind: "noimage", path: "app:latest", label: "image app:latest removed" },
          ],
          steps: [
            {
              title: "List what's running",
              detail:
                "docker ps shows the containers you started in earlier tasks. Note the container ID of the app container.",
              command: "docker ps",
            },
            {
              title: "Stop the container",
              detail:
                "docker stop asks the process to shut down gracefully (SIGTERM, then SIGKILL). $(docker ps -q) is command substitution: the shell runs the inner command and pastes its output (the running container IDs) into the stop command.",
              command: "docker stop $(docker ps -q)",
            },
            {
              title: "Confirm nothing is running",
              detail:
                "docker ps shows an empty list. docker ps -a still shows the stopped container — stopped containers are kept so they can be restarted or inspected.",
              command: "docker ps -a",
            },
            {
              title: "Remove the stopped container",
              detail:
                "docker rm deletes a container for good. Passing every container ID via $(docker ps -aq) cleans them all in one go.",
              command: "docker rm $(docker ps -aq)",
            },
            {
              title: "Remove the image",
              detail:
                "docker rmi deletes the image from local storage. It fails if any container still uses it — which is exactly the safety you want.",
              command: "docker rmi app:latest",
            },
            {
              title: "Verify everything is gone",
              detail:
                "docker images should no longer list app, and docker ps -a should have no app containers. Then submit.",
              command: "docker images",
            },
          ],
        },
      ],
    },
  ],
};
