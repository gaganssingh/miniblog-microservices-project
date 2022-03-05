## Mini Blog

A Mini microservices app built using:

- React on the frontend
- Nodejs on the backend
- In memory database

This app serves only one purpose: test out docker and kubernetes in development & production. Any code for the app itself is just dummy code, and must not be used in production. This project just highlights docker & kubernetes usage.

### Steps:

1. Build a docker image of the service. Example: auth service, posts service, event-bus etc.

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
kubectl apply -f infra/k8s/posts-depl.yaml
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
