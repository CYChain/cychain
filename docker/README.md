# Quick Start

> Note: To run docker you need start docker service.

**Build a local docker image**

```shell
> cd java-cychain/docker
> docker build -t cychain-test .
```

**Run built image（refer to the home page）**

```shell
> docker run -it cychain-test
> ./gradlew run -Pserver=true
```