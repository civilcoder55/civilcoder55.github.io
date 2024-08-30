---
title: "NestJS Standalone Worker"
date: 2024-08-29T20:11:50+03:00
draft: false
description: "Create a standalone worker using NestJS to handle background tasks and offload heavy processing from the main application. 🚀"
image: "/images/nest/logo.svg"
imageBig: "/images/nest/logo.webp"
categories: ["nestjs", "worker", "background-tasks", "bullmq"]
avatar: "/images/avatar.webp"
---

### Introduction 🚀

When building an API server, it's crucial to keep the request-response cycle as short as possible to serve responses fast. However, some tasks, like sending emails, processing images, or running long queries, can be time-consuming. In these cases, it's better to handle these tasks in the background rather than keeping the client waiting.

In NestJS Common applications, this can be achieved using the BullMQ library, a Redis-based queue for Node.js.

By default, BullMQ runs the `worker` (also known as the `consumer` or `processor`) in the same event loop as the main application, which can cause some issues. We'll explore some of these problems and discuss possible solutions.

---

### Let's Dive In 🔍

##### 🛠️ First, Create a new NestJS application with TypeORM and BullMQ to test our goals.
```bash
npm i -g @nestjs/cli
nest new nest-worker
cd nest-worker
npm i --save @nestjs/typeorm typeorm pg
npm i --save @nestjs/bullmq bullmq
```
#

##### 🛠️ Configure the app and creates a simple API with a single endpoint to add a job to a test queue.
###### | 📄 src/app.module.ts
```typescript
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BullModule } from "@nestjs/bullmq";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "postgres",
      logging: true,
    }),
    BullModule.forRoot({
      connection: {
        host: "localhost",
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: "test",
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```
#
###### | 📄  src/app.service.ts

```typescript
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Queue } from "bullmq";

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(
    @InjectQueue("test")
    private readonly queue: Queue
  ) {}

  getHello(): string {
    return "Hello World!";
  }

  async addJob() {
    this.logger.log("Adding job to queue");
    await this.queue.add("testJob", { message: "hello from queue" });
  }
}
```
#
###### | 📄  src/app.controller.ts

```typescript
import { Controller, Get, Post } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post("add-job")
  addJob() {
    return this.appService.addJob();
  }
}
```
![img](/images/nest/2024-08-30_02-55.png)


#
##### 🛠️ Now let's create a new processor to handle the job.
###### | 📄  src/test.processor.ts

```typescript
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";

@Processor("test", { concurrency: 3 })
export class TestProcessor extends WorkerHost {
  private readonly logger = new Logger(TestProcessor.name);

  async process(job: Job<any, any, string>) {
    this.logger.log(`Processing job ${job.id}`);
    this.logger.log(job.data);
  }
}
```
#
##### register the processor in the app module providers
###### src/app.module.ts
```typescript
  providers: [AppService, TestProcessor],
```

![img](/images/nest/2024-08-30_02-59.png)

---

### First Problem: Event Loop Blocking Tasks 🚨

##### 🛠️  Let's simulate an event loop blocking task in the processor.

###### | 📄  src/test.processor.ts
```typescript
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";

@Processor("test", { concurrency: 3 })
export class TestProcessor extends WorkerHost {
  private readonly logger = new Logger(TestProcessor.name);

  async process(job: Job<any, any, string>) {
    this.logger.log(`Processing job ${job.id}`);
    this.logger.log(job.data);

    // event loop blocking code
    while (true) {}
  }
}
```
#
##### 👀 As we can see, the processor will handle the long-running task, blocking the event loop, and the API server will be blocked.

![img](/images/nest/2024-08-30_03-07.gif)

---

### Second Problem: Database Connection Pool 🚨

##### Another problem with this approach is the database connection pool. If processors acquire all database connections, the API server will be blocked until a connection is released. Let's test this case.

#
##### 🛠️ Specify the max number of connections in the TypeORM configuration.
###### | 📄  src/app.module.ts
```typescript
  TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      logging: true,
      extra: { max: 2 },
  }),
```
#
##### 🛠️ Add a simple query to the API controller and a long-running query to the processor.
###### | 📄  src/app.service.ts
```typescript
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { Queue } from "bullmq";
import { DataSource } from "typeorm";

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(
    @InjectQueue("test")
    private readonly queue: Queue,
    @InjectDataSource() private readonly datasource: DataSource
  ) {}

  getHello(): string {
    return "Hello World!";
  }

  async addJob() {
    await this.datasource.query("SELECT NOW()");

    this.logger.log("Adding job to queue");

    await this.queue.add("testJob", { message: "hello from queue" });
  }
}
```
#
###### | 📄  src/test.processor.ts
```typescript
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Processor("test", { concurrency: 3 })
export class TestProcessor extends WorkerHost {
  private readonly logger = new Logger(TestProcessor.name);

  constructor(@InjectDataSource() private readonly datasource: DataSource) {
    super();
  }

  async process(job: Job<any, any, string>) {
    this.logger.log(`Processing job ${job.id}`);
    this.logger.log(job.data);

    // long running query
    await this.datasource.query("SELECT pg_sleep(1 * 60)");
  }
}
```
#
#
##### ℹ️ We have 3 conncurrent processors, and only 2 database connections. If we add 2 jobs to the queue, the third API request will be blocked until a connection is released, 👀 As we see in the GIF below.

![img](/images/nest/2024-08-30_03-25.gif)

---

### A Possible Solution For Problem 2: Separate Database Connection for the processors 💡

##### ℹ️ We can solve this by creating a separate TypeORM datasource for the processors. This way, a long running queries in the processors will not block the API server.

#
###### | 📄 src/app.module.ts
```typescript
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BullModule } from "@nestjs/bullmq";
import { TestProcessor } from "./test.processor";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      name: "API",
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "postgres",
      logging: true,
      extra: { max: 2 },
    }),
    TypeOrmModule.forRoot({
      name: "processor",
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "postgres",
      logging: true,
      extra: { max: 2 },
    }),
    BullModule.forRoot({
      connection: {
        host: "localhost",
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: "test",
    }),
  ],
  controllers: [AppController],
  providers: [AppService, TestProcessor],
})
export class AppModule {}
```
#
###### | 📄  src/test.processor.ts
```typescript
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Processor("test", { concurrency: 3 })
export class TestProcessor extends WorkerHost {
  private readonly logger = new Logger(TestProcessor.name);

  constructor(
    @InjectDataSource("processor") private readonly datasource: DataSource
  ) {
    super();
  }

  async process(job: Job<any, any, string>) {
    this.logger.log(`Processing job ${job.id}`);
    this.logger.log(job.data);

    // long running query
    await this.datasource.query("SELECT pg_sleep(1 * 60)");
  }
}
```
#
###### | 📄 src/app.service.ts
```typescript
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { Queue } from "bullmq";
import { DataSource } from "typeorm";

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(
    @InjectQueue("test")
    private readonly queue: Queue,
    @InjectDataSource("API") private readonly datasource: DataSource
  ) {}

  getHello(): string {
    return "Hello World!";
  }

  async addJob() {
    await this.datasource.query("SELECT NOW()");

    this.logger.log("Adding job to queue");

    await this.queue.add("testJob", { message: "hello from queue" });
  }
}
```
#
##### ℹ️ the processor can process only 2 jobs due to max database connections, but the API will no longer be blocked by the processor queries. Let's test this


![img](/images/nest/2024-08-30_03-34.gif)

##### 👀 As we can see the API is not blocked, and it can queue the jobs even if the processors are running long queries.
#
---

### A Possible Solution For Problem 1: Separate Process 💡

##### ℹ️ We can solve the first problem by running the processor in a separate forked process. 👉🏻 [separate-processes](https://docs.nestjs.com/techniques/queues#separate-processes) 👈🏻 this approach can't utilize dependency injection system and NestJS IOC by default; however. there are some workarounds to make this possible.
#
---

### A Possible Solution For Problem 1: Standalone Worker💡

##### ℹ️ Another solution is to create a standalone worker using NestJS. This way we can run the worker in a separate event loop take advantage of the dependency injection system and NestJS IOC. It's a common NestJS app but without an API server—just a worker responsible for running BullMQ processors.
#
##### ℹ️ The worker still shares the same codebase as your Nest app, and this approach offers benefits like:
- The Worker can be scaled independently from the API server, as a standalone service or deployment in Kubernetes.
- The worker can be deployed on a separate machine, monitored, and managed separately.
- The worker can have its own database connection pool without duplicating the database connection configuration.

#

##### 🛠️ Let's make the worker as a standalone so it can run in a separate event loop.

###### | 📄  src/app.module.ts
```typescript
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BullModule } from "@nestjs/bullmq";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "postgres",
      logging: true,
      extra: { max: 2 },
    }),
    BullModule.registerQueue({
      name: "test",
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```
#
###### 🛠️ Create a new module for the worker.
```bash
nest g module worker
```
#
###### | 📄  src/worker/worker.module.ts

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TestProcessor } from "../test.processor";
import { BullModule } from "@nestjs/bullmq";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "postgres",
      logging: true,
      extra: { max: 2 },
    }),
    BullModule.forRoot({
      connection: {
        host: "localhost",
        port: 6379,
      },
    }),
  ],
  providers: [TestProcessor],
})
export class WorkerModule {}
```
#
##### 🛠️ Create a new entry file for the worker,  similar to the main.ts file.
###### | 📄  src/worker.ts
```typescript
import { NestFactory } from "@nestjs/core";
import { WorkerModule } from "./worker/worker.module";

async function bootstrap() {
  await NestFactory.createApplicationContext(WorkerModule);
}
bootstrap();
```
#
##### ℹ️ We can use the HTTP server, which can be helpful for health checks and metrics, or we can create a standalone NestJS application as we did.
#

##### 🛠️ Create a new `worker-cli.json` file in main directory and add a script in the `package.json` to run the worker.
###### | 📄  worker-cli.json
```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "entryFile": "worker",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```
#
###### | 📄  package.json
```json
{
  "scripts": {
    "worker:dev": "nest start --watch --config worker-cli.json",
    "worker:prod": "node dist/worker"
  }
}
```
#
##### 👀 Result 
![img](/images/nest/2024-08-30_06-48.gif)

----

### 🔬 Auto Load Processors 🔬

##### 🛠️ Now let's do a something cool, lets create a way to autoload all processors in the app and register them.

#
#### ℹ️ ℹ️ The autoloader will mainly do four steps
- Load all processors from a glob pattern using the same importer used in TypeORM 😎
- Get any dependencies for each processor using the metadata system in nestjs
- Get the queue name for each processor.
- Import processors as providers, import and register queues in bullmq module and import dependencies.
#
##### Create a new module called `queue`.
```bash
nest g module queue
```
#
###### | 📄  src/queue/queue.module.ts
```typescript
import { DynamicModule, Module } from "@nestjs/common";
import { BullModule, WorkerHost } from "@nestjs/bullmq";
import { importClassesFromDirectories } from "typeorm/util/DirectoryExportedClassesLoader";

@Module({})
export class QueueModule {
  public static readonly consumers = [];
  public static readonly dependencies = [];
  public static readonly queues = [];

  static async register(options: {
    consumers: string[];
  }): Promise<DynamicModule> {
    const workerClasses = await importClassesFromDirectories(
      { log: console.log } as any,
      options.consumers
    );

    workerClasses.forEach((workerClass) => {
      if (workerClass.prototype instanceof WorkerHost) {
        QueueModule.consumers.push(workerClass);
        QueueModule.dependencies.push(
          ...(Reflect.getMetadata("dependencies", workerClass) || [])
        );
        QueueModule.queues.push(
          Reflect.getMetadata("bullmq:processor_metadata", workerClass)
        );
      }
    });

    return {
      module: QueueModule,
      imports: [
        BullModule.forRoot({
          connection: {
            host: "localhost",
            port: 6379,
          },
        }),
        BullModule.registerQueue(...QueueModule.queues),
        ...QueueModule.dependencies,
      ],
      providers: [...QueueModule.consumers],
    };
  }
}
```
#
##### 🛠️ Remove any bullmq related code from the worker module, Use the queue module, and specify the processors' glob pattern.
###### | 📄  src/worker/worker.module.ts
```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TestProcessor } from "../test.processor";
import { QueueModule } from "src/queue/queue.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "postgres",
      logging: true,
      extra: { max: 2 },
    }),
    QueueModule.register({
      consumers: ["dist/**/*.processor.js"],
    }),
  ],
  providers: [TestProcessor],
})
export class WorkerModule {}
```
#
---
#
#### 👀 The final test 👀 
![img](/images/nest/2024-08-30_07-01.gif)

----

#
| [🔗 Source Code on Github 🔗](https://github.com/civilcoder55/nestjs-standalone-worker)

---
#
#### Don't hesitate to reach out to me if there is any mistake or you have any questions. 🚀