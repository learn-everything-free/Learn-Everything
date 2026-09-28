import type { Skill } from "../types";

export const networkingSkill: Skill = {
  slug: "networking",
  title: "Networking",
  summary: "IPs, ports, DNS and the paths packets actually take.",
  topics: [
    {
      slug: "01-ip-addressing",
      title: "IP Addressing & Routes",
      summary: "Which address is yours and where packets leave the machine.",
      tasks: [
        {
          slug: "net-check-connectivity",
          title: "Trace Your Network Setup",
          type: "guided",
          difficulty: "beginner",
          description:
            "Every container and server has an IP, a route to the outside world and a way to test reachability. Find this machine's addresses and prove connectivity to the default gateway.",
          requirements: [
            "Directory ~/report exists",
            "File ~/report/gateway.txt exists and contains the default gateway IP",
          ],
          env: "ubuntu:24.04",
          checks: [
            { kind: "directory", path: "/home/learner/report", label: "~/report" },
            { kind: "file", path: "/home/learner/report/gateway.txt", label: "~/report/gateway.txt" },
            { kind: "filecontains", path: "/home/learner/report/gateway.txt", value: "172.17.0.1", label: "gateway.txt names the gateway 172.17.0.1" },
          ],
          steps: [
            {
              title: "Show the network interfaces",
              detail:
                "ip a lists every interface. lo is the loopback (127.0.0.1 — yourself), eth0 is the real interface with this machine's IP: 172.17.0.2/16.",
              command: "ip a",
            },
            {
              title: "Show the routing table",
              detail:
                "ip route shows where packets go. The 'default via' line names the gateway — the router that forwards traffic to the rest of the network. Here: 172.17.0.1.",
              command: "ip route",
            },
            {
              title: "Ping the gateway",
              detail:
                "ping sends ICMP echo requests and waits for replies. 0% packet loss against the gateway proves the local network works.",
              command: "ping 172.17.0.1",
            },
            {
              title: "Ping a hostname",
              detail:
                "ping also accepts hostnames — this exercises DNS before ICMP. lab.internal resolves through /etc/hosts and DNS in this lab.",
              command: "ping lab.internal",
            },
            {
              title: "Record the gateway",
              detail: "Write the gateway IP you found into the report file.",
              command: "echo 'gateway: 172.17.0.1' > ~/report/gateway.txt",
            },
            {
              title: "Verify and submit",
              detail: "cat the file to confirm, then submit.",
              command: "cat ~/report/gateway.txt",
            },
          ],
        },
      ],
    },
    {
      slug: "02-ports-sockets",
      title: "Ports & Sockets",
      summary: "How a single machine serves many services at once.",
      tasks: [
        {
          slug: "net-find-listening-port",
          title: "Find What's Listening on Which Port",
          type: "practice",
          difficulty: "beginner",
          description:
            "'Port 8080 is in use' is a daily incident. Use ss to list listening sockets, find the port the app process listens on and record it.",
          requirements: [
            "Directory ~/report exists",
            "File ~/report/app-port.txt exists and contains the app's listening port",
          ],
          env: "ubuntu:24.04",
          checks: [
            { kind: "directory", path: "/home/learner/report", label: "~/report" },
            { kind: "file", path: "/home/learner/report/app-port.txt", label: "~/report/app-port.txt" },
            { kind: "filecontains", path: "/home/learner/report/app-port.txt", value: "port: 8080", label: "app-port.txt says 'port: 8080'" },
          ],
          steps: [
            {
              title: "List listening TCP sockets",
              detail:
                "ss -tlnp shows: t TCP sockets, l listening only, n numeric ports, p the owning process. Three services are listening on this machine.",
              command: "ss -tlnp",
            },
            {
              title: "Find the app's port",
              detail:
                "Match the Process column to the app. Its local address is *:8080 — meaning it accepts connections on port 8080 on every interface. Port 22 is sshd, 53 is the local DNS resolver.",
              command: "",
            },
            {
              title: "Record the port",
              detail: "Write the port number into the report file.",
              command: "echo 'port: 8080' > ~/report/app-port.txt",
            },
            {
              title: "Verify and submit",
              detail: "cat the file, then submit. The validator checks the recorded port matches the real listener.",
              command: "cat ~/report/app-port.txt",
            },
          ],
        },
      ],
    },
    {
      slug: "03-dns",
      title: "DNS",
      summary: "Names to addresses — the directory service of the internet.",
      tasks: [
        {
          slug: "net-resolve-dns",
          title: "Resolve a Hostname",
          type: "guided",
          difficulty: "beginner",
          description:
            "Before a connection is made, a name becomes an IP. Resolve lab.internal with dig, compare with /etc/hosts and record the answer.",
          requirements: [
            "Directory ~/report exists",
            "File ~/report/dns.txt exists and contains the IP for lab.internal",
          ],
          env: "ubuntu:24.04",
          checks: [
            { kind: "directory", path: "/home/learner/report", label: "~/report" },
            { kind: "file", path: "/home/learner/report/dns.txt", label: "~/report/dns.txt" },
            { kind: "filecontains", path: "/home/learner/report/dns.txt", value: "10.0.0.42", label: "dns.txt contains 10.0.0.42" },
          ],
          steps: [
            {
              title: "Check the resolver configuration",
              detail:
                "cat /etc/resolv.conf shows which DNS servers the system asks — nameserver 127.0.0.53 is the local systemd resolver.",
              command: "cat /etc/resolv.conf",
            },
            {
              title: "Check /etc/hosts",
              detail:
                "Before DNS is queried, the OS checks /etc/hosts. lab.internal → 10.0.0.42 is mapped there — static entries always win.",
              command: "cat /etc/hosts",
            },
            {
              title: "Query DNS with dig",
              detail:
                "dig asks the resolver directly. The ANSWER SECTION shows lab.internal. 300 IN A 10.0.0.42 — an A record mapping the name to an IPv4 address, cached for 300 seconds.",
              command: "dig lab.internal",
            },
            {
              title: "Record the answer",
              detail: "Write the resolved IP into the report file.",
              command: "echo 'lab.internal: 10.0.0.42' > ~/report/dns.txt",
            },
            {
              title: "Verify and submit",
              detail: "cat the file, then submit.",
              command: "cat ~/report/dns.txt",
            },
          ],
        },
      ],
    },
    {
      slug: "04-http",
      title: "HTTP & curl",
      summary: "The protocol every platform ultimately serves.",
      tasks: [
        {
          slug: "net-verify-http",
          title: "Prove a Service Answers HTTP 200",
          type: "challenge",
          difficulty: "intermediate",
          description:
            "Deploy the app image on port 8080 and then prove — with curl, not faith — that it answers HTTP 200. This combines Docker and networking; the validator makes a real request against the port.",
          requirements: [
            "A container from app:latest is running",
            "Port 8080 is mapped",
            "curl against localhost:8080 returns HTTP 200",
          ],
          env: "ubuntu:24.04 + docker",
          checks: [
            { kind: "container", path: "app:latest", label: "container from app:latest running" },
            { kind: "http", port: 8080, label: "HTTP 200 on localhost:8080" },
          ],
          steps: [
            {
              title: "Start the container on port 8080",
              detail:
                "docker run -d -p 8080:80 app:latest starts the app detached and forwards host port 8080 to the container's port 80.",
              command: "docker run -d -p 8080:80 app:latest",
            },
            {
              title: "Confirm the port mapping",
              detail:
                "docker ps should show 0.0.0.0:8080->80/tcp. The left side is the host port curl will hit.",
              command: "docker ps",
            },
            {
              title: "Request the health endpoint",
              detail:
                "curl prints the response. HTTP/1.1 200 OK is the success code — this is what load balancers and Kubernetes probes check.",
              command: "curl http://localhost:8080/health",
            },
            {
              title: "See what failure looks like",
              detail:
                "Optional but valuable: if the container were down, curl would report 'Connection refused'. Recognizing this error message is half of debugging connectivity.",
              command: "curl http://localhost:9999",
            },
            {
              title: "Submit for validation",
              detail:
                "The validator checks the container is running and that the port actually serves — the same thing your curl proved.",
              command: "",
            },
          ],
        },
      ],
    },
  ],
};
