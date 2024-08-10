---
title: "Managing Authorization in Microservices "
date: 2024-08-09T20:11:50+03:00
draft: false
description: "Discovering a way to manage authorization and permissions in microservices architecture using authorization-as-a-service 🔐."
image: "/images/journey/auth-as-service.png"
imageBig: "/images/journey/auth-as-service.png"
categories:
  ["journey", "authorization", "permissions", "permify", "microservices"]
avatar: "/images/avatar.webp"
---

## Authorizations in Microservices

When developing a monolithic application, managing authorizations and permissions is a bit easier since you have a single point of control for all authorizations and permissions. However, with the rise of microservices, this task becomes more complex.

In a microservices architecture, each service typically has its own database and logic for handling permissions. This can lead to duplication and inconsistency in how permissions are managed across services. Additionally, sharing permissions between services can become problematic.

One way to solve this issue is by using **Authorization-as-a-Service** 🔐. This approach involves creating a separate service dedicated to managing all authorizations for the various services within your architecture. This centralizes control, ensuring consistency and simplifying the management of permissions across your microservices. 🌐


### Proof of Concept (POC) 🚀

Today I will do a quick proof of concept. I will use an open source that provide this functionality, there are a lot, 

Today, I'll do a quick proof of concept (POC) to explore authorization management. I'll use an open-source solution that provides this functionality

there are plenty of options available.

#### Some of Open-Source solutions 🛠️
- perimfy
- openfga
- casbin
- topaz

#### Cloud solutions ☁️
- there are good cloud solutions like [Permit.io](https://www.permit.io)

For today's POC, I'll be using [Permify](https://permify.co/). ✅

![permify](https://user-images.githubusercontent.com/34595361/196884110-147862c9-3657-4f07-831c-3e0d0e39eccf.png)
---

1. Run the permify service on docker and expose HTTP and GRPC ports.

![step](/images/journey/auth-1.png)
---

2. Created a new tenant at permify to store our policies

![step](/images/journey/auth-2.png)
---

3. Created our schema, using the traditional RBAC model for simplicity 🔧. However, in real-world, complex applications, there are many models designed to handle complex use cases.

In fact, **Permify** is considered as fine-grained access control service, inspired by `Google’s Zanzibar`. 🌐 This allows for more detailed and flexible permission management, making it suitable for more complex scenarios.

  **Permify** has a great article about their solution [Here](https://docs.permify.co/permify-overview/authorization-service)

![step](/images/journey/auth-3.png)
---
![step](/images/journey/auth-4.png)
---

4. Attached roles to our users

![step](/images/journey/auth-5.png)
---

5. Created a simple nodejs services to test check user permissions using GRPC via permify sdk.

![step](/images/journey/auth-6.png)
---
![step](/images/journey/auth-7.png)
---

6. Created a wrapper to check user permissions.

![step](/images/journey/auth-8.png)
---

7. Final Test

![step](/images/journey/auth-9.png)
---