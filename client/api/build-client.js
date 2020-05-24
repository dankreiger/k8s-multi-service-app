import axios from 'axios';

export default ({ req }) => {
  if (typeof window === 'undefined') {
    // we are on server
    return axios.create({
      baseURL:
        'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req.headers,
    });
  } else {
    // we are on browser
    return axios.create({
      baseURL: '/',
    });
  }
};

/**
 * Some notes on url format
 *
 *
 * server requests should be made to http://ingress-nginx.ingress-nginx...dlkdlkm inside k8s cluster
 * e.g.
 *  const { data } = await axios.get('http://SERVICENAME.NAMESPACE.svc.cluster.local')
 *
 *
 * get namespace (NAMESPACE):
 *  - kubectl get namespace
 * then get service (SERVICENAME):
 *  - kubectl get services -n NAMESPACE
 */
