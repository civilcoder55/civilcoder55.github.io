---
title: "Managing Authorization in Microservices"
date: 2024-08-09T20:11:50+03:00
draft: false
description: "Discovering a way to manage authorization and permissions in microservices architecture using authorization-as-a-service 🔐."
topics: ["Journey", "Authorization", "Permissions", "Permify", "Microservices"]
series: "My Software Journey"
thumbnail: "/images/journey/auth-as-service.png"
avatar: "/images/avatar.webp"
---

## Authorization in Microservices

When developing a monolithic application, managing authorization and permissions is a bit easier since you have a single point of control for all authorization and permissions. However, with the rise of microservices, this task becomes more complex.

In a microservices architecture, each service typically has its own database and logic for handling permissions. This can lead to duplication and inconsistency in how permissions are managed across services. Additionally, sharing permissions between services can become problematic.

One way to solve this issue is by using **Authorization-as-a-Service** 🔐. This approach involves creating a separate service dedicated to managing all authorization for the various services within your architecture. This centralizes control, ensuring consistency and simplifying the management of permissions across your microservices. 🌐

### Proof of Concept (POC) 🚀

Today, I'll do a quick proof of concept (POC) to explore authorization management. I'll use an open-source solution that provides this functionality.

There are plenty of options available.

#### Some Open-Source Solutions 🛠️

- permify
- openfga
- casbin
- topaz

#### Cloud Solutions ☁️

- There are good cloud solutions like [Permit.io](https://www.permit.io)

For today's POC, I'll be using [Permify](https://permify.co/). ✅

![permify](https://user-images.githubusercontent.com/34595361/196884110-147862c9-3657-4f07-831c-3e0d0e39eccf.png)

---

1. Run the Permify service on Docker and expose HTTP and gRPC ports.

![Terminal running the Permify container with HTTP and gRPC ports exposed](/images/journey/auth-1.png)

---

2. Created a new tenant in Permify to store our policies.

![HTTP request creating the Permify tenant t1](/images/journey/auth-2.png)

---

3. Created our schema, using the traditional RBAC model for simplicity 🔧. However, in real-world complex applications, there are many models designed to handle complex use cases.

In fact, **Permify** is considered a fine-grained access control service, inspired by `Google’s Zanzibar`. 🌐 This allows for more detailed and flexible permission management, making it suitable for more complex scenarios.

**Permify** has a great article about their solution [Here](https://docs.permify.co/permify-overview/authorization-service)

![Permify schema with user and workspace entities, admin, member, and supervisor relations, and file and report permissions](/images/journey/auth-3.png)

---

![HTTP request writing the schema to the t1 tenant](/images/journey/auth-4.png)

---

4. Attached roles to our users.

![HTTP requests giving user 1 the admin role and user 2 the member role in workspace 1](/images/journey/auth-5.png)

---

5. Created simple Node.js services to check user permissions using gRPC via the Permify SDK.

![Service 1 Express route checking file permissions for both users](/images/journey/auth-6.png)

---

![Service 2 Express route checking report permissions for both users](/images/journey/auth-7.png)

---

6. Created a wrapper to check user permissions.

![Wrapper function that checks a permission through the Permify gRPC client](/images/journey/auth-8.png)

---

7. Final Test

![Terminal output from both services showing which permission checks pass and fail](/images/journey/auth-9.png)
