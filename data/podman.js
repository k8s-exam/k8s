window.CKAD_TOPIC = {
  "slug": "podman",
  "title": "Podman",
  "weight": null,
  "preamble": [
    {
      "type": "ref",
      "html": "- Note: The topic is part of the new CKAD syllabus. Here are a few examples of using <strong>podman</strong> to manage the life cycle of container images. The use of <strong>docker</strong> had been the industry standard for many years, but now large companies like <a href=\"https://www.redhat.com/en/blog/say-hello-buildah-podman-and-skopeo\" target=\"_blank\" rel=\"noopener\">Red Hat</a> are moving to a new suite of open source tools: podman, skopeo and buildah. Also Kubernetes has moved in this <a href=\"https://kubernetes.io/blog/2022/02/17/dockershim-faq/\" target=\"_blank\" rel=\"noopener\">direction</a>. In particular, <code>podman</code> is meant to be the replacement of the <code>docker</code> command: so it makes sense to get familiar with it, although they are quite interchangeable considering that they use the same syntax."
    }
  ],
  "sections": [
    {
      "heading": "Podman basics",
      "id": "podman-basics",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-0",
          "question": "Create a Dockerfile to deploy an Apache HTTP Server which hosts a custom main page",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "Dockerfile",
              "code": "FROM httpd:2.4\nRUN echo \"Hello from Podman!\" > /usr/local/apache2/htdocs/index.html"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-1",
          "question": "Build and see how many layers the image consists of",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": ":~$ podman build -t welcome .\nSTEP 1/2: FROM httpd:2.4\nSTEP 2/2: RUN echo \"Hello from Podman!\" > /usr/local/apache2/htdocs/index.html\nCOMMIT welcome\n--> ef4b14a72d0\nSuccessfully tagged localhost/welcome:latest\nef4b14a72d02ae0577eb0632d084c057777725c279e12ccf5b0c6e4ff5fd598b\n:~$ podman images\nREPOSITORY               TAG         IMAGE ID      CREATED        SIZE\nlocalhost/welcome        latest      ef4b14a72d02  8 seconds ago  148 MB\ndocker.io/library/httpd  2.4         98f93cd0ec3b  7 days ago     148 MB\n:~$ podman image tree localhost/welcome:latest\nImage ID: ef4b14a72d02\nTags:     [localhost/welcome:latest]\nSize:     147.8MB\nImage Layers\n├── ID: ad6562704f37 Size:  83.9MB\n├── ID: c234616e1912 Size: 3.072kB\n├── ID: c23a797b2d04 Size: 2.721MB\n├── ID: ede2e092faf0 Size: 61.11MB\n├── ID: 971c2cdf3872 Size: 3.584kB Top Layer of: [docker.io/library/httpd:2.4]\n└── ID: 61644e82ef1f Size: 6.144kB Top Layer of: [localhost/welcome:latest]"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-2",
          "question": "Run the image locally, inspect its status and logs, finally test that it responds as expected",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": ":~$ podman run -d --name site -p 8080:80 localhost/welcome\n2f3d7d613ea6ba19703811d30704d4025123c7302ff6fa295affc9bd30e532f8\n:~$ podman ps\nCONTAINER ID  IMAGE                     COMMAND           CREATED        STATUS            PORTS                 NAMES\n2f3d7d613ea6  localhost/welcome:latest  httpd-foreground  5 seconds ago  Up 6 seconds ago  0.0.0.0:8080->80/tcp  site\n:~$ podman logs site\nAH00558: httpd: Could not reliably determine the server's fully qualified domain name, using 10.0.2.100. Set the 'ServerName' directive globally to suppress this message\nAH00558: httpd: Could not reliably determine the server's fully qualified domain name, using 10.0.2.100. Set the 'ServerName' directive globally to suppress this message\n[Sat Jun 04 16:15:38.071377 2022] [mpm_event:notice] [pid 1:tid 139756978220352] AH00489: Apache/2.4.53 (Unix) configured -- resuming normal operations\n[Sat Jun 04 16:15:38.073570 2022] [core:notice] [pid 1:tid 139756978220352] AH00094: Command line: 'httpd -D FOREGROUND'\n:~$ curl 0.0.0.0:8080\nHello from Podman!"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-3",
          "question": "Run a command inside the pod to print out the index.html file",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": ":~$ podman exec -it site cat /usr/local/apache2/htdocs/index.html\nHello from Podman!"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-4",
          "question": "Tag the image with ip and port of a private local registry and then push the image to this registry",
          "setup": [],
          "answer": [
            {
              "type": "quote",
              "html": "Note: Some small distributions of Kubernetes (such as <a href=\"https://microk8s.io/docs/registry-built-in\" target=\"_blank\" rel=\"noopener\">microk8s</a>) have a built-in registry you can use for this exercise. If this is not your case, you'll have to setup it on your own."
            },
            {
              "type": "code",
              "language": "bash",
              "code": ":~$ podman tag localhost/welcome $registry_ip:5000/welcome\n# plain-HTTP (insecure) registry: pass --tls-verify=false (or configure\n# $registry_ip:5000 under [registries.insecure] in /etc/containers/registries.conf)\n# or podman will refuse with \"server gave HTTP response to HTTPS client\"\n:~$ podman push --tls-verify=false $registry_ip:5000/welcome"
            }
          ]
        },
        {
          "type": "text",
          "html": "&gt; <strong>Podman auth for <code>pull</code>/<code>push</code>.</strong> Podman stores registry credentials in <code>$HOME/.config/containers/auth.json</code> (this is the file <code>kubectl</code> reads for private-registry pulls as <code>--image-pull-secret</code>; on macOS/podman-machine the Podman-created default machine may not be able to see that host path). Use <code>podman login --tls-verify=false $registry_ip:5000</code> (optionally <code>--authfile /path/to/auth.json</code>) before a pull/push if the registry requires auth. Unlike Docker, Podman <strong>never</strong> sends the daemon-stored auth by default — you must log in or point <code>--authfile</code> at an explicit file."
        },
        {
          "type": "exercise",
          "id": "ex-5",
          "question": "Verify that the registry contains the pushed image and that you can pull it",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": ":~$ curl http://$registry_ip:5000/v2/_catalog\n{\"repositories\":[\"welcome\"]}\n# remove the image already present\n:~$ podman rmi $registry_ip:5000/welcome\n:~$ podman pull --tls-verify=false $registry_ip:5000/welcome\nTrying to pull 10.152.183.13:5000/welcome:latest...\nGetting image source signatures\nCopying blob 643ea8c2c185 skipped: already exists\nCopying blob 972107ece720 skipped: already exists\nCopying blob 9857eeea6120 skipped: already exists\nCopying blob 93859aa62dbd skipped: already exists\nCopying blob 8e47efbf2b7e skipped: already exists\nCopying blob 42e0f5a91e40 skipped: already exists\nCopying config ef4b14a72d done\nWriting manifest to image destination\nStoring signatures\nef4b14a72d02ae0577eb0632d084c057777725c279e12ccf5b0c6e4ff5fd598b"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-6",
          "question": "Create a container without running/starting it",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": ":~$ podman create busybox # create\nResolved \"busybox\" as an alias (/etc/containers/registries.conf.d/000-shortnames.conf)\nTrying to pull docker.io/library/busybox:latest...\nGetting image source signatures\nCopying blob sha256:213a27df5921cd9ae24732504c590bb6408911c20fb50a597f2a40896d554a8f\nCopying config sha256:3fba0c87fcc8ba126bf99e4ee205b43c91ffc6b15bb052315312e71bc6296551\nWriting manifest to image destination\n51b613406e8889213c176523e1c430e4bd00047965b0c22cff5b1c9badfbc452\n:~$ podman container ls -a\nCONTAINER ID  IMAGE                             COMMAND     CREATED        STATUS      PORTS       NAMES\n51b613406e88  docker.io/library/busybox:latest  sh          2 minutes ago  Created                 priceless_hopper"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-7",
          "question": "Export a container to output.tar file",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": ":~$ podman container ls -a # pick the container id\nCONTAINER ID  IMAGE                             COMMAND     CREATED        STATUS      PORTS       NAMES\n51b613406e88  docker.io/library/busybox:latest  sh          2 minutes ago  Created                 priceless_hopper\n:~$ podman export <container id> --output=output.tar\n:~$ ls -al output.tar\n-rw-r--r--@ 1 user  wheel  4272640 28 Aug 13:48 output.tar"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-8",
          "question": "Run a pod with the image pushed to the registry",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": ":~$ kubectl run welcome --image=$registry_ip:5000/welcome --port=80\n:~$ curl $(kubectl get pods welcome -o jsonpath='{.status.podIP}')\nHello from Podman!"
            },
            {
              "type": "quote",
              "html": "Note: for the pod to actually pull from the plain-HTTP registry, the cluster's container runtime must trust it too — add <code>$registry_ip:5000</code> under <code>[registries.insecure]</code> in <code>/etc/containers/registries.conf</code> (CRI-O) or the equivalent containerd <code>config.toml</code> mirrors entry, otherwise the kubelet reports <code>ErrImagePull: server gave HTTP response to HTTPS client</code>."
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-9",
          "question": "Log into a remote registry server and then read the credentials from the default file",
          "setup": [],
          "answer": [
            {
              "type": "quote",
              "html": "Note: The two most used container registry servers with a free plan are <a href=\"https://hub.docker.com/\" target=\"_blank\" rel=\"noopener\">DockerHub</a> and <a href=\"https://quay.io/\" target=\"_blank\" rel=\"noopener\">Quay.io</a>."
            },
            {
              "type": "code",
              "language": "bash",
              "code": ":~$ podman login --username $YOUR_USER --password $YOUR_PWD docker.io\n:~$ cat ~/.config/containers/auth.json\n{\n        \"auths\": {\n                \"docker.io\": {\n                        \"auth\": \"Z2l1bGl0JLSGtvbkxCcX1xb617251xh0x3zaUd4QW45Q3JuV3RDOTc=\"\n                }\n        }\n}"
            },
            {
              "type": "quote",
              "html": "Note: Podman writes registry credentials to <code>$HOME/.config/containers/auth.json</code> (not <code>$XDG_RUNTIME_DIR</code>). This is the same file <code>kubectl create secret docker-registry --from-file=.dockerconfigjson=~/.config/containers/auth.json</code> (or Docker's <code>$HOME/.docker/config.json</code>) reads for private-registry image pulls."
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-10",
          "question": "Create a secret both from existing login credentials and from the CLI",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": ":~$ kubectl create secret generic docker-creds --from-file=.dockerconfigjson=${XDG_RUNTIME_DIR}/containers/auth.json --type=kubernetes.io/dockerconfigjson\nsecret/docker-creds created\n:~$ kubectl create secret docker-registry registry-login --docker-server=https://index.docker.io/v1/ --docker-username=$YOUR_USR --docker-password=$YOUR_PWD\nsecret/registry-login created"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-11",
          "question": "Create the manifest for a Pod that uses one of the two secrets just created to pull an image hosted on the relative private remote registry",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "yaml",
              "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: registry-app\nspec:\n  containers:\n  - name: registry-app-container\n    image: $YOUR_PRIVATE_IMAGE\n  imagePullSecrets:\n  - name: docker-creds"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-12",
          "question": "Clean up all the images and containers",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": ":~$ podman rm --all --force\n:~$ podman rmi --all\n:~$ kubectl delete pod welcome"
            }
          ]
        }
      ]
    }
  ],
  "count": 13,
  "description": "Build and modify container images.",
  "file": "j.podman.md"
};
