### k8s multi-service app

app is called "ticketing"

Prerequistes:

- docker
- k8s
- [install](https://kubernetes.github.io/ingress-nginx/deploy/#docker-for-mac) NGINX ingress controller:

```sh
$ skaffold dev
```

To setup locally, add urls `ticketing.dev` to `/etc/hosts`

```
# /etc/hosts
127.0.0.1 ticketing.dev
```
