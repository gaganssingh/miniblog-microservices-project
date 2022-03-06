## Mini Blog

A Mini microservices app built using:

- React on the frontend
- Nodejs on the backend
- In memory database

This app serves only one purpose: test out docker and kubernetes in development & production. Any code for the app itself is just dummy code, and must not be used in production. This project just highlights docker & kubernetes usage.

### Steps:

1. Build docker images of all services. Example: auth service, posts service, event-bus etc.

```
docker build -t <DOCKER_ID>/<IMAGE NAME> .
```

2. Push the docker image to docker hub.

```
docker push <DOCKER_ID>/<IMAGE NAME>
```

3. Create a kubernetes deployment config for this service.

```
infra/k8s/posts-depl.yaml
```

4. Apply the kubernetes deployment.

```
kubectl apply -f infra/k8s/posts-depl.yaml
kubectl apply -f infra/k8s/comments-depl.yaml
...
```

4. Create a ClusterIP Service that configures networking between all services. Wither append the ClusterIP Service in the service's depl.yaml file:

```
---
apiVersion: v1
kind: Service
...
...
```

Or create a new service file:

```
  posts-srv.yaml
```

5. Apply the kubernetes service along with the previous deployment.

```
kubectl apply -f <PATH TO DIRECTORY WITH yaml FILES>
```

OR specify each file individually

```
kubectl apply -f infra/k8s/posts-depl.yaml
```

AND for the Service config if you created one:

```
kubectl apply -f infra/k8s/posts-srv.yaml
```

6. Replace all `http://localhost:PORT` with `http://<CLUSTER NAME>:PORT`. Example:

```
http://localhost:4005/events
```

TO

```
http://event-bus-srv:4005/events
```

7. Re-deploy the cluster/pods with all changes included using:

   - Re-build all images
   - Push all re-built images to docker hub
   - `kubectl rollout restart deployment <DEPLOYMENT NAME>`

8. A pod can now be accessed if a NodePort service was been defined for it.

### Cluster communication with the outside world:

This project will use [ingress-nginx](https://github.com/kubernetes/ingress-nginx) for outside communication. Ingress-nginx will configure a load-balancer in front of the cluster, which will then be forward any incoming requests to the appropriate ClusterIP services (posts-sev, comments-srv etc.) inside the cluster.

![ingress-nginx flow](/images/ingress-nginx.png)

#### Implementation Steps:

1. Init the service by applying the config file from the official [quick start](https://kubernetes.github.io/ingress-nginx/deploy/#quick-start) guide. The command as of March 05, 2022 is:

```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.1.1/deploy/static/provider/cloud/deploy.yaml
```

2. Create the ingress-nginx config file `ingress-srv.yaml` that tells ingress what port to forward to which service. Example: forward all traffic for port 4000 to the posts service, and all traffic to port 4001 to the comments service, etc.

```
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-srv
  annotations:
    kubernetes.io/ingress.class: nginx
spec:
  rules:
    - host: posts.com
      http:
        paths:
          - path: /posts
            pathType: Prefix
            backend:
              service:
                name: posts-clusterip-srv
                port:
                  number: 4000
```

3. Apply the ingress-nginx config: `kubectl apply -f infra/k8s/ingress-srv.yaml`
4. Update the hosts file on your OS to point to the web address specified for `hosts` field in the ingress-srv.yaml file

```
Windows -> C:\Windows\System32\Drivers\etc\hosts
MacOS -> /etc/hosts

Add the following line at the bottom of the hosts file:
127.0.0.1 posts.com
```

5. Change all urls in the client app to the url specified in the hosts above. Example:

```
localhost:XXXX/posts/create to posts.com/posts/create
```

6. Re-build all pods that have been updated and re-push the images to docker hub.
7. Re-apply the kubernetes config file and check if all pods are running without errors using `kubectl get pods`.
8. Confirm the cluster is working as expected by visiting the hosts url in the web browser. Example: `http://posts.com/`.

---

### Dockering a service:

- At the root of the service that needs dockerizing, create a file named `Dockerfile` without any extension and add the docker config:

  ```
  FROM node:alpine
  WORKDIR /app
  COPY package.json ./
  RUN npm install
  COPY ./ ./
  CMD ["npm", "run", "start"]
  ```

- Build the docker image:
  ```
  cd posts/
  docker build -t therealdarkdev/posts:latest .
  cd ..
  ```
- Confirm the image runs without errors:
  `docker run therealdarkdev/posts`

### How to create a Kubernetes Deployment

- Create a kubernetes-deployment config file in `/infta/k8s/` and name it the same name as the service's name. E.g. `posts-depl.yaml`
- Configure kubernetes deployment:

  ```
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: posts-depl
  spec:
    # How many copies of the pod to run
    replicas: 1
    # Select the pod with the label "app: posts"
    selector:
      matchLabels:
        app: posts
    # Tells kubernetes to create a pod with label "app: posts"
    # which is used in the sector section to ideitify the correct pod
    template:
      metadata:
        labels:
          app: posts
      # Configure the pod
      spec:
        containers:
          - name: posts
            image: delete/posts:latest
            imagePullPolicy: Never
  ```

- Create the kubernetes deployment using the yaml file (this will auto-create all associated pods, and re-create pods if we delete them manually):

  ```
  kubectl apply -f infra/k8s/posts-depl.yaml
  ```

- Check if the deployment was created:
  ```
  kubectl get deployments
  ```

### How to create a ClusterIP Service

To enable cross-pod communtcation (i.e. enable one pod to talk to another pod within a node).

### How to create a NodePort Service

To make a pod accessible from outside the cluster. Usually only used for dev purposes.

- Create a kubernetes-deployment config file in `/infta/k8s/` and name it the same name as the service's name. E.g. `posts-srv.yaml`
- Configure kubernetes service:
  ```
  apiVersion: v1
  kind: Service
  metadata:
    name: posts-srv
  spec:
    type: NodePort
    selector:
      # What pods to expose to the outside
      app: posts
    ports:
      # Port mapping NodePort:Internal-port
      - name: posts
        protocol: TCP
        # From outside we access the NodePort service
        # at this port. This can be anything
        port: 4000
        # Direct reference to the port in app.listen(PORT)
        # NodePort forwards the traffic to this port internally
        targetPort: 4000
  ```
- Create the kubernetes service using the yaml file:

  ```
  kubectl apply -f infra/k8s/posts-srv.yaml
  ```

- Check if the service was created:
  ```
  kubectl get services
  ```
- Access this service at:
  `localhost:3xxxx/posts`
  Note: the full port 3xxxx randomly generated when the service is created. get it by running `kubectl get services`

### How to create a Kubernetes Pod:

- Create a kubernetes config file in `/infta/k8s/` and name it the same name as the service's name. E.g. `posts.yaml`
- Configure kubernetes service:

  ```
  apiVersion: v1
  kind: Pod
  metadata:
    name: posts
  spec:
    containers:
      - name: posts
        image: delete/posts:0.0.1
        imagePullPolicy: Never
  ```

- Create the kubernetes pod for your service:

  ```
  cd infra/k8s/
  kubectl apply -f posts.yaml
  ```

- Check if the kubernetes pod was successfully created by running `kubectl get pods`

### General kubernetes commands:

- List all pods: `kubectl get pods`
- List all deployments: `kubectl get deployments`
- Generate deployments, services or pods from inside a folder using a yaml file: `kubectl apply -f <PATH_TO_CONFIG_YAML_FILES>`. Example: `kubectl delete -f infra/k8s/`
- Delete all deployments, services or pods using config files inside a specific folder: `kubectl delete -f <PATH_TO_CONFIG_YAML_FILES>`. Example: `kubectl delete -f infra/k8s/`
- Delete a single deployment or pod: `kubectl delete pod <POD_NAME>` OR `kubectl delete deployment <DEPLOYMENT_NAME>`
- Start a shell inside a running pod: `kubectl exec -it <POD_NAME> sh`
- Get all logs from a pod: `kubectl logs <POD_NAME>`
- Show information about a running deployment: `kubectl describe deployment <DEPLOYMENT_NAME>`
- Show information about a running service: `kubectl describe service <SERVICE_NAME>`
- Show information about a running pod: `kubectl describe pod <POD_NAME>`
- Restart a deployment (Usefula after re-building a docker image): `kubectl rollout restart deployments <DEPLOYMENT_NAME>`
