---
title: "Sw Journey: Mission 1"
date: 2024-08-06T19:11:50+03:00
draft: true
description: "Software Journey Mission 1"
image: "/images/journey/1.jpg"
imageBig: "/images/journey/1.jpg"
categories: ["journey", "k8s", "kubernetes"]
avatar: "/images/avatar.webp"
---

I'm starting a journey to build random stuff, and apply and practice Backend Engineering, I will go from a Monolithic application to a Microservices exploring and building cool stuff and Proof of Concepts. 🚀💻

## Mission 1

during this week I will discover and learn Kubernetes, and how to deploy a simple application to k8s.

I will build a simple API application with Express and then deploy it to Kubernetes, including a database and Redis cache.

the API will be a **Incantogamus app** a simple CRUD application for video games.

**Incantogamus**: is a whimsical and imaginary word created with a mix of Latin and whimsy, inspired by the magical world of Harry Potter. However, in terms of actual meaning, it doesn't have a specific definition or translation as it's a made-up term. It's intended to evoke a sense of enchantment and mystery, fitting for a magical word related to games in the Harry Potter universe.

### To Do

#### project: https://github.com/civilcoder55/incantogamus

- [x] Create a simple API application with express
![incantogamus](/images/journey/incantogamus-api-example.png " {width='1360', height='720'}")

- [x] Dockerize the application
- [x] Deploy the application to Kubernetes

  - I deployed the application to a Kubernetes cluster on my local machine using minikube. the cluster looks like this:
    
    ![cluster-overview](/images/journey/cluster-overview.png)
  
  - created an ingress to expose the application to the outside world, and made a domain point to the minikube node IP address.
    ![hosts](/images/journey/hosts.png)

  - the application is accessible at `incantogamus.com`
    ![incantogamus](/images/journey/incantogamus-api.png)

- [ ] Discover and play with Kubernetes features
- [x] Learning Helm Charts
  - During this sub-mission, I learned what Helm is and how to use and create Helm Charts.
  - I created a Helm Chart for the Incantogamus application. And I have published it to a Helm Repo hosted on GitHub using GitHub pages and helm releaser.
  - The Helm Chart is accessible at: https://civilcoder55.github.io/learning-helm-charts/
  - updated the application readme to include the Helm Chart usage. https://github.com/civilcoder55/incantogamus

## Mission 2

- [x] Discover Prometheus and Grafana

  - I discovered Prometheus, understanding its functionality and how to use it for monitoring applications. Additionally, I learned about Grafana and how to visualize the metrics collected by Prometheus.
  - I also gained knowledge on creating and using an Exporter to gather metrics from an application and expose them to Prometheus.

- [x] Collect and Visualize Asterisk Metrics

  - I collected metrics from an Asterisk server using the Asterisk `res_prometheus` module and exposed them to Prometheus.
  - I visualized these metrics using a simple Grafana dashboard.
  - Additionally, I used `node_exporter` to collect metrics from the Asterisk server node.

  ![incantogamus](/images/journey/prom-1.png)

  ![incantogamus](/images/journey/prom-2.png)

  ![incantogamus](/images/journey/prom-3.png)

- [ ] Collect K8s Cluster Metrics Using Prometheus
- [ ] Visualize the Metrics Using Grafana
- [ ] Create Alerts using Prometheus Alertmanager
