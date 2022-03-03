## Mini Blog

A Mini microservices app built using:

- React on the frontend
- Nodejs on the backend
- In memory database

This app server only one purpose: test out docker and kubernetes in development & production. Any code for the app itself is just dummy code, and mush not be used in production. This project just highlights docker & kubernetes usage.

### How to create a Kubernetes pod:

- Build a docker image:
  ```
  cd posts/
  docker build -t therealdarkdev/posts .
  cd ..
  ```
- Confirm the image runs without errors:
  `docker run therealdarkdev/posts`
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

- `kubectl get pods`
- `kubectl delete -f <path to pod configuration files>` Example: `kubectl delete -f infra/k8s/`
