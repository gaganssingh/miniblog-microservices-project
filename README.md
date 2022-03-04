## Mini Blog

A Mini microservices app built using:

- React on the frontend
- Nodejs on the backend
- In memory database

This app server only one purpose: test out docker and kubernetes in development & production. Any code for the app itself is just dummy code, and mush not be used in production. This project just highlights docker & kubernetes usage.

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

### How to create a Kubernetes deployment

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
  kubectl apply -f infra/k8s/posts.yaml
  ```

- Check if the deployment was created:
  ```
  kubectl get deployments
  ```

### How to create a Kubernetes pod:

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

- Create the kubernetes service pod for your service:

  ```
  cd infra/k8s/
  kubectl apply -f posts.yaml
  ```

- Check if the kubernetes pod was successfully created by running `kubectl get pods`

### General kubernetes commands:

- List all pods: `kubectl get pods`
- List all deployments: `kubectl get deployments`
- Generate deployments or pods from inside a folder using a yaml file: `kubectl apply -f <PATH_TO_CONFIG_YAML_FILES>`. Example: `kubectl delete -f infra/k8s/`
- Delete all deployments or pods using config files inside a specific folder: `kubectl delete -f <PATH_TO_CONFIG_YAML_FILES>`. Example: `kubectl delete -f infra/k8s/`
- Delete a single deployment or pod: `kubectl delete pod <POD_NAME>` OR `kubectl delete deployment <DEPLOYMENT_NAME>`
- Start a shell inside a running pod: `kubectl exec -it <POD_NAME> sh`
- Get all logs from a pod: `kubectl logs <POD_NAME>`
- Show information about a running deployment: `kubectl describe deployment <DEPLOYMENT_NAME>`
- Show information about a running pod: `kubectl describe pod <POD_NAME>`
- Restart a deployment (Usefula after re-building a docker image): `kubectl rollout restart deployments <DEPLOYMENT_NAME>`
