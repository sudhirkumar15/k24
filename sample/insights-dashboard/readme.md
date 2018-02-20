### Requirements
- Nodejs LTS. Best way to install nodejs is [nvm](https://github.com/creationix/nvm)
- Redis v3

### Installation
Add the following lines to `~/.bashrc`
```
source ~/.nvm/nvm.sh
nvm use v4
```

### Run the following commands
```
apt-get install build-essential
nvm install v4
```

### Dependencies

```
npm install -g yarn bower eslint
bower install
yarn run build
```

### Config
To override default config in `cfg/index.js` add the relevant part to `cfg/development.js`

### Start server
`yarn start`

### Run tests
`yarn test`

### Logs
Logs are created by `bootstrap/logger.js`

### Modules
- Modules are stored in `core` folder.
- Params that the modules need are passed from `core/index.js` while requiring it.
- All core modules are injected into the `app` and get be accessed via `req.app.get('core').module.method`

### Development server
nodemon monitors files for changes and restarts the server on [http://localhost:8080](http://localhost:8080)

`yarn run start:dev`

### Building static resources
`yarn run build` - production build. To be included in commit until we get a build system in place in the not too distant future.

`yarn run build:dev` - to watch for file changes. you know, while development.

### Nginx configuration file.
1. Create a file named `dashboard.com` in `/etc/nginx/sites-available` with the following content
```
upstream dashboard {
    server 127.0.0.1:8080;
}

server {
    listen 0.0.0.0:80;
    server_name dashboard.com dashboard;
    error_log  /var/log/nginx/dashboard.com-error.log error;
    access_log /var/log/nginx/dashboard.log;

    location ~ ^/(assets/|images/|img/|javascript/|js/|css/|stylesheets/|flash/|media/|static/|robots.txt|humans.txt|favicon.ico) {
        root /var/www/dashboard/web/; # change path to reflect location on your system
        access_log off;
        expires 24h;
    }

    # pass the request to the node.js server with the correct headers
    # and much more can be added, see nginx config options
    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header X-NginX-Proxy true;

        proxy_pass http://dashboard/;
        proxy_redirect off;
    }
}
```
2. Enable the site, `ln -s /etc/nginx/sites-available/dashboard.com /etc/nginx/sites-enabled/dashboard.com`
3. Add the following line to `/etc/hosts` file `127.0.1.1   dashboard.com`
4. Restart nginx, `service nginx restart`
5. Start servers
6. Site can be accessed at [dashboard.com](dashboard.com)
