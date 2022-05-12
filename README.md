# The Continental Restaurant

## i. Introduction

This is a simple restaurant booking software showcasing the use of Quasar, KoaJS, Socket.IO, MongoDB using Mongoose, Redis, Cypress, NGINX and Docker. The project consists of 4 docker containers all managed by a compose.yaml file located in the root directory. 

The first container is the **backend** which houses KoaJS, Redis, Socket.IO and Cypress for the api testing. The second container is the **frontend** which contains the client facing application created using Quasar, Axios and Socket.IO. The third container is the **mongodb** image that will store the data, and lastly the fourth is the **nginx** server image that will help in connecting everything together.

## ii. Installation

#### 1. Git clone the project

- Open a new terminal window or tab and clone the repository from Github

```
$ git clone git@github.com:hotslab/TheContinentalRestaurant.git
```


#### 2. Installing the docker containers
- Go inside the cloned project folder and then run docker-compose as shown below:

```
$ cd TheContinentalRestaurant

$ docker-compose up
```

- Wait for the docker container to finish installing. Please be aware this may take a while.
- This is evident with the npm install in the backend container as the Cypress binary takes a while to download as referenced by one of these [issues](https://github.com/cypress-io/cypress/issues/17652) common with it.
- If it crashes because of any timeouts simply restart the command above and it will pick off where it last was.

#### 3. Seeding the MongoDB database with essential data
- After it has finished installing and starting the docker containers, open another terminal window and log into the backend container to run the database seeder.

```
$ docker exec -it thecontinentalbackend bash

$ npm run seed
```

#### 4. Running unit tests

- In the same terminal window you can paste and run the following command to launch the unit tests for the api.

```
$ npm run ci
```

#### 5. Accessing the website

- On your browser open http://localhost:3050.
- You can browse the site as visitor and even make table bookings for yourself for you to dine in.
- To use more features like receiving real time notifications you can login using the following credentials.

|# | Role |Email | Password |
|---|---| --- | --- |
| 1 | manager | winston@thecontinental.com | secret |
| 2 | user | john@thecontinental.com | secret |  

- These two accounts allow you to see how the application works based on the roles of a manager and a logged in user.



## iii. Architecture

#### 1. Backend

- The backend uses KoaJS as the api server with routing built in as well as controllers that help in managing the requests to these api routes.
- It uses the JWT token system to manage authentification. This allows the api to be used by more than one client facing interface which could be managed by us or other external parties should we provide them access to our api.
- It uses the Mongoose package for MongoDB which helps in defining the ORM structure for the database models, therby ensuring type safety and a standardised format regarding the data structures used.
- The Socket.IO and Redis packages help in providing realtime notifications to users logged into the system as to what is happening in the system, especially to managers who will be managing the tables.
- Cypress is used to test the api in crucial calls to it that would cause severe regressions should they fail.
- Node-cron is used to run a cron like operation that moves users who are on a waiting least to a table of their choice should a place be opened for them if it was cancelled by the previous holders. It also runs a service that closes expired bookings of the previous days to remove clutter.

#### 2. Frontend

- The frontend uses the Quasar framework based on Vue3, a reactive javascript framework written in typescript similar to ReactJS. 
- Quasar provides the addded benefit of creating opportunities to either build an SSR application, a cross platform mobile application for the Android and Apple stores, or a desktop application via Electron.
- Socket.IO is also used to help bring realtime notfication to the user or manager regarding vital information like new bookings or cancellations.

#### 3. NGINX

- The nginx server helps in resolving the hosts of the requests sent between the containers in a production environment.
- It acts as a configurable security layer between our api and the outside world and can help with load balancing.
- It also provides the opportunities of configuring new connections, and in restricting other other undesirable requests.

#### 4. MongoDB
- The Mongodb server is a docker container that houses the MongoDB database, which we interface with using the Mongoose ORM javascript package.
- This No-SQL databse is highly configurable and scalable, helping in storing unique data types that are not possible in traditional SQL databses.
- This makes it suitable for an environment where changes can be volatile and the abilty to be fluid in our data structuring is an essential requirement. 