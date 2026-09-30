# Despliegue en Kubernetes (Minikube)

## Requisitos
- `docker-compose` con todas las imágenes ya construidas (`docker compose build`).
- `minikube` y `kubectl` instalados.

## Pasos

```bash
# 1. Levantar el cluster local
minikube start --driver=docker --cpus=4 --memory=6144
minikube addons enable ingress

# 2. Cargar las imagenes propias (minikube tiene su propio motor de
#    contenedores, separado del de Docker Desktop - no ve las imagenes
#    que ya construiste con docker-compose a menos que se las cargues)
for img in auth-server catalog-api config-server eureka-server gateway order-api; do
  minikube image load "microservices-lab-$img:latest"
done

# 3. Aplicar los manifiestos
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/

# 4. Comprobar que todo esta arriba
kubectl get pods -n microservices-lab

# 5. Exponer gateway y auth-server en los mismos puertos que ya usa el
#    frontend (localhost:8082 y localhost:9000) - asi el frontend Angular
#    funciona sin ningun cambio de configuracion
kubectl port-forward -n microservices-lab svc/gateway 8082:8082 &
kubectl port-forward -n microservices-lab svc/auth-server 9000:9000 &
```

**Importante si tienes el `docker-compose` corriendo a la vez**: publica los mismos puertos en el
host (8082, 9000, 8761...) que estos `port-forward`. Para evitar ambigüedad sobre a cuál le estás
hablando, para uno de los dos (`docker compose stop` o `kubectl port-forward` distinto) antes de
probar.

## Por qué casi no hubo que tocar la configuración de las apps

Como `docker-compose.yml` ya usaba nombres de contenedor (`catalog-db`, `kafka`, `eureka-server`...)
en vez de IPs para que los servicios se encontraran entre sí, y Kubernetes también resuelve por
nombre de `Service` vía su propio DNS interno, las mismas variables de entorno (`SPRING_DATASOURCE_URL=jdbc:postgresql://catalog-db:5432/...`, etc.) funcionan sin cambios. Migrar
"de verdad" fue sobre todo traducir cada servicio de `docker-compose.yml` a un par
`Deployment`+`Service` homónimo.

## Los dos bugs de red que solo aparecen en Kubernetes (ver `04-kafka.yaml`)

1. **No puedes hacer *bind* a la IP virtual de tu propio Service.** En `docker-compose`, el nombre
   de un contenedor resuelve a su propia IP real — bindear un listener ahí funciona. En
   Kubernetes, el nombre de un `Service` resuelve a una IP virtual gestionada por `kube-proxy`, que
   no existe como interfaz real dentro del Pod. Hay que escuchar en `0.0.0.0` y dejar que
   `ADVERTISED_LISTENERS` (lo que ven los *clientes*) siga usando el nombre del `Service`.
2. ***Hairpin NAT***: un Pod conectando a la IP virtual de su propio `Service` no siempre funciona
   bien, según la red del clúster. Para un proceso de un solo nodo que necesita "hablar consigo
   mismo" (el *controller* de Kafka en modo KRaft), usar `localhost` en vez del nombre del
   `Service` evita el problema por completo.

## Comandos útiles para explorar

```bash
kubectl get pods -n microservices-lab
kubectl logs -n microservices-lab deployment/catalog-api -f
kubectl delete pod -n microservices-lab -l app=catalog-api   # self-healing: se recrea solo
kubectl scale deployment/catalog-api -n microservices-lab --replicas=2
kubectl rollout restart deployment/gateway -n microservices-lab  # rolling update sin downtime
```
