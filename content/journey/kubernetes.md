---
title: "My Journey: K8s and Helm"
date: 2024-08-05T19:11:50+03:00
draft: false
description: "Mission 1: deploying an Express API with MySQL and Redis to a minikube cluster, exposing it through an ingress, and packaging it as a Helm chart."
topics: ["Journey", "Kubernetes", "Helm", "Docker"]
series: "My Software Journey"
thumbnail: "/images/journey/k8s.png"
avatar: "/images/avatar.webp"
---

## Mission 1

During this week, I will discover and learn Kubernetes, and how to deploy a simple application to k8s.

I will build a simple API application with Express and then deploy it to Kubernetes, including a database and Redis cache.

The API will be an **Incantogamus app**, a simple CRUD application for video games.

**Incantogamus** is a whimsical and imaginary word created with a mix of Latin and whimsy, inspired by the magical world of Harry Potter. However, in terms of actual meaning, it doesn't have a specific definition or translation as it's a made-up term. It's intended to evoke a sense of enchantment and mystery, fitting for a magical word related to games in the Harry Potter universe.

### To Do

**Project:** <https://github.com/civilcoder55/incantogamus>

- [x] Create a simple API application with Express

  ![Postman request listing games from the Incantogamus API as JSON](/images/journey/incantogamus-api-example.png)

- [x] Dockerize the application
- [x] Deploy the application to Kubernetes
  - I deployed the application to a Kubernetes cluster on my local machine using minikube. The cluster looks like this:

    ![Minikube cluster graph with API, MySQL, and Redis deployments, their services and volumes, and the ingress](/images/journey/cluster-overview.png)

  - Created an ingress to expose the application to the outside world, and made a domain point to the minikube node IP address.

    ![The /etc/hosts file mapping 192.168.49.2 to incantogamus.com](/images/journey/hosts.png)

  - The application is accessible at `incantogamus.com`.

    ![Insomnia GET request to incantogamus.com/health returning 200 OK](/images/journey/incantogamus-api.png)

- [ ] Discover and play with Kubernetes features
- [x] Learning Helm Charts
  - During this sub-mission, I learned what Helm is and how to use and create Helm Charts.
  - I created a Helm Chart for the Incantogamus application. I have published it to a Helm Repo hosted on GitHub using GitHub Pages and Helm releaser.
  - The Helm Chart is accessible at: <https://civilcoder55.github.io/learning-helm-charts/>
  - Updated the application README to include the Helm Chart usage: <https://github.com/civilcoder55/incantogamus>
