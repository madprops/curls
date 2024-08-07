# Curls

![](https://i.imgur.com/VjrgPIL.gif)

(Notice in this demo how each color has their own set of curls)

(Also notice the $ picker to switch between curls you own)

---

## What is this?

This is a text status host.

Users claim a `curl` and get a key to be able to update it.

For instance `https://curls.merkoba.com/funone` would return the current text of the `funone` curl.

The response is always pure text, there is no json or anything.

There is no history, or any other features except hosting the current text.

To view and change a curl there's some html pages available but you are encouraged to use your own tools to view and change.

---

Change one:

```
curl -X POST -d "curl=mycurl&key=mykey&text=mytext" https://curls.merkoba.com/change
```

If the change was successful it will return "ok".

---

Get current status of one:

```
curl https://curls.merkoba.com/[curl]
```

---

Get data of one or more (json response):

```
curl -X POST -d "curl=somecurl&curl=othercurl" https://curls.merkoba.com/curls
```

---

## Intended Use

How I think this can be used is by users sharing their curls to others and then they add them to a program. The program would update every added curl every 5 minutes to check for changes. So a user gets an overview of the status of many people.

The status of the people you choose can serve as calls of action or to know about interesting activities happening in real time.

Yes it's similar to Twitter except there's no history or other kind of privacy invading mechanisms in place. And there's no CORS restrictions, reading and changing the curl status should be as easy as possible, from within any application.

It can also serve for software to point to pieces of dynamic text.

---

## Accounts

There are no accounts. You claim a curl once, you are given the key once.

There are no mechanisms to recover a lost key.

---

## Dashboard

I have my own implementation of a program that uses curls.

It is located at: `https://curls.merkoba.com/dashboard`

The html template is found [here](https://github.com/madprops/curls/blob/main/server/templates/dashboard.html).

The code is found [here](https://github.com/madprops/curls/tree/main/server/static/dashboard).

### Colors

Each color has their own set of curls. You can use them as profiles.

### Picker

When you make a successful change to a curl, the curl is saved to your picker list.

So you can easily switch between them by clicking the $ button.

---

## Installing

Everything happens inside `/server`

Create a `virtual env` and install dependencies using `requirements.txt`

Run `init_db.sh` to create the sqlite3 database.

Create `captcha_key.txt` and fill it with a secret key for the captcha.

### Development

To run a dev server use `venv/bin/python -m flask run --debug`

To debug quickly create `captcha_cheat.txt` and fill it to use as the captcha.

### Production

Use `gunicorn` to run it in production.

Set up a reverse proxy on `apache`.

Make a `systemd` service to start gunicorn with a non-root user.

### Bundle

The js files in static/dashboard/js get bundled into `bundle.js` when the server starts.

There is a `bundle.py` file that can be called directly to force a bundle.

---

## Rate Limiter

There is a rate limiter to limit all API endpoints to x requests per minute.

This depends on `redis`.

---

## Schema

You can see the current schema [here](https://github.com/madprops/curls/blob/main/server/schema.sql).

It's supposed to remain very simple.