window.CKAD_TOPIC = {
  "slug": "helm",
  "title": "Helm",
  "weight": null,
  "preamble": [
    {
      "type": "text",
      "html": "- Note: Helm is part of the new CKAD syllabus. Here are a few examples of using Helm to manage Kubernetes."
    }
  ],
  "sections": [
    {
      "heading": "Helm in K8s",
      "id": "helm-in-k8s",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-0",
          "question": "Creating a basic Helm chart",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "helm create weather ## this would create a new chart skeleton named weather"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-1",
          "question": "Running a Helm chart",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "helm install -f myvalues.yaml forecast ./weather"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-2",
          "question": "Find pending Helm deployments on all namespaces",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "helm list --pending -A"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-3",
          "question": "Uninstall a Helm release",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "helm uninstall -n ops forecast"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-4",
          "question": "Upgrading a Helm chart",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "helm upgrade -f myvalues.yaml -f override.yaml forecast ./weather"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-5",
          "question": "Using Helm repo",
          "setup": [],
          "answer": [
            {
              "type": "text",
              "html": "Add, list, remove, update and index chart repos"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "helm repo add [NAME] [URL]  [flags]\nhelm repo list / helm repo ls\nhelm repo remove [REPO1] [flags]\nhelm repo update / helm repo up\nhelm repo update [REPO1] [flags]\nhelm repo index [DIR] [flags]"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-6",
          "question": "Download a Helm chart from a repository",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "helm pull [chart URL | repo/chartname] [...] [flags] ## this would download a chart, not install it\nhelm pull --untar repo/chartname # untar the chart after downloading it "
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-7",
          "question": "Add the Bitnami repo at https://charts.bitnami.com/bitnami to Helm",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "helm repo add bitnami https://charts.bitnami.com/bitnami"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-8",
          "question": "Write the contents of the values.yaml file of the <code>bitnami/node</code> chart to standard output",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "helm show values bitnami/node"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-9",
          "question": "Install the <code>bitnami/node</code> chart setting the number of replicas to 5",
          "setup": [],
          "answer": [
            {
              "type": "text",
              "html": "To achieve this, we need two key pieces of information:"
            },
            {
              "type": "list",
              "items": [
                "A simple way to set the value of this attribute during installation"
              ]
            },
            {
              "type": "text",
              "html": "To identify the name of the attribute in the values.yaml file, we could get all the values, as in the previous task, and then grep to find attributes matching the pattern <code>replica</code>"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "helm show values bitnami/node | grep -i replica"
            },
            {
              "type": "text",
              "html": "which returns"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "## @param replicaCount Specify the number of replicas for the application\nreplicaCount: 1"
            },
            {
              "type": "text",
              "html": "We can use the <code>--set</code> argument during installation to override attribute values. Hence, to set the replica count to 5, we need to run"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "helm install forecast bitnami/node --set replicaCount=5"
            },
            {
              "type": "quote",
              "html": "<strong>Cluster/pull pitfall.</strong> This chart (pinned to old <code>debian-11-r*</code> tags) pulls a <code>bitnami/git</code> <strong>init container</strong> (<code>git-clone-repository</code>) plus a <code>bitnami/mongodb</code> dependency. Those old tags have been removed from Docker Hub (Bitnami now ships <code>sha256-…</code>-style tags), so on a cluster with no registry access the install can fail with <code>ImagePullBackOff</code>/<code>ErrImagePull</code> on the init container — the release deploys but never becomes Ready. To verify the helm mechanics alone, <code>helm template forecast bitnami/node --set replicaCount=5</code> still renders the 5-replica Deployment (that's what the exam checks); only the running install needs the images."
            }
          ]
        }
      ]
    }
  ],
  "count": 10,
  "description": "Charts and repositories.",
  "file": "h.helm.md"
};
