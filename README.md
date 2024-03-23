# How to import nextjs-session
```bash
yarn add git+ssh://git@github.com:kalytero/nextjs-session.git
npm i git+ssh://git@github.com:kalytero/nextjs-session.git
```

# ENV
It is recommended to set in the deploy environment.
```bash
SESSION_DB_URL="etcd://localhost:2379"
# OR
SESSION_DB_URL="redis://:password@localhost:6379"
```