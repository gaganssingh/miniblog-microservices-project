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

- Show a list of all pods: `kubectl get pods`
- Generate pods from inside a folder using a yaml file: `kubectl apply -f <PATH_TO_POD_CONFIG_YAML_FILES>`. Example: `kubectl delete -f infra/k8s/`
- Delete a pod inside a specific folder: `kubectl delete -f <PATH_TO_POD_CONFIG_YAML_FILES>`. Example: `kubectl delete -f infra/k8s/`
- Start a shell inside a running pod: `kubectl exec -it <POD_NAME> sh`
- Get all logs from a pod: `kubectl logs <POD_NAME>`
- Show information about a running pod: `kubectl describe pod <POD_NAME>`
