import type { Skill } from "../types";

export const kubernetesSkill: Skill = {
  slug: "kubernetes",
  title: "Kubernetes",
  summary: "Pods, deployments, services and debugging workloads in cluster.",
  topics: [
    {
      slug: "01-fundamentals",
      title: "Fundamentals & Pods",
      summary: "What Kubernetes is and how Pods, the smallest deployable units, work.",
      tasks: [
        {
          slug: "k8s-first-pod",
          title: "Run Your First Pod",
          type: "guided",
          difficulty: "beginner",
          description:
            "A Pod is one or more containers that share network and storage — the smallest thing Kubernetes runs. Create one imperatively and watch it reach the Running state.",
          requirements: ["Pod web exists", "Pod web is Running"],
          env: "kubernetes 1.30 (kind)",
          checks: [{ kind: "k8spod", path: "default/web", label: "pod default/web is Running" }],
          steps: [
            {
              title: "Create the Pod",
              detail:
                "kubectl run creates a single Pod imperatively. --image specifies the container image. This is the fastest path; in real projects you usually write YAML manifests instead.",
              command: "kubectl run web --image=nginx:1.27",
            },
            {
              title: "Watch the Pod status",
              detail:
                "kubectl get pods lists Pods in the current namespace. Fresh Pods sit in ContainerCreating while the image is pulled, then flip to Running.",
              command: "kubectl get pods",
            },
            {
              title: "Inspect the Pod",
              detail:
                "kubectl describe pod web shows the full picture: image, node, events. When anything goes wrong, the Events section at the bottom is where the answer lives.",
              command: "kubectl describe pod web",
            },
            {
              title: "Submit for validation",
              detail: "The validator asks the cluster itself whether default/web is Running.",
              command: "",
            },
          ],
        },
      ],
    },
    {
      slug: "02-deployments",
      title: "Deployments & Scaling",
      summary: "Replicas, self-healing and rolling updates.",
      tasks: [
        {
          slug: "k8s-scale-deployment",
          title: "Deploy and Scale a ReplicaSet",
          type: "practice",
          difficulty: "beginner",
          description:
            "Nobody runs bare Pods in production. A Deployment keeps a chosen number of identical Pods alive and replaces any that die. Create one with 3 replicas.",
          requirements: [
            "Deployment web exists",
            "Deployment web is running exactly 3 replicas",
          ],
          env: "kubernetes 1.30 (kind)",
          checks: [
            { kind: "k8sdeployment", value: "default/web:3", label: "deployment default/web has 3 replicas" },
          ],
          steps: [
            {
              title: "Create the Deployment",
              detail:
                "kubectl create deployment makes a Deployment (which creates its Pods). --replicas 3 asks the controller to keep three copies alive at all times.",
              command: "kubectl create deployment web --image=nginx:1.27 --replicas=3",
            },
            {
              title: "List the Pods",
              detail:
                "kubectl get pods now shows three web-<hash> Pods. The hash is the ReplicaSet — delete one and the Deployment replaces it, that's self-healing.",
              command: "kubectl get pods",
            },
            {
              title: "Scale it",
              detail:
                "kubectl scale changes the desired replica count. The Deployment controller notices the gap and starts the difference. Scale to 3 here (it starts at 3, so this is a no-op — try 2, then back to 3).",
              command: "kubectl scale deployment web --replicas=3",
            },
            {
              title: "Verify",
              detail: "kubectl get deployments should show 3/3 READY for web.",
              command: "kubectl get deployments",
            },
            {
              title: "Submit for validation",
              detail: "The validator checks the Deployment's replica count against the cluster.",
              command: "",
            },
          ],
        },
      ],
    },
    {
      slug: "03-services",
      title: "Services",
      summary: "Stable networking for unstable Pods.",
      tasks: [
        {
          slug: "k8s-expose-service",
          title: "Expose a Deployment",
          type: "guided",
          difficulty: "beginner",
          description:
            "Pods come and go, so their IPs are useless as an address. A Service gives a stable virtual IP and DNS name in front of a set of Pods.",
          requirements: [
            "A Service named web-svc exists",
            "The Service forwards to the web deployment on port 80",
          ],
          env: "kubernetes 1.30 (kind)",
          checks: [
            { kind: "k8sservice", path: "default/web-svc", label: "service default/web-svc exists" },
            { kind: "k8sdeployment", value: "default/web:1", label: "deployment default/web exists" },
          ],
          steps: [
            {
              title: "Make sure the Deployment exists",
              detail:
                "Services select Pods by label. If you completed the deployment task it's already there; otherwise create one replica.",
              command: "kubectl create deployment web --image=nginx:1.27",
            },
            {
              title: "Expose it",
              detail:
                "kubectl expose creates a Service targeting the Deployment's Pods. --port is what clients call (80); --target-port is what the container listens on (8080 here — the app's port).",
              command: "kubectl expose deployment web --name=web-svc --port=80 --target-port=8080",
            },
            {
              title: "Verify the Service",
              detail:
                "kubectl get services lists it with a stable CLUSTER-IP and the port mapping 80/TCP.",
              command: "kubectl get services",
            },
            {
              title: "Submit for validation",
              detail: "The validator checks the Service and the Deployment behind it.",
              command: "",
            },
          ],
        },
      ],
    },
    {
      slug: "04-debugging",
      title: "Debugging Workloads",
      summary: "CrashLoopBackOff is a clue, not a verdict.",
      tasks: [
        {
          slug: "k8s-debug-crash",
          title: "Diagnose a Crashing Pod",
          type: "scenario",
          difficulty: "intermediate",
          description:
            "A Pod called api in this cluster is stuck in CrashLoopBackOff. Find out why from its logs, identify the missing piece, and record it. Failure is part of the curriculum.",
          requirements: [
            "File ~/report/crash.txt exists naming the missing environment variable",
          ],
          env: "kubernetes 1.30 (kind)",
          checks: [
            { kind: "filecontains", path: "/home/learner/report/crash.txt", value: "DB_HOST", label: "crash.txt names DB_HOST" },
          ],
          steps: [
            {
              title: "See the Pod state",
              detail:
                "kubectl get pods shows api in CrashLoopBackOff — Kubernetes restarted it repeatedly and is now backing off. The state says the container exits; not why.",
              command: "kubectl get pods",
            },
            {
              title: "Describe the Pod",
              detail:
                "kubectl describe pod api shows events: Back-off restarting failed container. Still not the reason — events describe the restart loop, not the crash.",
              command: "kubectl describe pod api",
            },
            {
              title: "Read the container logs",
              detail:
                "kubectl logs api prints what the process wrote before dying. THIS is where the reason is: the app requires an environment variable that the Pod spec doesn't set.",
              command: "kubectl logs api",
            },
            {
              title: "Record the finding",
              detail:
                "The log names the missing variable. Write it into the report file — in a real cluster the fix would be adding it to the Pod spec or a ConfigMap.",
              command: "mkdir ~/report",
            },
            {
              title: "Write the report",
              detail: "Record the variable name from the logs (DB_HOST).",
              command: "echo 'missing env: DB_HOST' > ~/report/crash.txt",
            },
            {
              title: "Submit for validation",
              detail: "The validator checks your report names the right variable.",
              command: "cat ~/report/crash.txt",
            },
          ],
        },
      ],
    },
    {
      slug: "05-manifests",
      title: "YAML Manifests",
      summary: "Declarative configuration: the way real clusters are managed.",
      tasks: [
        {
          slug: "k8s-apply-yaml",
          title: "Apply a Manifest",
          type: "guided",
          difficulty: "beginner",
          description:
            "Imperative commands are for learning; YAML manifests are for real life. Write a Pod manifest and apply it — the declarative workflow behind GitOps and ArgoCD.",
          requirements: [
            "File ~/manifests/pod.yaml exists",
            "Pod web-yaml is Running",
          ],
          env: "kubernetes 1.30 (kind)",
          checks: [
            { kind: "file", path: "/home/learner/manifests/pod.yaml", label: "manifest exists" },
            { kind: "k8spod", path: "default/web-yaml", label: "pod default/web-yaml is Running" },
          ],
          steps: [
            {
              title: "Create the manifests directory",
              detail: "Manifests live in the repository in real projects — one place, reviewable.",
              command: "mkdir ~/manifests",
            },
            {
              title: "Write the manifest",
              detail:
                "One echo with \\n separators writes the whole file. apiVersion/kind say WHAT the object is; metadata.name names it; spec.containers declares the container. Note the two-space indentation — it's meaningful in YAML.",
              command: "echo 'apiVersion: v1\\nkind: Pod\\nmetadata:\\n  name: web-yaml\\nspec:\\n  containers:\\n  - name: nginx\\n    image: nginx:1.27' > ~/manifests/pod.yaml",
            },
            {
              title: "Review the manifest",
              detail:
                "cat prints the file. If the indentation looks wrong, rewrite it — YAML is whitespace-sensitive.",
              command: "cat ~/manifests/pod.yaml",
            },
            {
              title: "Apply it",
              detail:
                "kubectl apply -f reads the file and makes the cluster match it. Then kubectl get pods shows web-yaml Running.",
              command: "kubectl apply -f ~/manifests/pod.yaml",
            },
            {
              title: "Verify",
              detail: "kubectl get pods should list web-yaml with STATUS Running.",
              command: "kubectl get pods",
            },
            {
              title: "Submit for validation",
              detail: "The validator checks the manifest file and the resulting Pod.",
              command: "",
            },
          ],
        },
      ],
    },
  ],
};
