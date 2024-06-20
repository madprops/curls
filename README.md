# Curls

![](https://i.imgur.com/frdOwf4.gif)

This is a text status host.

Users claim a `curl` and get a key to be able to update it.

For instance `https://curls.website/funone` would return the current content of the `funone` curl.

The response is always pure text, there is no json or anything.

There is no history, or any other features except hosting the current text.

To view and edit a curl there's some html pages available but you are encouraged to use your own tools to view and edit.

Edit:

```
curl -X POST -d "curl=mycurl&key=mykey&content=mycontent" https://curls.website/edit
```

View:

```
curl https://curls.website/[curl]
```

Multiple:

```
curl -X POST -H "Content-Type: application/json" -d '{"curls":["somecurl","othercurl"]}' http://localhost:5000/curls | jq
```

## Intended Usage

How I think this can be used is by users sharing their curls to others and then they add them to a program. The program would update every added curl every 5 minutes to check for changes. So a user gets an overview of the status of many people.

The status of the people you choose can serve as calls of action or to know about interesting activities happening in real time.

Yes it's similar to Twitter except there's no history or other kind of privacy invading mechanisms in place. And there's no CORS restrictions, reading and editing the curl status should be as easy as possible, from within any application.

## Dashboard

I have my own implementation of a program that uses curls.

It is located in `https://curls.website/dashboard`.

## Accounts

There are no accounts. You claim a curl once, you are given the key once.

There are no mechanisms to recover a lost key.