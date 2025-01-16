# Dockerize Identus

This Docker Compose setup includes five containers with the following names:

- `identus-docker-cloud-agent-1`
- `identus-docker-mongo-1`
- `identus-docker-prism-node-1`
- `identus-docker-db-1`
- `identus-docker-identus-mediator-1`

## Useful Commands

### Start the Identus

- `docker compose up` - Starts the containers and creates any necessary volumes.
- `docker compose up -d` - Starts the containers in the background and creates any necessary volumes.

### Stop the Identus

- `docker compose stop` - Stops the containers.
- `docker compose down` - Removes the containers.
- `docker compose down -v` - Removes the containers and deletes the volumes (all data in the database will be lost).

### Inspect Containers

- `docker ps -a` - Shows all containers.

## Network

This Docker Compose setup creates a default network in bridge mode to the host machine, called `identus-docker_default`. It binds ports `8080`, `8085` and `8090` to the host machine, making them accessible externally.

All other services are not exposed directly to the host. For example, the Cloud Agent service communicates directly with the PRISM node within this internal network.

To access the Cloud Agent REST API and the DIDComm endpoint, use the open ports on the host machine. Note that name resolution is crucial for DIDComm to function correctly.

### Name Resolution to IP

The name `cloud-agent` is also the hostname of the Cloud Agent's Docker instance. However, from outside the Docker network (on the host machine), the name `cloud-agent` is not resolvable.

We use that hostname for Out-of-Band (OOB) invitations and other tasks by configuring environment variables as follows:

```
DIDCOMM_SERVICE_URL: http://cloud-agent:8090
REST_SERVICE_URL: http://cloud-agent:8085
```

The same applies to the Identus Mediator, using the following environment variable:

```
SERVICE_ENDPOINTS=http://identus-mediator:8080;ws://identus-mediator:8080/ws
```

---

### **IMPORTANT NOTE**

To use the OOB invitation, the names must be resolvable. If you are running or developing an application on the host machine, it's necessary to define those names. The easiest way to achieve this is by adding entries to the `/etc/hosts` file, like so:

```
127.0.0.1	localhost cloud-agent identus-mediator
```

### Ports

This Docker image will only open three ports:

- `8080` - Mediator: DIDComm endpoint.
- `8085` - Cloud Agent: API endpoint for the Agent API.
- `8090` - Cloud Agent: DIDComm endpoint.

The port `8085` should not be publicly accessible.

### Considerations for Other Network Drivers

Other Docker network drivers, like `macvlan`, could be useful for running multiple instances for testing purposes, making them appear as different machines on your local network. However, these drivers are not supported on Docker Desktop for Mac and Windows.

## Troubleshoot

### Mac M4 / Docker / Java Bug - (No Java detected)

If you see the following message `No java installations was detected.` when starting docker compose on a Mac with the M4 CPU. There is a problem and a workaround for it.
For more information check the [issues](https://github.com/hyperledger/identus-cloud-agent/issues/1482)

The workaround is to disable CPU's vector extensions. So we need to create a new docker image based on the previous one.
We do that on the [Dockerfile](./identus-docker/cloud-agent-M4-workaround/Dockerfile) (for version 1.40.0) where we hard-code the workaround.

So on your docker compose file [docker-compose.yaml](identus-docker/docker-compose.yaml) you need to use the new image we just created.
By changing the following:

- From
  ```
    image: docker.io/identus/identus-cloud-agent:1.40.0
    # build: ./cloud-agent-M4-workaround
  ```
- To
  ```
    # image: docker.io/identus/identus-cloud-agent:1.40.0
    build: ./cloud-agent-M4-workaround
  ```

We recommended way of running docker compose `docker compose up --build --remove-orphans --force-recreate` (just to be extra sure there is no confusion with caches)
