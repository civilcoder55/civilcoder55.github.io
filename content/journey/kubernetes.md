---
title: "My Journey: K8s and Helm"
date: 2024-08-05T19:11:50+03:00
draft: false
description: "Discovering Kubernetes and Helm Charts"
image: "/images/journey/k8s.png"
imageBig: "/images/journey/k8s.png"
categories: ["journey", "k8s", "kubernetes", "helm", "helm-charts", "docker"]
avatar: "/images/avatar.webp"
---

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


