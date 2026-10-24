---
title: "My Journey: Prometheus and Grafana"
date: 2024-08-06T19:11:50+03:00
draft: false
description: "Mission 2: monitoring an Asterisk server with Prometheus, the res_prometheus module, and node_exporter, then visualizing the metrics in Grafana."
topics: ["Journey", "Prometheus", "Grafana", "Monitoring", "Metrics", "Asterisk", "Observability", "Dashboard"]
series: "My Software Journey"
thumbnail: "/images/journey/prom.webp"
avatar: "/images/avatar.webp"
---

## Mission 2

- [x] Discover Prometheus and Grafana
  - I discovered Prometheus, understanding its functionality and how to use it for monitoring applications. Additionally, I learned about Grafana and how to visualize the metrics collected by Prometheus.
  - I also gained knowledge on creating and using an Exporter to gather metrics from an application and expose them to Prometheus.

- [x] Collect and Visualize Asterisk Metrics
  - I collected metrics from an Asterisk server using the Asterisk `res_prometheus` module and exposed them to Prometheus.
  - I visualized these metrics using a simple Grafana dashboard.
  - Additionally, I used `node_exporter` to collect metrics from the Asterisk server node.

    ![Prometheus targets page with the Asterisk, node exporter, and Prometheus jobs all up](/images/journey/prom-1.png)

    ![Grafana dashboard showing Asterisk endpoints, channels, active calls, and uptime](/images/journey/prom-2.png)

    ![Grafana node exporter panels for CPU, memory, network traffic, and disk usage](/images/journey/prom-3.png)

- [ ] Collect K8s Cluster Metrics Using Prometheus
- [ ] Visualize the Metrics Using Grafana
- [ ] Create Alerts using Prometheus Alertmanager
