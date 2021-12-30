# discord-botly

A Discord bot framework

## Events

To add client event listeners to botly,
simply pass `eventsDir` to botly `init`
and add a event file in that directory.

The file name should match the event name. (eg. `ready.js`)

The file should have one function as the default export
which will be called when the event is run.

```js
// ./events/ready.js

module.exports = function(client) {
    console.log(`client logged in as ${client.user.tag}`)
}
```
