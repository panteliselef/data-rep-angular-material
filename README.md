# DataRepAngularMaterial

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.0.0.

## Docker Production Build

Run `docker build -t angular-frontend .` <br/>

## Docker run

Run `docker run -d -p 80:80 angular-frontent` or use Docker Desktop and run the `angular-frontend` image from there.
<br/>
Command parameters:

- `-d` to run in detached mode
- `-p` to map container port to machine port

## Docker Compose 

### Development
- Run immediate command:
```
$ docker-compose up
```
Use flags: <br/>
- `-d` to run in detached mode ( without prints )
- `--build` to build again (good if changes where made)

### Production
- Run command:
```
$ docker-compose -f docker-compose.yml up
```

## Usefull docker commands
- To run the project open a command line on the root folder (where the docker-compose.yml is located) and type the following command. The `-d` attribute is for running the services in detached mode. If it is not provided the full logs from all services will be printed on the screen.
```
$ docker-compose up
```

- To stop and remove the running services (docker containers) type the following command:
```
$ docker-compose down
```

- You can start, stop and restart a specific service of the docker-compose file by using the respective commands:
```
$ docker-compose start angular-frontend
$ docker-compose stop angular-frontend
$ docker-compose restart angular-frontend
```


## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
