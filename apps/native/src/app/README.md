1. Kamil decided to name the two directories at this level as:

- (auth)
- (requires-auth)
  The naming is not perfect, another option was to name it something like
- (authentication)
- (authenticated)

but this would make it more difficult to name other similar structures below, for example the: (choose-plan)

2. note that if you navigate like `route.replace(/` and the current directory has the following structure:

```
src
├── app
│   ├── (auth)
│   ├── (main)
│   ├── (other folder)
│   ├── some-screent.sx
```

you will end up falling into (auth).., route. It's because of the alphabetic order used by expo-router
