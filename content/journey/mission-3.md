---
title: "Managing authorizations in microservices."
date: 2024-08-09T20:11:50+03:00
draft: false
description: "Discovering a way to manage authorizations and permissions in a microservices architecture using authorizations-as-service."
image: "/images/journey/auth-as-service.png"
imageBig: "/images/journey/auth-as-service.png"
categories:
  ["journey", "authorization", "permissions", "permify", "microservices"]
avatar: "/images/avatar.webp"
---

## Authorizations in Microservices

While developing a monolithic application, managing authorizations and permissions is a bit easier, as you can have a single point of control for all the authorizations and permissions. However, microservices have become a bit more complex.

In a microservices architecture, each service has its own database and logic for handling permissions. This can lead to a lot of duplication and inconsistency in the way permissions are managed across services. also, there will be an issue of sharing the permissions across services.

One way to solve this issue is to use an authorization-as-service. This means that you have a separate service that is responsible for managing all the authorizations for all the services in your architecture.


### POC

Today I will do a quick proof of concept. I will use an open source that provide this functionality, there are a lot, 

#### Some of Open source solutions
- perimfy
- openfga
- casbin
- topaz

#### Cloud solutions
- there are good cloud solutions like [Permit.io](https://www.permit.io)

For today poc I will use [Permify](https://permify.co/).

![permify](https://user-images.githubusercontent.com/34595361/196884110-147862c9-3657-4f07-831c-3e0d0e39eccf.png)
---

1. Run the permify service on docker and expose HTTP and GRPC ports.

![step](/images/journey/auth-1.png)
---

2. Created a new tenant at permify to store our policies

![step](/images/journey/auth-2.png)
---

3. Created our schema, I used here the traditional RBAC model for simplicity. but in the real world and complex apps, there are a lot of models for complex use cases. Actually, Permify is considered as fine-grained access control service inspired by `Google’s Zanzibar`.

    Permify has a gread article about their solution [Here](https://docs.permify.co/permify-overview/authorization-service)

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