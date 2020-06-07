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

Add `JWT_KEY` used in `auth-depl.yaml`

```sh
$ kubectl create secret generic jwt-secret --from-literal=JWT_KEY=somesecret
```

---

To bypass chrome security warning, type `thisisunsafe` in browser.

---

If changes in browser do not show, delete client pod and let it regenerate:

```sh
$ kubectl get pods # copy pod name
$ kubectl delete pod POD_NAME
```

---

If there is no connection, run `kubectl get pods -n ingress-nginx` to see if ingress nginx has a running pod.

If not, reinstall: https://kubernetes.github.io/ingress-nginx/deploy/#docker-for-mac
