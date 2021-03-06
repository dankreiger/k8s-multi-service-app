# k8s multi-service app

app is called "ticketing"

## Prerequistes

- node v14
- docker
- k8s
- [install](https://kubernetes.github.io/ingress-nginx/deploy/#docker-for-mac) NGINX ingress controller:
- [skaffold](https://skaffold.dev/)

To setup locally, add urls `ticketing.dev` to `/etc/hosts`

```sh
# /etc/hosts
127.0.0.1 ticketing.dev
```

Add `JWT_KEY` used in `auth-depl.yaml`

```sh
kubectl create secret generic jwt-secret --from-literal=JWT_KEY=somesecret
```

Add `STRIPE_KEY` used in `payments-depl.yaml`

```sh
kubectl create secret generic stripe-secret --from-literal=STRIPE_KEY=somesecret
```

Add `STRIPE_PUBLISHABLE_KEY` used in `client-depl.yaml`

```sh
kubectl create secret generic stripe-publishable-key --from-literal=STRIPE_PUBLISHABLE_KEY=somesecret
```

---

To bypass chrome security warning, type `thisisunsafe` in browser.

---

If changes in browser do not show, delete client pod and let it regenerate:

```sh
kubectl get pods # copy pod name
kubectl delete pod POD_NAME
```

---

If there is no connection, run `kubectl get pods -n ingress-nginx` to see if ingress nginx has a running pod.

If not, [reinstall](https://kubernetes.github.io/ingress-nginx/deploy/#docker-for-mac)

---

## Getting Started

```sh
# install happens in docker containers
npm run dev
```

### Note

To cleanup all resources:

```sh
npm run clean
```

[cleanup](https://skaffold.dev/docs/pipeline-stages/cleanup/)
